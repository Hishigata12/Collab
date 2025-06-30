document.addEventListener("DOMContentLoaded", () => {
let form = document.getElementById("uploadForm");
let uploadMessage = document.getElementById("uploadMessage");
let uploadMessage2 = document.getElementById("uploadMessage2");
let uploadMessage3 = document.getElementById("uploadMessage3");
let pdfList = document.getElementById('pdf-list')
let jobForm = document.getElementById("jobForm")
let reviewForm = document.getElementById("review-form")
const editPdf = document.getElementById("edit-pdf-form")
const studyType = document.getElementById('study-type')
studyType.addEventListener('change', (e) => {
  console.log(studyType.value)
})

let editPdfID = []



form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  if (!confirm('Are you sure you want to dpublish this study?')) return;

  try {
    const res = await fetch("/upload-pdf", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    // console.log(result)
    if (result.success && result.slug && result.title) {
      // Show animation message
      uploadMessage.textContent = "PDF uploaded successfully!";
      uploadMessage.style.display = "block";

      // Optionally, reset the form
      form.reset();

      // Add new PDF to the list
      const newItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = `/pdf/${result.slug}`;
      link.textContent = result.title;
      newItem.appendChild(link);
      pdfList.prepend(newItem); // Add to top of list

      // Hide message after 3 seconds
      setTimeout(() => {
        uploadMessage.style.display = "none";
      }, 3000);
    } else {
      uploadMessage.textContent = "Upload failed. Try again.";
      uploadMessage.style.display = "block";
    }
  } catch (err) {
    console.error("Upload error:", err);
    uploadMessage.textContent = "An error occurred.";
    uploadMessage.style.display = "block";
  }
});

reviewForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const formData = new FormData(reviewForm)
  try {
    const res = await fetch('/upload-prepublish', {
      method: "POST",
      body: formData,
    })
    const result = await res.json();
    console.log(result)
    if (result.success && result.slug && result.title && result.id) {
      uploadMessage3.textContent = `New study posted successfully id: ${result.id}`
      uploadMessage3.style.display = 'block'
      form.reset()
      setTimeout(() => {
        uploadMessage3.style.display = 'none'
        fetch('/dashboard')
      }, 5000)
    } else {
       uploadMessage.textContent = "Upload failed. Try again.";
       uploadMessage.style.display = "block";
    }
  } catch (err) {
    console.error("Error uploading file", err)
    uploadMessage.textContent = "Upload failed. Try again.";
    uploadMessage.style.display = "block";
  }
})

jobForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(jobForm)
  const submitButton = jobForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const res = await fetch("/post-job", {
      method: "POST",
      body: formData,
    })
    const result = await res.json();
    // console.log(result)
    uploadMessage2.textContent = "Job Listed successfully!"
    uploadMessage2.style.display = "block";

    jobForm.reset()

      // Add new PDF to the list
    const newItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = `/pdf/${result.slug}`;
    link.textContent = result.title;
    newItem.appendChild(link);
    pdfList.prepend(newItem); // Add to top of list

    // Hide message after 3 seconds
    setTimeout(() => {
      uploadMessage2.style.display = "none";
    }, 3000);
  } catch (err) {
    console.error("Upload error:", err)
    uploadMessage2.textContent = "An error occurred.";
    uploadMessage2.style.display = "block";
  } finally {
    submitButton.disabled = false;
  }
})

editPdf.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(editPdf)
  
  try {
    const res = await fetch(`/pdf/edit/${editPdfID}`, {
      method: "POST",
      body: formData,
    })
    const result = await res.json();
    uploadMessage3.textContent = "Study modified successfully!"
    uploadMessage3.style.display = "block";


    setTimeout(() => {
      uploadMessage3.style.display = "none";
    }, 3000);
  } catch (err) {
  editPdf.reset()
   console.error("Upload error:", err)
    uploadMessage2.textContent = "An error occurred.";
    uploadMessage2.style.display = "block";
  }
})

