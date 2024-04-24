
const nameModal = document.querySelector("#name-modal");
const nameForm = document.querySelector("#name-form");
const nameInput = document.querySelector('#name-input');
const messageInput = document.querySelector('#message-input');
const messageForm = document.querySelector('#message-form');
const roomInput = document.querySelector('#room-input');
const roomForm = document.querySelector('#room-form');

//polling
const pollForm = document.querySelector('#poll-form');
// const pollResultsElement = document.querySelector('#poll-results');



let username = "";
let room = "";

const socket = io()


nameForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if(nameInput.value) {
        username = nameInput.value;
        socket.emit("new user", {"username": nameInput.value, "room": room});
        addNotificationMessage("You are join to global room", room);
        nameInput.value = "";
        nameModal.style.display = "none";
    }
});

socket.on("new user", (data) => {
    addNotificationMessage(data.username + " joined", data.room);
});

// socket.on("new user", (data) => {
//     if (addedUser) return;

//     // add username to socket session
//     socket.username = data.username;
//     numUsers +=1;
//     addedUser = true;

//     // add to user list
//     users.push({"username": data.username});
//     socket.broadcast.emit("new user", {"username": data.username, "room": data.room});
// });

// socket.on("new user", (data) => {
//     addNotificationMessage(data.username + " joined", data.room);
// });

// submit new message
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    if (messageInput.value) {
        addOwnMessage(messageInput.value, room);
        socket.emit("chat message", {"message": messageInput.value, "room": room});
        messageInput.value = '';
    }
});

// enter a room (kumpulan socket id)
roomForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (roomInput.value) {
        socket.emit("join room", {"room": roomInput.value});
        createRoomMessages(roomInput.value);
        changeRoomMessage(room, roomInput.value);
        room = roomInput.value;
        roomInput.value = "";
    }
    else {
        changeRoomMessage(room, roomInput.value);
        room = roomInput.value;
    }
});

socket.on('new message', (data) => {
    addOtherMessage(data.message, data.sender, data.room);
});

// Panggil soket untuk meminta daftar ruang pribadi dari server
// socket.emit('get private rooms');

// // Tambahkan event listener untuk menangani respons dari server
// socket.on('private rooms', (privateRooms) => {
//     // Tampilkan daftar ruang pribadi pada antarmuka pengguna
//     const privateRoomsList = document.getElementById('private-rooms-list');
//     privateRooms.forEach(room => {
//         const roomElement = document.createElement('li');
//         roomElement.textContent = room.name;
//         privateRoomsList.appendChild(roomElement);
//     });
// });

// Mengirim permintaan untuk mendapatkan daftar ruangan saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    socket.emit('getRooms');
});
  
  // Menangani respons dari server dengan daftar ruangan
socket.on('roomsList', (rooms) => {
    // Update antarmuka pengguna dengan daftar ruangan yang diterima
    const roomList = document.querySelector('#room-list');
    rooms.forEach(room => {
      const listItem = document.createElement('li');
      listItem.textContent = room;
      roomList.appendChild(listItem);
    });
});


socket.on("user leave", (data) => {
    addNotificationMessage(data.username + " leave", data.room);
});


// event listener untuk form polling
pollForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pollOption = document.querySelector('input[name="poll-option"]:checked').value;
    socket.emit('create poll', { option: pollOption });
});

const pollOptions = document.querySelectorAll('input[name="poll-option"]');
pollOptions.forEach(option => {
    option.addEventListener('change', () => {
        const selectedOption = document.querySelector('input[name="poll-option"]:checked').value;
        socket.emit('vote', { option: selectedOption });
    });
});

// respons dari server saat polling diterima
socket.on('poll created', (pollResults) => {
    // Update tampilan polling
    updatePollResults(pollResults);
});

// vote pengguna
socket.on('vote created', (pollResults) => {
    // Update tampilan polling setelah menerima suara baru
    updatePollResults(pollResults);
});

function updatePollResults(newPollResults) {
    const pollResultsElement = document.querySelector('#poll-results');
    pollResultsElement.innerHTML = '';

    for (const option in newPollResults) {
        const optionResult = document.createElement('li');
        optionResult.textContent = `${option}: ${newPollResults[option]} votes`;
        pollResultsElement.appendChild(optionResult);
    }
}








