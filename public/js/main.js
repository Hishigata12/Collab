// const signUpBtn = document.querySelector('#signUpBtn')
// const pageList = document.getElementById('page-list')

// signUpBtn.addEventListener('click', function() {
//     window.location.href = '/register'
// })

const searchResults = document.getElementById('search-results')
const searchBox = document.getElementById('search-box')

searchBox.addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(this);
    // console.log(formData)
  fetch('/search', {
    method: 'POST',
    body: new URLSearchParams(formData)
  })
  .then(res => res.json())
  .then(data => {
    console.log('Server says:', data);
    console.log(data.length)
    let list = ''
    data.forEach(d => {
        list += `<li><a href='/pdf/${d.slug}'>${d.title} by 
        ${d.uploaded_by}  -  ${d.uploaded_at.substring(0,10)}</a></li>`
        // list += `<a href='/pdfs/${d.slug}><li>${d.title} by 
        // ${d.uploaded_by}  -  ${d.uploaded_at.substring(0,10)}</li></a>`
    })
    console.log(list)
     searchResults.innerHTML = list
     this.reset()
//     fetch('/studies', {
//         method: 'POST',
//         headers: {
//     'Content-Type': 'application/json'
//   },
//     body: JSON.stringify(data)
//     })
    // do something with the response
  });
});



