// const signUpBtn = document.querySelector('#signUpBtn')
// const pageList = document.getElementById('page-list')

// signUpBtn.addEventListener('click', function() {
//     window.location.href = '/register'
// })


document.addEventListener("DOMContentLoaded", () => {


const searchResults = document.getElementById('search-results')
const searchBox = document.getElementById('search-box')
const newsBox = document.getElementById('news-box')
const searchContainer = document.getElementById('search-container')
const newsList = document.getElementById('news-list')

console.log(news)

news.slice().reverse().forEach(n => {
  link = document.createElement('li')
  link.textContent = n.content
  newsList.prepend(link)
})

// searchBox.addEventListener('submit', function (e) {
//   e.preventDefault();

// })
//   const formData = new FormData(this);
//     // console.log(formData)
//   fetch('/search', {
//     method: 'POST',
//     body: new URLSearchParams(formData)
//   })
//   .then(res => res.json())
//   .then(data => {
//     console.log('Server says:', data);
//     console.log(data.length)
//     let list = ''
//     data.forEach(d => {
//         list += `<li><a href='/pdf/${d.slug}'>${d.title} by 
//         ${d.uploaded_by}  -  ${d.uploaded_at.substring(0,10)}</a></li>`
//         // list += `<a href='/pdfs/${d.slug}><li>${d.title} by 
//         // ${d.uploaded_by}  -  ${d.uploaded_at.substring(0,10)}</li></a>`
//     })
//     console.log(list)
//      searchResults.innerHTML = list
//      this.reset()
// //     fetch('/studies', {
// //         method: 'POST',
// //         headers: {
// //     'Content-Type': 'application/json'
// //   },
// //     body: JSON.stringify(data)
// //     })
//     // do something with the response.then
  // });

  let list = ''
    data.forEach(d => {
        list += `<li class='search-result'><a href='/pdf/${d.slug}'>${d.title} by 
        ${d.uploaded_by}  -  ${d.uploaded_at.substring(0,10)}</a></li>`
        // list += `<a href='/pdfs/${d.slug}><li>${d.title} by 
        // ${d.uploaded_by}  -  ${d.uploaded_at.substring(0,10)}</li></a>`
    })
    
    console.log(list)
    searchResults.innerHTML = list

})


if (admins.includes(username)) {
  //Video
  const videoUrl = document.getElementById('featured-video-url')
  const videoDetails = document.getElementById('video-details')
  const videoBtn = document.getElementById('featured-video-btn')
  videoUrl.classList.remove('hidden')
  videoDetails.classList.remove('hidden')
  videoBtn.classList.remove('hidden')
  videoBtn.addEventListener('click', function (e) {
      const type = 1 //Video
      const link = videoUrl.value
      const details  = videoDetails.value
    try {
       fetch('/change-features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ details, type, link })
      }).then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.success)
          videoBtn.style.background = 'red'
      })
    } catch (err) {
      console.error(err)
    }
  })
  const imageUrl = document.getElementById('featured-image-url')
  const imageDetails = document.getElementById('image-details')
  const imageBtn = document.getElementById('featured-image-btn')
  imageUrl.classList.remove('hidden')
  imageDetails.classList.remove('hidden')
  imageBtn.classList.remove('hidden')

  imageBtn.addEventListener('click', function (e) {
      if (!imageUrl.files[0]) return console.log('Please select a file')
   const file = imageUrl.files[0]
    const type = 2
    const details = imageDetails.value
    const link = '/images/featured.jpg'
    const formData = new FormData()
    formData.append('file', file)
    formData.append('link', link)
    formData.append('type', type)
    formData.append('details', details)
        try {
       fetch('/change-feature-image', {
        method: 'POST',
        body: formData
      }).then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.success)
          imageBtn.style.background = 'blue'
      })
    } catch (err) {
      console.error(err)
    }

  })

  const newsDetails = document.getElementById('news-details')
  const newsBtn = document.getElementById('news-btn')
  newsDetails.classList.remove('hidden')
  newsBtn.classList.remove('hidden')
  newsBtn.addEventListener('click', function (e) {
    const details = newsDetails.value
        try {
       fetch('/add-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ details})
      }).then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.success)
          newsBtn.style.background = 'green'
      })
    } catch (err) {
      console.error(err)
    }
  })
}