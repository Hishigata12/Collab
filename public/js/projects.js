
const clapBtn = document.getElementById('applaud-btn')
clapBtn.addEventListener('click', async (e) => {
  const id = clapBtn.dataset.id;
  console.log(id)
  fetch(`/give-claps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pdf_id: id })
  }).then(res => res.json())
    .then(data => {
      console.log(data)
      if (data.success) {
        console.log('Clap given successfully');
        clapBtn.textContent = `👏 ${data.claps}`;
      } else {
        console.error('Failed to give clap');
      }
    })
    .catch(err => {
      console.error('Error giving clap:', err);
    });
})

const followBtn = document.getElementById('follow-btn')
followBtn.addEventListener('click', async (e) => {
  const id = followBtn.dataset.id;
  console.log(id)
  fetch(`/follow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: id })
  }).then(res => res.json())
    .then(data => {
      console.log(data)
      if (data.success && data.following) {
        console.log('Followed successfully');
        followBtn.textContent = `Following`;
      }
      else if (data.success && !data.following) {
          followBtn.textContent = `Follow`;
        }
        else {
        console.error('Failed to follow');
        followBtn.textContent = `Login to Follow`;
      }
       document.getElementById('follow-count').textContent = `👤 ${data.subs}`
    })
    .catch(err => {
      console.error('Error following:', err);
    });
})
  
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM fully loaded and parsed');
  fetch(`/isfollowing/${followBtn.dataset.id}`).then(res => res.json()).then(data => {
    if (data.success) {
      if (data.following) {
        followBtn.textContent = `Following`;
      }
      if (!data.following) {
        followBtn.textContent = `Follow`;
      }
    } else followBtn.textContent = `Login to Follow`;
  })
})
  
const reportBtn = document.getElementById('report-btn')
const reportBtns = document.querySelectorAll('.subtle-report')
reportBtns.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const form = document.getElementById('commentForm');
    const rect = e.target.getBoundingClientRect();
    form.style.left = `${rect.left + window.scrollX}px`;
    form.style.top = `${rect.bottom + window.scrollY + 8}px`;
    form.style.display = 'block';
  });
});
// reportBtn.addEventListener('click', async (e) => {
//   const form = document.getElementById('commentForm');

//   // Get button position
//   const rect = e.target.getBoundingClientRect();

//   // Position form near the button
//   form.style.left = `${rect.left + window.scrollX}px`;
//   form.style.top = `${rect.bottom + window.scrollY + 8}px`;

//   // Toggle visibility
//   form.style.display = (form.style.display === 'none' || !form.style.display) ? 'block' : 'none';
// })

// document.addEventListener('click', (event) => {
//   const form = document.getElementById('commentForm');
//   // const button = document.getElementById('showFormBtn');

//   if (!form.contains(event.target) && event.target !== button) {
//     form.style.display = 'none';
//   }
// });

document.getElementById('reportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  console.log({ data, pdf })
  // console.log(pdf)

  try {
    const response = await fetch('/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data, pdf })
    });

    const result = await response.json();
    if (result.success) {
      alert('Report submitted successfully');
      document.getElementById('commentForm').reset();
      document.getElementById('commentForm').style.display = 'none';
    } else {
      alert('Failed to submit report');
    }
  } catch (error) {
    console.error('Error submitting report:', error);
  }
});

