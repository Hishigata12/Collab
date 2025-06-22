// const searchBox = document.getElementById('search-box')

// searchBox.addEventListener('submit', function (e) {
//   e.preventDefault();
//   const formData = new FormData(this);
//     // console.log(formData)
//   fetch('/search', {
//     method: 'POST',
//     body: new URLSearchParams(formData)
//   })
//   .then(res => res.json())
//   .then(data => {
//     console.log('Server says:', data);
//     fetch('/studies', {
//         method: 'POST',
//         headers: {
//     'Content-Type': 'application/json'
//   },
//     body: JSON.stringify(data)
//     })
//     // do something with the response
//   });
// });