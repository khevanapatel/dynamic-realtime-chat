var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
	name: {type:String, default:''},
    socketid: {type:String, default:''},
    users:[]
});

var Room = mongoose.model('Room',RoomSchema);
module.exports =  Room;