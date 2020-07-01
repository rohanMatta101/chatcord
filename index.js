const express=require('express');
const app=express();
const http=require('http');
const socketio=require('socket.io');
const path=require('path');
const helmet=require('helmet');
const morgan=require('morgan');
const compression=require('compression');

const server=http.createServer(app);


const PORT =  process.env.PORT || 3000;

app.use(express.static(path.join(__dirname,'public')));

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

const { userJoin,getCurrentUser,userLeave,getRoomUsers }=require('./Utils/User');
const formatmessage=require('./Utils/messages');
const User = require('./Utils/User');

const io=socketio(server);
const botname='chatcord-BOT'
io.on('connection',socket=>{

   socket.on('joinRoom',({username,room})=>{
   
    const user=userJoin(socket.id,username,room);
    socket.join(user.room);

    socket.emit('message',formatmessage(botname,'WELCOME TO CHATCORD'));

    //message sent to client who is connecting
    //'message' this is the name of the channel we are forming to listen to later

    
    //broadcasting a msg when a new user new connects but this message is shown to all users other than the on who is currently connecting
    socket.broadcast.to(user.room).emit('message',formatmessage(botname, `${user.username} has joined the chat`));

    io.to(user.room).emit('roomusers',{
        room:user.room,
        users:getRoomUsers(user.room)
    })
   })


    //when disconnects
    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);
        if(user){
            io.to(user[0].room).emit('message',formatmessage(botname,`${user[0].username} has left the chat`));

            io.to(user[0].room).emit('roomusers',{
                room:user[0].room,
                users:getRoomUsers(user[0].room)
            })
        }

    })

    socket.on('chatmessage',(msg)=>{
        const user=getCurrentUser(socket.id);

        //emitting to all clients of the room
        io.to(user.room).emit('message',formatmessage(user.username,msg));
    })
})

server.listen(PORT,()=>{
    console.log('server connected');
})
