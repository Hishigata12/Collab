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
showArticles()
showJobs()


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



})
