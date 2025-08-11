import { createUserCard } from '../components/userCard.js';

fetch('/api/users')
  .then(res => res.json())
  .then(users => {
    const container = document.getElementById('card-container');
    users.forEach(user => {
      const card = createUserCard(user);
      container.appendChild(card);
    });
  })
  .catch(err => console.error('Failed to load users:', err));