function addDeleteButtons(type) {
  document.querySelectorAll(`.delete-btn-${type}`).forEach(button => {
  button.classList.add('transparent')
  button.addEventListener('click', async (e) => {
  const pdfId = button.dataset.id;
  console.log(pdfId)
  if (!confirm('Are you sure you want to delete this PDF?')) return;

  try {
    console.log(`/${type}/delete/${pdfId}`,)
    const res = await fetch(`/${type}/delete/${pdfId}`, {
      method: 'DELETE',
    });

    const result = await res.json();
    if (result.success) {
      // Remove item from DOM
      const li = button.closest('li');
      li.remove();
    } else {
      alert('Failed to delete PDF.');
    }
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred while trying to delete.');
    }
  });
});
}

addDeleteButtons('pdf')
addDeleteButtons('jobs')
addDeleteButtons('feedback')

// document.querySelectorAll('.delete-btn-pdf').forEach(button => {
//   button.classList.add('transparent')
//   button.addEventListener('click', async (e) => {
//   const pdfId = button.dataset.id;
//   console.log(pdfId)
//   if (!confirm('Are you sure you want to delete this PDF?')) return;

//   try {
    
//     const res = await fetch(`/pdf/delete/${pdfId}`, {
//       method: 'DELETE',
//     });

//     const result = await res.json();
//     if (result.success) {
//       // Remove item from DOM
//       const li = button.closest('li');
//       li.remove();
//     } else {
//       alert('Failed to delete PDF.');
//     }
//     } catch (err) {
//       console.error('Delete error:', err);
//       alert('An error occurred.');
//     }
//   });
// });

// document.querySelectorAll('.delete-btn-job').forEach(button => {
//   button.addEventListener('click', async (e) => {
//   const jobID = button.dataset.id;
//   console.log(jobID)
//   if (!confirm('Are you sure you want to delete this listing?')) return;

//   try {
    
//     const res = await fetch(`/jobs/delete/${jobID}`, {
//       method: 'DELETE',
//     });

//     const result = await res.json();
//     if (result.success) {
//       // Remove item from DOM
//       const li = button.closest('li');
//       li.remove();
//     } else {
//       alert('Failed to delete PDF.');
//     }
//     } catch (err) {
//       console.error('Delete error:', err);
//       alert('An error occurred.');
//     }
//   });
// });

document.querySelectorAll('.edit-btn-pdf').forEach(button => {
  button.addEventListener('click', async (e) => {

  editPdfID = button.dataset.id;
  console.log(editPdfID)

  const formDiv = document.getElementById('form-div')
  if (!form.classList.contains('hidden')) form.classList.toggle('hidden')
  if (!jobForm.classList.contains('hidden')) jobForm.classList.toggle('hidden')
  if (editPdf.classList.contains('hidden')) editPdf.classList.toggle('hidden')

  });
});

const textarea = document.getElementById("study-desc");
const charCount = document.getElementById("char-count");
const maxLength = textarea.getAttribute("maxlength");

textarea.addEventListener("input", () => {
  const remaining = maxLength - textarea.value.length;
  charCount.textContent = `${remaining} characters remaining`;
});

})


function toggleForm(formId) {
    const postForm = document.getElementById('uploadForm');
    const jobForm = document.getElementById('jobForm');
    const reviewForm = document.getElementById('review-form')

    if (formId === 'form') {
        const shouldShow = postForm.classList.contains('hidden');
        postForm.classList.toggle('hidden', !shouldShow);
        jobForm.classList.add('hidden');
        reviewForm.classList.add('hidden')
    } else if (formId === 'jobForm') {
        const shouldShow = jobForm.classList.contains('hidden');
        jobForm.classList.toggle('hidden', !shouldShow);
        postForm.classList.add('hidden');
        reviewForm.classList.add('hidden')
    } else if (formId === 'reviewForm') { 
        const shouldShow = reviewForm.classList.contains('hidden')
        reviewForm.classList.toggle('hidden', !shouldShow)
        postForm.classList.add('hidden')
        jobForm.classList.add('hidden');
    }
}




