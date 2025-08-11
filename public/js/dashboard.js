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
const editFeedback = document.getElementById('edit-feedback-form')
const studyType = document.getElementById('study-type')
const modal = document.getElementById('modal');
const uploadTimer = document.getElementById('upload-timer')
let badgeForm = document.getElementById('update-profile')

let editPdfID = []

function showArticles() {
  const pdfList = document.getElementById('pdf-list');
  pdfList.innerHTML = '';
  pdfs.forEach(pdf => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    const p = document.createElement('p')
    p.style.display = 'inline'
    p.textContent = ' - '
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
    editBtn.classList.add('transparent')
    editBtn.textContent = '⚙️'
    editBtn.dataset.id = pdf.id;
    editBtn.dataset.name = pdf.title

    li.appendChild(link);
    li.appendChild(p)
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
    const p = document.createElement('p')
    p.style.display = 'inline'
    p.textContent = ' - '
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
    li.appendChild(p)
    li.appendChild(deleteBtn);
    jobList.appendChild(li);
  })
}

function showFeedback() {
  const feedbackList = document.getElementById('prepublish-list')
  feedbackList.innerHTML = '';
  reviews.forEach(r => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    const p = document.createElement('p')
    p.style.display = 'inline'
    p.textContent = ' - '
    link.href = `/feedback/${r.slug}`;
    link.textContent = r.title;
    link.classList.add('pdf-link')
    link.dataset.id = r.id;
    link.dataset.fname = '/pdfs/' + r.filename;

    // Add delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-btn-jobs");
    deleteBtn.classList.add('transparent')
    deleteBtn.dataset.id = r.id;

       //add edit button
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn-feedback")
    editBtn.classList.add('transparent')
    editBtn.textContent = '⚙️'
    editBtn.dataset.id = r.id;
    editBtn.dataset.name = r.title

    li.appendChild(link);
    li.appendChild(p)
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    feedbackList.appendChild(li);
  })
}


showArticles()
showJobs()
showFeedback()


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
      timer(true)
    } else {
     timer(false)
    }
  } catch (err) {
    console.error("Upload error:", err);
   timer(false)
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
  
      reviewForm.reset()
      timer(true)
    } else {
     timer(false)
    }
  } catch (err) {
    console.error("Error uploading file", err)
   timer(false)
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
    timer(true)

    jobForm.reset()

      // Add new PDF to the list
    const newItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = `/pdf/${result.slug}`;
    link.textContent = result.title;
    newItem.appendChild(link);
    pdfList.prepend(newItem); // Add to top of list

    // Hide message after 3 seconds

  } catch (err) {
    console.error("Upload error:", err)
   timer(false)
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
     timer(true)
    } else {
     timer(false)
    } 
  } catch (err) {
    console.error("Profile update error:", err);
    }
  })

badgeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
    const formData = new FormData(reviewForm)
    console.log(document.getElementById('badge-location').value)
  try {
    const res = await fetch('/update-profile', {
      method: "POST",
      body: formData,
    })
    const result = await res.json();
    console.log(result)
    if (result.success) {
      reviewForm.reset()
      timer(true)
    } else {
     timer(false)
    }
  } catch (err) {
    console.error("Error uploading file", err)
   timer(false)
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
    editPdf.reset()
    if (result.success) {
      timer(true)
    } else {
      timer(false)
    }
    // uploadMessage3.textContent = "Study modified successfully!"
    // uploadMessage3.style.display = "block";


    // setTimeout(() => {
    //   uploadMessage3.style.display = "none";
    // }, 3000);
    // modal.style.display = 'block'
    // document.body.style.overflow = 'hidden'
    // setTimeout(() => {
    //   modal.style.display = 'none'
    //   document.body.style.overflow = 'auto'
    // })
  } catch (err) {
   console.error("Upload error:", err)
   timer(false)
  }
})



