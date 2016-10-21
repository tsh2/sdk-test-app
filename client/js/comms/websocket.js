import io from 'socket.io-client';
import {newMessage, debugMessage} from '../actions/AppActions';

export default function init(namespace, appId, dispatch) {
  
  const socket = io('/'+namespace, {path: '/socket.io'});
 
  socket.on("connect", function(){
  	  console.log(`CALLING JOIN ON ${appId}`);
      socket.emit("join", appId);
  });

  socket.on("message", function(data){
    dispatch(newMessage(data));
  });
  
  socket.on("debug", function(data){
    dispatch(debugMessage(data));
  });

};
   
