// Require the packages we will use:
const http = require("http"),
     fs = require("fs");

const port = 3456;
const file = "client.html";

// Listen for HTTP connections, serving client.html on port 3456
const server = http.createServer(function (req, res) {
    fs.readFile(file, function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end("Error loading client.html");
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    });
});
server.listen(port);

const socketio = require("socket.io")(http, {
    wsEngine: 'ws',
});

const io = socketio.listen(server);

let rooms = []; // Array to store all rooms
let users = {}; // Object to store users and their associated rooms
let banned_users = []

io.sockets.on("connection", function (socket) {
    console.log("A user connected");

    // login
    socket.on("login", function (data) {
        const username = data["username"];
        const user_exist = Object.values(users).some(user => user.username === username);
        if (user_exist){
            io.to(socket.id).emit("error", { message: "This username already exists in the server." });
        } else {
            io.sockets.emit("login_success");
            users[socket.id] = { username: username, room: null };
            io.sockets.emit("all_rooms", { rooms: rooms });
        }
    });

    // creating a public room
    socket.on("new_public_room", function (data) {
        const room_name = data["room_name"];
        const new_room = { name: room_name, isPrivate: false, creator: users[socket.id].username, password: null };
        const name_exist = rooms.some(room => room.name === room_name);
        if (name_exist){
            io.to(socket.id).emit("error", { message: "This chat room name is already taken." });
        } else {
            rooms.push(new_room);
            io.sockets.emit("all_rooms", { rooms: rooms }); // Broadcast updated room list to all clients
        }
    });

    // creating a private room
    socket.on("new_private_room", function (data) {
        const room_name = data["room_name"];
        const password = data["password"];
        const new_room = { name: room_name, isPrivate: true, creator: users[socket.id].username, password: password };
        const name_exist = rooms.some(room => room.name === room_name);

        if (name_exist){
            io.to(socket.id).emit("error", { message: "This chat room name is already taken." });
        } else {
            rooms.push(new_room);
            io.sockets.emit("all_rooms", { rooms: rooms }); // Broadcast updated room list to all clients
        }
    });

    function users_inroom(room) {
        return Object.values(users)
            .filter(user => user.room && user.room.name === room.name)
            .map(user => user.username);
    }

    // joining a public room
    socket.on("join_public_room", function (data) {
        const room = data["room"];
        const isBanned = banned_users.some(ban => ban.user === users[socket.id].username && ban.room === room.name);
        if (isBanned){
            io.to(socket.id).emit("error", { message: "You have been banned from this room." });
        } else {
            const currentRoom = users[socket.id]?.room;
            if (currentRoom) {
                socket.leave(currentRoom);
                users[socket.id].room = null;
                io.in(currentRoom.name).emit("update_user_list", { users: users_inroom(currentRoom) });
                io.in(currentRoom.name).emit("message_to_client", { message: `${users[socket.id].username} has left ${currentRoom.name}`, room: currentRoom });
                io.to(socket.id).emit("leave_room");
            }
            io.to(socket.id).emit("join_room_success", {
                room: room,
                bannedUsers: banned_users
                    .filter(ban => ban.room === room.name)
                    .map(ban => ban.user) || []
            });
            socket.join(room.name);
            users[socket.id].room = room;
            io.in(room.name).emit("message_to_client", { message: `${users[socket.id].username} has joined ${room.name}`, room: room });
            io.in(room.name).emit("update_user_list", { users: users_inroom(room) });
        }        
    });

    // joining a private room with password verification
    socket.on("join_private_room", function (data) {
        const room = data["room"];
        const password = data["password"];
        console.log("room.password", room.password);
        console.log("password", password);
        const isBanned = banned_users.some(ban => ban.user === users[socket.id].username && ban.room === room.name);

        if (isBanned){
            io.to(socket.id).emit("error", { message: "You have been banned from this room." });
        } else {
            if (password) {
                const currentRoom = users[socket.id]?.room;
                if (room.password === password) {
                    if (currentRoom) {
                        socket.leave(currentRoom);
                        users[socket.id].room = null;
                        io.in(currentRoom.name).emit("update_user_list", { users: users_inroom(currentRoom) });
                        io.in(currentRoom.name).emit("message_to_client", { message: `${users[socket.id].username} has left ${currentRoom.name}`, room: currentRoom });
                        io.to(socket.id).emit("leave_room");
                    }
                    socket.join(room.name);
                    users[socket.id].room = room;
                    io.to(socket.id).emit("join_room_success", {
                        room: room,
                        bannedUsers: banned_users
                            .filter(ban => ban.room === room.name)
                            .map(ban => ban.user) || []
                    });
                    io.in(room.name).emit("message_to_client", { message: `${users[socket.id].username} has joined ${room.name}`, room : room });
                    io.in(room.name).emit("update_user_list", { users: users_inroom(room) });
                } else {
                    io.to(socket.id).emit("error", { message: "Incorrect password" });
                }
            } else {
                io.to(socket.id).emit("error", { message: "Please enter a password."});
            }
        }
    });

    socket.on("message_to_server", function (data) {
        const room = users[socket.id].room;
        const message = data.message;
        const isAnonymous = data.anonymous;
        const username = isAnonymous ? "Anonymous" : users[socket.id].username;
     
        io.in(room.name).emit("message_to_client", { message: `${username}: ${message}`, room: room });
        console.log("Emitting message:", `${username}: ${message}`);
     });
     

    // sending private messages
    socket.on("private_message", (data) => {
        const room = data['room'];
        const recipient_name = data['recipient'];

        if (recipient_name === users[socket.id].username) {
            io.to(socket.id).emit("error", { message: "You cannot message yourself." });
        } else {
            const recipientSocket = Object.keys(users).find(socketId => 
                users[socketId].username === data['recipient'] && 
                users[socketId].room?.name === room.name
            );
            if (recipientSocket) {
                io.to(socket.id).emit("message_to_client", {
                    message: `<strong>Private message to ${users[recipientSocket].username}</strong>: ${data['message']}`, room: room
                });
                io.to(recipientSocket).emit("private_message_to_client", {
                    sender: users[socket.id].username,
                    message: data['message'],
                    room: room 
                });
            } else {
                socket.emit("error", { message: "User not found in this room." });
            }
        }
    });

    socket.on("ban_user", function (data) {
        const room = data.room; 
        const ban_user = data.username;

        if (ban_user === users[socket.id].username) {
            io.to(socket.id).emit("error", { message: "You cannot ban yourself." });
        } else {
            const banSocket = Object.keys(users).find(socketId => 
                users[socketId].username === ban_user && users[socketId].room?.name === room.name
            );
            if (banSocket) {
                const alreadyBanned = banned_users.some(ban => ban.user === ban_user && ban.room === room.name);
                if (!alreadyBanned) {
                    banned_users.push({ user: ban_user, room: room.name });
                }
                users[banSocket].room = null;
                io.in(room.name).emit("message_to_client", { message: `${ban_user} has been banned.`, room: room });
                io.to(banSocket).emit("error", { message: "You have been banned from this room." });
                io.in(room.name).emit("update_user_list", { users: users_inroom(room) });
                io.to(banSocket).emit("ban_home");
                io.to(banSocket).emit("leave_room");

                io.to(socket.id).emit("update_banned_users", {
                    room: room,
                    bannedUsers: banned_users.filter(ban => ban.room === room.name).map(ban => ban.user)
                });
            } else {
                io.to(socket.id).emit("error", {message: "User not found in the room."});
            }
        }
    });

    // kicking a user out of the room
    socket.on("kick_user", function (data) {
        const room = data['room'];       
        const kick_user = data['username']; 
        if (kick_user === users[socket.id].username) {
            io.to(socket.id).emit("error", { message: "You cannot kick yourself." }); // prevent kicking out yourself (creative portion)
        } else {
            const kickSocket = Object.keys(users).find(socketId => 
                users[socketId].username === kick_user && users[socketId].room?.name === room.name
            );
    
            if (kickSocket) {
                users[kickSocket].room = null;
                io.in(room.name).emit("message_to_client", { message: `${kick_user} has been kicked out.`, room: room });
                io.to(kickSocket).emit("error", { message: "You have been kicked out of the room." });
                io.in(room.name).emit("update_user_list", { users: users_inroom(room) });
                io.to(kickSocket).emit("ban_home");
                io.to(kickSocket).emit("leave_room");
            } else {
                io.to(socket.id).emit("error", {message: "User not found in the room."});
            }
        }
    });

    // unban user (creative portion)
    socket.on("unban_user", function (data) {
        const room = data.room;
        const unban_user = data.username;
    
        const roomInfo = rooms.find(r => r.name === room.name);
        if (roomInfo && roomInfo.creator === users[socket.id].username) {
            banned_users = banned_users.filter(ban => !(ban.user === unban_user && ban.room === room.name));
            io.in(room.name).emit("message_to_client", { message: `${unban_user} has been unbanned by the creator.`, room: room });
            
            io.to(socket.id).emit("update_banned_users", {
                room: room,
                bannedUsers: banned_users.filter(ban => ban.room === room.name).map(ban => ban.user)
            });
        } else {
            io.to(socket.id).emit("error", { message: "Only the room creator can unban users." });
        }
    });

    // user disconnect
    socket.on("disconnect", function () {
        const user = users[socket.id];
        delete users[socket.id];
        if (user && user.room) {
            io.in(user.room.name).emit("message_to_client", { message: `${user.username} has left the room`, room: user.room });
            io.in(user.room.name).emit("update_user_list", { users: users_inroom(user.room) });
        }
        console.log("A user disconnected");
    });
});