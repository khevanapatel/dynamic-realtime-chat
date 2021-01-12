const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Get room and messages
socket.on('roomMessages', ({ user, room, messages }) => {
  if(user.id == socket.id){
    if(messages.length > 0 && messages[0].msgobj)
    for (var i = 0;  i <= messages[0].msgobj.length - 1; i++) {
      outputMessage(messages[0].msgobj[i], user);
    }
  }
});

// Message from server
socket.on('message', ({message, user}) => {
  outputMessage(message,user);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
  
  msg = msg.trim();
  
  if (!msg){
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message,user) {
  const div = document.createElement('div');
  if(user.id == socket.id && user.username == message.username){
    div.classList.add('usermessage');
  }else{
    div.classList.add('message');
  }
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span> ${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  console.log("users",users);
  userList.innerHTML = '';
  users.forEach(user=>{
    const li = document.createElement('li');
    if(user.is_live == 1){
      li.innerText = user.username ;
      li.innerHTML += `<span>`+' 🔵'+`</span>`;
    } else {
      li.innerText = user.username;
      li.innerHTML += `<span>`+' 🔴'+`</span>`;
    }
    userList.appendChild(li);
  });
 }
