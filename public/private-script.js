const socket = io();

const username = localStorage.getItem('username');
const privateChatBody = document.getElementById('privateChatBody');
const privateChatForm = document.getElementById('privateChatForm');
const privateChatInput = document.getElementById('privateChatInput');

privateChatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = privateChatInput.value.trim();
  if (message) {
    socket.emit('send-private-message', { sender: username, message });
    privateChatInput.value = '';
  }
});

socket.on('receive-private-message', (data) => {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add(data.sender === username ? 'sent' : 'received');

  const nameElement = document.createElement('span');
  nameElement.textContent = data.sender;

  const messageElement = document.createElement('span');
  messageElement.textContent = data.message;

  messageContainer.appendChild(nameElement);
  messageContainer.appendChild(messageElement);
  privateChatBody.appendChild(messageContainer);
  privateChatBody.scrollTop = privateChatBody.scrollHeight;
});