function addDeleteButtons(type) {
  document.querySelectorAll(`.delete-btn-${type}`).forEach(button => {
  button.classList.add('transparent')
  button.addEventListener('click', async (e) => {
  const pdfId = button.dataset.id;
  // console.log(pdfId)
  if (!confirm('Are you sure you want to delete this PDF?')) return;

  try {
    // console.log(`/${type}/delete/${pdfId}`,)
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
  makeTrans(button)
});
}

function makeTrans(button) {
    button.addEventListener('mouseenter', async (e) => {
    button.classList.remove('transparent')
  })
  button.addEventListener('mouseleave', async (e) => {
    button.classList.add('transparent')
  })
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
let editPdfCheck = 0;

document.querySelectorAll('.edit-btn-pdf').forEach(button => {
  button.addEventListener('click', async (e) => {

  editPdfID = button.dataset.id;
  // console.log(editPdfID)
  // console.log(editPdfCheck)
  const head = document.getElementById('edit-title')
  head.textContent = `Currently editting: ${button.dataset.name}`
  if (editPdfCheck == editPdfID) {
    editPdf.classList.add('hidden')
    editPdfCheck = 0;
  } else {
    editPdf.classList.remove('hidden')
    editPdfCheck = editPdfID
  }
 
  const formDiv = document.getElementById('form-div')
  if (!articleForm.classList.contains('hidden')) articleForm.classList.toggle('hidden')
  if (!jobForm.classList.contains('hidden')) jobForm.classList.toggle('hidden')
  if (!reviewForm.classList.contains('hidden')) reviewForm.classList.toggle('hidden')
  // if (editPdf.classList.contains('hidden')) editPdf.classList.toggle('hidden')
  if (!editFeedback.classList.contains('hidden')) editFeedback.classList.toggle('hidden')
  });
 makeTrans(button)
});

let editFeedbackCheck = 0;

document.querySelectorAll('.edit-btn-feedback').forEach(button => {
  button.addEventListener('click', async (e) => {

  editPdfID = button.dataset.id;

  const head = document.getElementById('edit-title-f')
  head.textContent = `Currently editting: ${button.dataset.name}`
  if (editFeedbackCheck == editPdfID) {
    editFeedback.classList.add('hidden')
    editPdfCheck = 0;
  } else {
    editFeedback.classList.remove('hidden')
    editPdfCheck = editPdfID
  }
  
  const formDiv = document.getElementById('form-div')
  if (!articleForm.classList.contains('hidden')) articleForm.classList.toggle('hidden')
  if (!jobForm.classList.contains('hidden')) jobForm.classList.toggle('hidden')
  if (!reviewForm.classList.contains('hidden')) reviewForm.classList.toggle('hidden')
  // if (editPdf.classList.contains('hidden')) editPdf.classList.toggle('hidden')
  if (!editPdf.classList.contains('hidden')) editPdf.classList.toggle('hidden')
  });
makeTrans(button)
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
        // console.log(url);

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
      timer(true)
    }

  } catch (err) {
    console.error("Upload error:", err);
    timer(false)
  }
})

function showAffiliations() {
  const currentDiv = document.getElementById('current-div')
  const pastDiv = document.getElementById('past-div')
  const linkDiv = document.getElementById('link-div')
  // console.log(linkDiv)
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

studyType.addEventListener('change', function() {
  const replicationDiv = document.getElementById('replication')
  const originalDiv = document.getElementById('original-div')
  if (this.value == 4) {
    replicationDiv.classList.remove('hidden')
  } else {
    replicationDiv.classList.add('hidden')
  }
  if (this.value == 1) {
    originalDiv.classList.remove('hidden')
  } else {
    originalDiv.classList.add('hidden')
  }
})

})

function toggleForm(formId) {
    const postForm = document.getElementById('uploadForm');
    const jobForm = document.getElementById('jobForm');
    const reviewForm = document.getElementById('review-form')
    const profileForm = document.getElementById('about-me')
    const affForm = document.getElementById('affiliations')
    const badgeForm = document.getElementById('update-profile')
 
// refactor this into a for loop
    if (formId === 'articleForm') {
        const shouldShow = postForm.classList.contains('hidden');
        postForm.classList.toggle('hidden', !shouldShow);
        jobForm.classList.add('hidden');
        reviewForm.classList.add('hidden')
        profileForm.classList.add('hidden')
        affForm.classList.add('hidden')
         badgeForm.classList.add('hidden')
    } else if (formId === 'jobForm') {
        const shouldShow = jobForm.classList.contains('hidden');
        jobForm.classList.toggle('hidden', !shouldShow);
        postForm.classList.add('hidden');
        reviewForm.classList.add('hidden')
        profileForm.classList.add('hidden')
        affForm.classList.add('hidden')
         badgeForm.classList.add('hidden')
    } else if (formId === 'reviewForm') { 
        const shouldShow = reviewForm.classList.contains('hidden')
        reviewForm.classList.toggle('hidden', !shouldShow)
        postForm.classList.add('hidden')
        jobForm.classList.add('hidden');
        profileForm.classList.add('hidden')
        affForm.classList.add('hidden')
         badgeForm.classList.add('hidden')
    } else if (formId === 'profileForm') {
      const shouldShow = profileForm.classList.contains('hidden')
      profileForm.classList.toggle('hidden', !shouldShow)
      postForm.classList.add('hidden')
      jobForm.classList.add('hidden');
      reviewForm.classList.add('hidden')
      affForm.classList.add('hidden')
       badgeForm.classList.add('hidden')
    } else if (formId === 'affForm') {
        const shouldShow = affForm.classList.contains('hidden')
        affForm.classList.toggle('hidden', !shouldShow)
        postForm.classList.add('hidden')
        jobForm.classList.add('hidden');
        profileForm.classList.add('hidden')
        reviewForm.classList.add('hidden')
        badgeForm.classList.add('hidden')
    }   else if (formId === 'badgeForm') {
        const shouldShow = badgeForm.classList.contains('hidden');
        badgeForm.classList.toggle('hidden', !shouldShow);
        postForm.classList.add('hidden');
        jobForm.classList.add('hidden');
        reviewForm.classList.add('hidden')
        profileForm.classList.add('hidden')
        affForm.classList.add('hidden')
    } 
}


function timer(success) {
  const uploadMessage = document.getElementById('uploadMessage')
  if (success) {
    uploadMessage.textContent = "Upload SUCCESS"
    uploadMessage.style.color = 'green'
  } else {
    uploadMessage.textContent = "Upload FAILED"
    uploadMessage.style.color = 'red'
  }
  const uploadTimer = document.getElementById('upload-timer')
    let timeLeft = 5;

  uploadTimer.textContent = timeLeft; // Set initial value
  modal.style.display = 'block'
  const timer1 = setInterval(() => {
    timeLeft--;
    uploadTimer.textContent = timeLeft;

    if (timeLeft <= 1) {
      clearInterval(timer1);
      modal.style.display = 'none'
      if (success) {
      fetch('/dashboard')
      }
    }
  }, 1000); // Update every 1 second
}
