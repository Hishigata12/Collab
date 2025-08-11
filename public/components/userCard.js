export function createUserCard(user) {
  const template = document.createElement('template');

  template.innerHTML = `
    <div class="user-card">
      <img src="${user.avatar || '/images/default.jpg'}" alt="Avatar" class="user-avatar" />
      <div class="user-info">
        <h3 class="user-name">${user.name}</h3>
        <p class="user-role">${user.location || 'Member'}</p>
      </div>
      <div>
      <p> ${user.email}</p>}
      <a href="${user.website}" target="_blank">Site</a>
    </div>
  `.trim();

  return template.content.firstChild;
}
