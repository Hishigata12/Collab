import { createUserCard } from '/components/userCard.js';

const popup = document.getElementById('card-popup-container');

document.querySelectorAll('.user-profile').forEach(p => {
  console.log(p)
  let timeout;
  p.addEventListener('mouseenter', async (e) => {
    const userName = p.dataset.name;
        try {
      const res = await fetch(`/api/users/${userName}`);
      const user = await res.json();
      const card = createUserCard(user);

      popup.innerHTML = '';
      popup.appendChild(card);

      // Position the popup next to the button
      const rect = p.getBoundingClientRect();
      popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
      popup.style.left = `${rect.left + window.scrollX}px`;
      popup.style.display = 'block';
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  });

  p.addEventListener('mouseleave', () => {
    // Delay hiding so user can move mouse onto the card
    timeout = setTimeout(() => {
      popup.style.display = 'none';
    }, 200);
  })
})

popup.addEventListener('mouseenter', () => {
  clearTimeout();
});
popup.addEventListener('mouseleave', () => {
  popup.style.display = 'none';
});