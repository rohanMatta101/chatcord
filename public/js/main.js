
const socket=io();

socket.on('message',message=>{
    outputMessage(message);
})

const chartform=document.getElementById('chat-form');
const chatmessages=document.querySelector('.chat-messages');
const roomname = document.getElementById('room-name');
const userlist = document.getElementById('users');

const { username,room }=Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

socket.emit('joinRoom',{username,room});

socket.on('roomusers',({room,users})=>{
    outputRoomName(room);
    outputUserList(users);
})

chartform.addEventListener('submit',e=>{
   e.preventDefault();

   const msg=e.target.elements.msg.value;

   //now emitting the message to the server 
   socket.emit('chatmessage',msg);
   
   //making sure that scroller stays at the recent message
   chatmessages.scrollTop=chatmessages.scrollHeight;
  
   e.target.elements.msg.value='';
   e.target.elements.msg.focus();

})
//output  message to DOM

function outputMessage(msg){
   const div=document.createElement('div');
   div.classList.add('message');
   div.innerHTML=`<p class="meta">${msg.username} <span>${msg.time}</span></p>
   <p class="text">
       ${msg.text}
   </p>`;
   document.querySelector('.chat-messages').appendChild(div);

}
function outputRoomName(room){
    roomname.innerText=room;
}
function outputUserList(users){
    userlist.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}
    `;
}