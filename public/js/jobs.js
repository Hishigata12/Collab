document.querySelectorAll('.view-job').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default anchor navigation
    const id = e.currentTarget.dataset.id;

    // Navigate to /job/:id
    fetch(`/jobs/${id}`).then(response => {
        if (!response.ok) throw new Error("Network error")
        return response.json()
    }).then(data => {
        console.log(data)
          // Example: display job data in a div
        const jobDetails = document.getElementById('job-desc');
        jobDetails.innerHTML = `
          <h2>${data.title}</h2>
          <p><strong>Description:</strong> ${data.description}</p>
          <p><strong>Requirements:</strong> ${data.reqs}</p>
          <p><strong>Contact:</strong> ${data.contact}</p>
          <p><strong>Posted by:</strong> ${data.username}</p>
        `;
        const pdfView = document.querySelector('.pdf-viewer');
        pdfView.innerHTML = `
        <embed src="/pdfs/${data.pdf}" type="application/pdf" width="100%" height="600px" />
        `
      })
    })
  });

// searchJob = document.getElementById('search-jobs')
// searchJob.addEventListener('input', () => {
//     fetch('/job-search', {
//         method: "POST",
//         body: {text: input.value}
//     }).then(response => {
//         console.log(response)
//         return response.json()
//     }).then(data)
// })