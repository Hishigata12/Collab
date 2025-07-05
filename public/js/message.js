const socket = io(); // io('https://theshape.org:3500)
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const chatWindow = document.getElementById('chat-window');
const conversationList = document.getElementById('conversation-list');
const newChatToggle = document.getElementById('new-chat-toggle');
const newChatBox = document.getElementById('new-chat-box');
const startChatBtn = document.getElementById('start-chat-btn');
const newChatUserInput = document.getElementById('new-chat-user');
const chatPartner = document.getElementById('chat-partner')
const chatBody = document.getElementById('chat-body')
const chatWidget = document.getElementById('chat-widget')

let activeChatUser = null;
let messageOn = false;

// Start new chat
newChatToggle.addEventListener('click', () => {
  newChatBox.classList.toggle('hidden');
  chatWindow.classList.add('hidden');
//   toggleChat()
});

startChatBtn.addEventListener('click', () => {
  const targetUser = newChatUserInput.value.trim();
  if (!targetUser) return;
  activeChatUser = targetUser;
  console.log(activeChatUser)
  newChatBox.classList.add('hidden');
  chatWindow.classList.remove('hidden');
  chatMessages.innerHTML = '';
  chatPartner.textContent = activeChatUser;
  socket.emit('load-messages', { target: activeChatUser });
});

// Send message
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && activeChatUser) {
    const msg = chatInput.value.trim();
    console.log(activeChatUser)
    socket.emit('private-message', { to: activeChatUser, message: msg });
    appendMessage('You', msg);
    chatInput.value = '';
  }
});

function appendMessage(sender, message) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `${sender}: ${message}`;
  msgDiv.classList.add('chat-msg')
  chatMessages.appendChild(msgDiv);
//   console.log(`from ${sender} msg ${message}`)
}

// Receive message
socket.on('private-message', ({ from, message }) => {
  if (from === activeChatUser) {
    appendMessage(from, message);
  }
});

// Load history
socket.on('chat-history', (history) => {
  chatMessages.innerHTML = '';
  history.forEach(({ sender, message }) => {
    appendMessage(sender, message);
  });
});

// Load past conversation list
socket.on('conversation-list', (users) => {
  conversationList.innerHTML = '';
    console.log(users)
  users.forEach(user => {
    const item = document.createElement('div');
    item.textContent = user;
    // item.classList.add('convo-name');
    item.classList.add('conversation-entry')
    item.addEventListener('click', () => {
      activeChatUser = user;
    //   chatWindow.classList.remove('hidden');
    //   conversationList.remove('hidden')
      chatPartner.textContent = user
      socket.emit('load-messages', { target: user });
    });
    conversationList.appendChild(item);
  });
});

function toggleChat() {
    document.getElementById('chat-window').classList.toggle('hidden');
    console.log('hi')
    socket.emit('load-conversations')
}

socket.emit('load-conversations')

function toggleChat2() {
    chatBody.classList.toggle('hidden')
    if (messageOn) {
        messageOn = false
        chatWidget.style.height = '2rem'
        //shrink
    }
    else {
        messageOn = true
        chatWidget.style.height = '480px'
        //expand
    }
}
