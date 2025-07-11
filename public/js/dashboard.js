document.addEventListener("DOMContentLoaded", () => {
let articleForm = document.getElementById("uploadForm");
let uploadMessage = document.getElementById("uploadMessage");
let uploadMessage2 = document.getElementById("uploadMessage2");
let uploadMessage3 = document.getElementById("uploadMessage3");
let pdfList = document.getElementById('pdf-list')
let jobForm = document.getElementById("jobForm")
let reviewForm = document.getElementById("review-form")
const editPdf = document.getElementById("edit-pdf-form")
const jobList = document.getElementById('job-postings');
let profileForm = document.getElementById('about-me')

let editPdfID = []

function showArticles() {
  const pdfList = document.getElementById('pdf-list');
  pdfList.innerHTML = '';
  pdfs.forEach(pdf => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = `/pdf/${pdf.slug}`;
    link.textContent = pdf.title;
    link.dataset.fname = '/pdfs/' + pdf.filename;
    link.dataset.title = pdf.title;
    link.dataset.authors = pdf.authors;
    link.dataset.description = pdf.description;
    link.classList.add('pdf-link');
    
    // Add delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-btn-pdf");
    deleteBtn.dataset.id = pdf.id;

    //add edit button
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn-pdf")
    editBtn.textContent = '⚙️'
    editBtn.dataset.id = pdf.id;

    li.appendChild(link);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    pdfList.appendChild(li);
  })
}

function showJobs() {
  const jobList = document.getElementById('job-postings');
  jobList.innerHTML = '';
  jobs.forEach(job => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = `/jobs/${job.id}`;
    link.textContent = job.title;
    link.classList.add('view-job');
    link.classList.add('pdf-link')
    link.dataset.id = job.id;
    link.dataset.fname = '/pdfs/' + job.pdf;

    // Add delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-btn-jobs");
    deleteBtn.classList.add('transparent')
    deleteBtn.dataset.id = job.id;

    li.appendChild(link);
    li.appendChild(deleteBtn);
    jobList.appendChild(li);
  })
}

showArticles()
showJobs()


articleForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(articleForm);
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
      articleForm.reset();

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
      reviewForm.reset()
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

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(profileForm);
  console.log(formData)
  const name = document.getElementById('name-text').value
  const surname = document.getElementById('surname-text').value
  const email = document.getElementById('email-text').value
  const about = document.getElementById('about-text').value
  data = { name: name,
     surname: surname,
      email: email }
  try {
    const res = await fetch('/profile/edit', {
      method: 'POST',
        headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      uploadMessage4.textContent = "Profile updated successfully!";
      uploadMessage4.style.display = "block";
      setTimeout(() => {
        uploadMessage4.style.display = "none";
      }, 3000);
    } else {
      uploadMessage4.textContent = "Failed to update profile.";
      uploadMessage4.style.display = "block";
    } 
  } catch (err) {
    console.error("Profile update error:", err);
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
  if (!articleForm.classList.contains('hidden')) articleForm.classList.toggle('hidden')
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




const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const preview = document.getElementById('pdf-preview');
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const links = document.querySelectorAll('.pdf-link')


links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        const url = link.dataset.fname;
        console.log(url);

        preview.style.display = 'block';
        // showInfo.style.display = 'block';
        
        // t = document.createElement('h3');
        // a = document.createElement('p');
        // d = document.createElement('p');
        // t.textContent = link.dataset.title;
        // a2 = link.dataset.authors.replace(/,/g, ', ');
        // a3 = a2.split(' ').map(author => author.charAt(0).toUpperCase() + author.slice(1)).join(' ');
        // a.textContent = a3
        // d.textContent = link.dataset.description;
        // a.style.fontStyle = 'italic';
        // showTitle.appendChild(t);
        // showAuthors.appendChild(a);
        // showDescription.appendChild(d);

        // createElement('h3', showTitle, link.dataset.title);
        // createElement('p', showAuthors, link.dataset.authors);
        // createElement('p', showDescription, link.dataset.description);

        pdfjsLib.getDocument(url).promise.then(pdf => {
        return pdf.getPage(1);
        }).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        page.render(renderContext);
        }).catch(err => {
        console.error('PDF load error:', err);
        });
    });

    link.addEventListener('mouseleave', () => {
        preview.style.display = 'none';
        // showInfo.style.display = 'none';
        // showTitle.innerHTML = '';
        // showAuthors.innerHTML = ''; 
        // showDescription.innerHTML = '';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});

// RIGHT PANEL
const affForm = document.getElementById('affiliations')
affForm.addEventListener('submit', async (e) => {
    e.preventDefault();

  const formData = new FormData(affForm);

  try {
    const res = await fetch("/add-aff", {
      method: "POST",
      //   headers: {
      //   'Content-Type': 'application/json'
      // },
      body: formData,
    });
    const result = await res.json();
    // console.log(result)
    if (result.success) {
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    }

  } catch (err) {
    console.error("Upload error:", err);
    uploadMessage.textContent = "An error occurred.";
    uploadMessage.style.display = "block";
  }
})

function showAffiliations() {
  const currentDiv = document.getElementById('current-div')
  const pastDiv = document.getElementById('past-div')
  const linkDiv = document.getElementById('link-div')
  console.log(linkDiv)
  laff.forEach(l => {
    const a = document.createElement('a')
    a.href = l.link
    a.textContent = l.link
    linkDiv.appendChild(a)
  })
  caff.forEach(c => {
    const d = document.createElement('p')
    d.textContent = c.aff;
    currentDiv.appendChild(d)
  })
   paff.forEach(p => {
    const e = document.createElement('p')
    e.textContent = p.aff;
    pastDiv.appendChild(e)
  })
}

  showAffiliations()

})

function toggleForm(formId) {
    const postForm = document.getElementById('uploadForm');
    const jobForm = document.getElementById('jobForm');
    const reviewForm = document.getElementById('review-form')
    const profileForm = document.getElementById('about-me')
    const affForm = document.getElementById('affiliations')

    if (formId === 'articleForm') {
        const shouldShow = postForm.classList.contains('hidden');
        postForm.classList.toggle('hidden', !shouldShow);
        jobForm.classList.add('hidden');
        reviewForm.classList.add('hidden')
        profileForm.classList.add('hidden')
        affForm.classList.add('hidden')
    } else if (formId === 'jobForm') {
        const shouldShow = jobForm.classList.contains('hidden');
        jobForm.classList.toggle('hidden', !shouldShow);
        postForm.classList.add('hidden');
        reviewForm.classList.add('hidden')
        profileForm.classList.add('hidden')
        affForm.classList.add('hidden')
    } else if (formId === 'reviewForm') { 
        const shouldShow = reviewForm.classList.contains('hidden')
        reviewForm.classList.toggle('hidden', !shouldShow)
        postForm.classList.add('hidden')
        jobForm.classList.add('hidden');
        profileForm.classList.add('hidden')
        affForm.classList.add('hidden')
    } else if (formId === 'profileForm') {
      const shouldShow = profileForm.classList.contains('hidden')
      profileForm.classList.toggle('hidden', !shouldShow)
      postForm.classList.add('hidden')
      jobForm.classList.add('hidden');
      reviewForm.classList.add('hidden')
      affForm.classList.add('hidden')
    } else if (formId === 'affForm') {
        const shouldShow = affForm.classList.contains('hidden')
        affForm.classList.toggle('hidden', !shouldShow)
        postForm.classList.add('hidden')
        jobForm.classList.add('hidden');
        profileForm.classList.add('hidden')
        reviewForm.classList.add('hidden')
    }
}