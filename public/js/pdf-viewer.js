// const url = './pdfs/tickets.pdf'; // Replace with your PDF
const container = document.getElementById('pdf-container');
const comments2 = []; // Simple in-memory comment list
const comments = document.getElementById('comment-layer')
const fname = container.dataset.id
const url = `/pdfs/${fname}`
// console.log(container.dataset)

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

async function renderPDF(url) {
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  console.log(pdf)

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    // viewport.style('height: 500px;')

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.zIndex = '1';
    container.appendChild(canvas);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    // Overlay for comments
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const rectCont = container.getBoundingClientRect()
    //   console.log(container.getBoundingClientRect())
    //   console.log(rect)
    //   console.log('x = ' + e.clientX)
    //   console.log('y = ' + e.clientY)
    //   console.log('scroll top = ' + container.scrollTop)
      const x = e.clientX  - rectCont.left + container.scrollLeft;
         const y = e.clientY + container.scrollTop - rectCont.top;
    //   }

      const comment = prompt('Enter comment:');
      if (comment) {
        const pin = document.createElement('div');
        pin.className = 'comment-pin';
        pin.style.left = `${x}px`;
        pin.style.top = `${y}px`;
        pin.textContent = '💬';
        // pin.title = comment;
        displayCom(pin, comment)
        pin.dataset.tooltip = comment
        pin.dataset.scrollTop = container.scrollTop;
        pin.style.zIndex = '10'
        pin.classList.add('unsaved')
        // comments.appendChild(pin);
        container.appendChild(pin)
        makeDraggable(pin)

        comments2.push({ pageNum, x, y, comment });
        // console.log(comments);
      }
    });
  }
}

// function toggleComments() {
//     const btn = document.getElementById('toggle-com')
//     if (comments.classList.contains('hidden')) {
//         console.log('revealing')
//         comments.classList.toggle('hidden', false)
//         btn.style.backgroundColor = 'green'
//         btn.textContent = 'Comments are ON'

//     } else {
//         console.log('hiding')
//         comments.classList.toggle('hidden', true)
//         btn.style.backgroundColor = 'red'
//         btn.textContent = 'Comments are OFF'
//     }
// }

let showComs = true;
function toggleComments() {
    if (showComs) {
        showComs = false
    document.querySelectorAll(`.comment-pin`).forEach(comment => {
        comment.style.zIndex = '-10'
    })
} else { 
        showComs = true
        document.querySelectorAll(`.comment-pin`).forEach(comment => {
        comment.style.zIndex = '100'})
    }
}

// function makeDraggable(el) {
//   let isDragging = false;
//   let offsetX, offsetY;

//   el.addEventListener('mousedown', (e) => {
//     isDragging = true;
//     el.style.cursor = 'grabbing';
//     // offsetX = e.clientX - el.offsetLeft;
//     // offsetY = e.clientY - el.offsetTop;
//         // Record where you grabbed the element
//     offsetX = e.clientX - el.getBoundingClientRect().left;
//     offsetY = e.clientY - el.getBoundingClientRect().top;
//   });
//   document.addEventListener('mousemove', (e) => {
//     if (!isDragging) return;
//     // const container = document.getElementById('pdf-container');
//     const containerRect = container.getBoundingClientRect();

//     let newX = e.clientX - containerRect.left - offsetX + container.scrollLeft;
//     let newY = e.clientY - containerRect.top - offsetY + container.scrollTop;

//     // Boundaries (optional)
//     newX = Math.max(0, Math.min(newX, container.scrollWidth - el.offsetWidth));
//     newY = Math.max(0, Math.min(newY, container.scrollHeight - el.offsetHeight));

//     el.style.left = `${newX}px`;
//     el.style.top = `${newY}px`;
//   });

//   document.addEventListener('mouseup', () => {
//     if (isDragging) {
//       isDragging = false;
//       el.style.cursor = 'grab';
//     }
//   });

// }
function makeDraggable(el) {
  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent text selection
    isDragging = true;
    el.style.cursor = 'grabbing';

    // Record where you grabbed the element
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const container = document.getElementById('pdf-container');
    const containerRect = container.getBoundingClientRect();

    // Adjust for container's scroll and position
    let newX = e.clientX - containerRect.left + container.scrollLeft - offsetX;
    let newY = e.clientY - containerRect.top + container.scrollTop - offsetY;

    // Optional: Clamp within container bounds
    newX = Math.max(0, Math.min(newX, container.scrollWidth - el.offsetWidth));
    newY = Math.max(0, Math.min(newY, container.scrollHeight - el.offsetHeight));

    el.style.left = `${newX}px`;
    el.style.top = `${newY}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      el.style.cursor = 'grab';
    }
  });
}

const saveComs = document.getElementById('save-coms')
saveComs.addEventListener('click', () => {
    let allComms = []
    document.querySelectorAll('.comment-pin').forEach(p => {
        if (p.classList.contains('unsaved')) {
        allComms.push({ 
            pdf_id: saveComs.dataset.id,
            pagenum: p.dataset.scrollTop,
            x: getComputedStyle(p).left,
            y: getComputedStyle(p).top,
            msg: p.title,
            })
            console.log(allComms)
        }
        })
    
//        get comment data
    fetch(`/submit-comments/${saveComs.dataset.id}`, {
        method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
        body: JSON.stringify(allComms) })
    // }).then(res = res.json()).then( data => {
    //     if (data.success) {
    //         console.log(`comments added`)
    //     } else return console.log('Failed to add comment')

    // })
 
    
})

function renderComs(coms) {
    coms.forEach(com => {
        // console.log(`${com.y + com.x}`)
        const pin = document.createElement('div');
        pin.className = 'comment-pin';
        pin.style.left = com.x;
        pin.style.top = com.y;
        pin.textContent = '💬';
        // pin.title = com.text;
        displayCom(pin, com.text)
        pin.dataset.scrollTop = com.page_number
        pin.style.zIndex = '10'
        // pin.classList.add('unsaved')
        // comments.appendChild(pin);
        container.appendChild(pin)
        makeDraggable(pin)

        comments2.push(com);
        // console.log(comments);
      
    })
}


function displayCom(pin, com) {
    pin.addEventListener('mouseover', e => {
        pin.textContent = com;
        // pin.classList.toggle('tooltip', true)
        // pin.classList.add('tooltip')
        pin.style.backgroundColor = 'grey';
        pin.style.color = 'white'
        pin.style.fontSize = '15px'
        pin.style.opacity = '0.9'
        pin.style.cursor = 'default'
        pin.style.maxWidth = '250px'
    })
    pin.addEventListener('mouseleave', e => {
        pin.textContent = '💬';
        pin.classList.toggle('tooltip', false)
        pin.style.background = 'yellow'
        pin.style.opacity = '0.5'
    })
}


renderPDF(url);
renderComs(coms)