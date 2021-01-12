const Room = require('../database/Room');
const Message = require('../database/Message');
var users = [];

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room, is_live:1 };
  var arr = [];
  Room.find({name: room}).exec((err, result)=>{
    if(result.length>0) {
      var userarr =  result[0].users;
      const found = userarr.some(el => el.username === username);
      if(!found){
        userarr.push(user);
      } else {
        objIndex = userarr.findIndex((obj => obj.username == username));
        userarr[objIndex].id = id;
        userarr[objIndex].is_live = 1;
      }
      var filter = {_id:result[0]._id};
      var update = {users:userarr};
      var updateres = Room.findOneAndUpdate(filter,update).exec((err, updateresponse)=>{
          setUser();
      });
    } else {
      arr.push(user);
      var roomobj = new Room();
      roomobj.name = room;
      roomobj.socketid = id;
      roomobj.users = arr;
      roomobj.save((err, result)=>{
          setUser();
      })
    }
  })
  const found = users.some(el => el.username === username);
  if(!found){
    users.push(user);
  }
  
  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);
  if(users[index]){
    var room  =  users[index].room;
    users[index].is_live = 0;
    var filter = {name:room};
    var update = {users:users};
    var updateres = Room.findOneAndUpdate(filter,update).exec((err, updateresponse)=>{
        setUser();
        return users;
    });
    return users[index];
  }
  // users[index].is_live = 0;
  // if (index !== -1) {
  //   return users.splice(index, 1)[0];
  // }
}

// Get room users
function  getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function setUser() {
  Room.find().exec((err,result)=>{
    if(result){
      users = [];
      for (var i = result.length - 1; i >= 0; i--) {
        for (var j = result[i].users.length - 1; j >= 0; j--) {
          users.push(result[i].users[j]);
        }
      }      
    }
  })
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  setUser
};
