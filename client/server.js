const express = require('express');
const { createServer } = require('http'); // Menggunakan http bawaan Node.js
const { join } = require('path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

const rooms = []; // buat nyimpen rooms
const pollResults = {}; // buat nyimpen hasil polling


let numUsers = 0;

app.use(express.static(join(__dirname, "public")));

io.on('connection', (socket) => {
    console.log(socket.id)
    let addedUser = false;

    socket.on("new user", (data) => {
        if (addedUser) return;
    
        // add username to socket session
        socket.username = data.username;
        numUsers +=1;
        addedUser = true;
    
        // add to user list
        // users.push({"username": data.username});
        socket.broadcast.emit("new user", {"username": data.username, "room": data.room});
    });

    socket.on('chat message', (data) => {
        chatData = {
            "sender": socket.username,
            "message": data.message,
            "room": data.room
        }
        if (data.room === "") {
            socket.broadcast.emit('new message', chatData);
        } else {
            socket.to(data.room).emit("new message", chatData);
        }
    });

    socket.on("join room", (data) => {
        socket.join(data.room);
        rooms.push(data.room);

        if (!rooms.includes(data.room)) {
            // rooms.push(data.room);
            //buat ngasih tau daftar room
            io.emit('roomsList', rooms);
        }
    });

    socket.on('getRooms', () => {
        //buat ngirim daftar room ke
        socket.emit('roomsList', rooms);
      });

    socket.on("disconnect", () => {
        if (addedUser) {
            numUsers -= 1;

            rooms.forEach((room) => {
                socket.broadcast.emit("user leave", {
                    "username": socket.username,
                    "room": room 
                });
            });
            socket.broadcast.emit("user leave", {
                "username": socket.username,
                "room": "" 
            });
        }
    });

    socket.on("user leave", (data) => {
        addNotificationMessage(data.username + " leave", data.room);
    });


    // Menangani pembuatan polling baru dari pengguna
    socket.on('create poll', (data) => {
        if (!pollResults[data.option]) {
            pollResults[data.option] = 1;
            // Kirim polling yang baru dibuat kepada semua pengguna
            io.emit('poll created', pollResults);
        }
    });

    //vote dari user
    socket.on('vote', (data) => {
        if (pollResults[data.option] !== undefined) {
            pollResults[data.option]++;
            // Kirim hasil polling yang diperbarui kepada semua pengguna
            io.emit('vote created', pollResults);
        }
    });

});

server.listen(4000, () => {
    console.log('server running at http://localhost:4000');
});