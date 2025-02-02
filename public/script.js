

// Get the current page
const currentPage = window.location.pathname;
 // DOM elements
 const chatBody = document.getElementById('chatBody');
 const chatForm = document.getElementById('chatForm');
 const chatInput = document.getElementById('chatInput');

// Logic for the login page
if (currentPage === '/' || currentPage === '/index.html') {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();

    if (username) {
      // Save the username in localStorage
      localStorage.setItem('username', username);

      // Redirect to the chat page
      window.location.href = '/chat.html';
    } else {
      alert('Please enter a valid username!');
    }
  });
}

// Logic for the chat page
if (currentPage === '/chat.html') {
  const socket = io();

  // Get the username from localStorage
  const username = localStorage.getItem('username');

  // Redirect to login page if username is not set
  if (!username) {
    alert('You must log in first!');
    window.location.href = '/';
  }
 // Join the chat
  socket.emit('join', username);
  
  // Notify when a user joins
  socket.on('user-joined', (newUser) => {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = `${newUser} has joined the chat.`;
    chatBody.appendChild(notification);
    chatBody.scrollTop = chatBody.scrollHeight;
  });

  // Notify when a user leaves
  socket.on('user-left', (leftUser) => {
    if (leftUser) {
      const notification = document.createElement('div');
      notification.classList.add('notification');
      notification.textContent = `${leftUser} has left the chat.`;
      chatBody.appendChild(notification);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  });

  

const photoButton = document.getElementById('photoButton');
const photoInput = document.getElementById('photoInput');

// Handle photo button click
photoButton.addEventListener('click', () => {
  photoInput.click(); // Trigger file selection
});

// Handle photo upload
photoInput.addEventListener('change', async () => {
  const file = photoInput.files[0];
  if (!file) {
    console.error('No file selected.');
    return;
  }
  console.log('Selected file:', file);

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const response = await fetch('/upload-photo', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const { photoPath } = await response.json();
      console.log('Photo uploaded:', photoPath);

      // Emit photo URL to the server
      socket.emit('send-message', { sender: username, photo: photoPath });

      // Clear input
      photoInput.value = '';
    } else {
      console.error('Failed to upload photo:', response.statusText);
    }
  } catch (error) {
    console.error('Error during photo upload:', error);
  }
});


// Listen for incoming messages/photos
socket.on('receive-message', (data) => {
  const { sender, message, photo } = data;

  const messageContainer = document.createElement('div');
  messageContainer.classList.add(sender === username ? 'sent' : 'received');
  const nameElement = document.createElement('strong');
    nameElement.textContent = sender + ": "; // Bold sender name with a colon

    const messageElement = document.createElement('span');
    messageElement.textContent = message;
 
  messageContainer.appendChild(nameElement);
  messageContainer.appendChild(messageElement);

  if (photo) {
    const photoElement = document.createElement('img');
    photoElement.src = photo;
    photoElement.alt = 'Shared photo';
    photoElement.style.maxWidth = '100%';
    photoElement.style.borderRadius = '8px';
    messageContainer.appendChild(photoElement);
  }

  chatBody.appendChild(messageContainer);
  chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll
});

// Start Private Chat
const privateChatBtn = document.getElementById('privateChatBtn');
privateChatBtn.addEventListener('click', () => {
  const privateUsername = document.getElementById('privateUsername').value.trim();
  if (privateUsername) {
    socket.emit('start-private-chat', { sender: username, recipient: privateUsername });
  }
});


  // Handle form submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = chatInput.value.trim();
    if (message) {
      console.log(`Sending message: ${message}`);
      socket.emit('send-message', { sender: username, message });
      chatInput.value = ''; // Clear input
    }
  });
}
