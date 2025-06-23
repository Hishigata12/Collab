document.addEventListener("DOMContentLoaded", () => {
let form = document.getElementById("uploadForm");
let uploadMessage = document.getElementById("uploadMessage");
let uploadMessage2 = document.getElementById("uploadMessage");
let pdfList = document.getElementById('pdf-list')
let jobForm = document.getElementById("jobForm")

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

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
      uploadMessage.style.display = "none";
    }, 3000);
  } catch (err) {
    console.error("Upload error:", err)
    uploadMessage2.textContent = "An error occurred.";
    uploadMessage2.style.display = "block";
  } finally {
    submitButton.disabled = false;
  }
})


document.querySelectorAll('.delete-btn-pdf').forEach(button => {
  button.addEventListener('click', async (e) => {
  const pdfId = button.dataset.id;
  console.log(pdfId)
  if (!confirm('Are you sure you want to delete this PDF?')) return;

  try {
    
    const res = await fetch(`/pdf/${pdfId}`, {
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
      alert('An error occurred.');
    }
  });
});

document.querySelectorAll('.delete-btn-job').forEach(button => {
  button.addEventListener('click', async (e) => {
  const jobID = button.dataset.id;
  console.log(jobID)
  if (!confirm('Are you sure you want to delete this listing?')) return;

  try {
    
    const res = await fetch(`/jobs/${jobID}`, {
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
      alert('An error occurred.');
    }
  });
});
})


function toggleForm(formId) {
    const postForm = document.getElementById('uploadForm');
    const jobForm = document.getElementById('jobForm');

    if (formId === 'form') {
        const shouldShow = postForm.classList.contains('hidden');
        postForm.classList.toggle('hidden', !shouldShow);
        jobForm.classList.add('hidden');
    } else if (formId === 'jobForm') {
        const shouldShow = jobForm.classList.contains('hidden');
        jobForm.classList.toggle('hidden', !shouldShow);
        postForm.classList.add('hidden');
    }
}



