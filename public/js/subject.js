// const { createElement } = require("react");

console.log(pdfs)

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const links = document.querySelectorAll('.list-doc');
const preview = document.getElementById('pdf-preview');
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const showTitle = document.getElementById('title-preview');
const showAuthors = document.getElementById('authors-preview');
const showDescription = document.getElementById('description-preview');
const showInfo = document.getElementById('preview-info');
const addSearch = document.getElementById('add-search');

let t, a, d, a2, a3;
let searchBars = 1;
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        const url = link.dataset.fname;
        console.log(url);

        preview.style.display = 'block';
        showInfo.style.display = 'block';
        
        t = document.createElement('h3');
        a = document.createElement('p');
        d = document.createElement('p');
        t.textContent = link.dataset.title;
        a2 = link.dataset.authors.replace(/,/g, ', ');
        a3 = a2.split(' ').map(author => author.charAt(0).toUpperCase() + author.slice(1)).join(' ');
        a.textContent = a3
        d.textContent = link.dataset.description;
        a.style.fontStyle = 'italic';
        showTitle.appendChild(t);
        showAuthors.appendChild(a);
        showDescription.appendChild(d);

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
        showInfo.style.display = 'none';
        showTitle.innerHTML = '';
        showAuthors.innerHTML = ''; 
        showDescription.innerHTML = '';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});

addSearch.addEventListener('click', (e) => {
    e.preventDefault();
    // console.log(searchBars)
    if (searchBars < 5) {
        searchBars++;
        const newSearch = document.createElement('input');
        newSearch.type = 'text';
        newSearch.name = `query${searchBars}`
        newSearch.placeholder = 'And...';
        document.getElementById('search-bars').appendChild(newSearch);
        
        newSearch.addEventListener('input', () => {
            const query = newSearch.value.toLowerCase();
            links.forEach(link => {
                const title = link.dataset.title.toLowerCase();
                const authors = link.dataset.authors.toLowerCase();
                if (title.includes(query) || authors.includes(query)) {
                    link.style.display = '';
                } else {
                    link.style.display = 'none';
                }
            });
        });
    }
    if (searchBars > 1) {
    document.getElementById('remove-search').classList.toggle('hidden', false)
}
})

document.getElementById('remove-search').addEventListener('click', (e) => {
    e.preventDefault();
    if (searchBars > 1) {
        searchBars--;
        const searchBarsDiv = document.getElementById('search-bars');
        const lastSearch = searchBarsDiv.lastElementChild;
        if (lastSearch) {
            searchBarsDiv.removeChild(lastSearch);
        }
    }
    if (searchBars === 1) {
        document.getElementById('remove-search').classList.toggle('hidden', true);
    }
})