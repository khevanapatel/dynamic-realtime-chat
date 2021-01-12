const moment = require('moment');
const Message = require('../database/Message');
var messages = [];
fetchMessages();
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('d-M-Y h:mm a')
  };
}

function saveMessage(user, msg) {
	Message.find({room:user.room}).exec((err, result)=>{
		if(result.length>0){
			var msgobj = result[0].msgobj;
			msgobj.push(msg);
			var filter = {_id:result[0]._id};
			var update = {msgobj:msgobj};
			Message.findOneAndUpdate(filter,update).exec((err, updateresponse)=>{
	          // resullt
	          fetchMessages();
	      });
		} else {
			var message = new Message();
			message.room = user.room;
			message.msgobj = msg;
			message.save((err, result)=>{
				fetchMessages();
				// console.log("result",result);
			})
		}
	})
}

async function fetchMessages() {
    const data = await Message.find().exec(  (err, result)=>{
		if(result.length>0){
			messages = result;
		} 
	})

}

// Get room users
function  getMessages(room) {
    return messages.filter(message => message.room === room);
}

module.exports = {
  formatMessage,
  saveMessage,
  getMessages
};
