
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
    }
  })
})
  

