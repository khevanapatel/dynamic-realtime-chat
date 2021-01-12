var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
	room: {type:String, default:''},
	msgobj : []
});

var Message = mongoose.model('Message',MessageSchema);
module.exports =  Message;