import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MessageArea from './components/MessageArea';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const App = () => {
  const [channels] = useState(['Kanal 1', 'Kanal 2', 'Kanal 3']);
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('wss://voiceapp.online');

    ws.onopen = () => {
      console.log('WebSocket bağlantısı açıldı.');
      if (currentUser) {
        ws.send(JSON.stringify({ type: 'login', username: currentUser }));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages(prevMessages => [...prevMessages, data]);
      } else if (data.type === 'userList') {
        setConnectedUsers(data.users);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [currentUser]);

  useEffect(() => {
    if (isLoggedIn) {
      connectWebSocket();
    }
  }, [isLoggedIn, connectWebSocket]);

  const handleLogin = (username) => {
    console.log(`Giriş yapıldı: ${username}`);
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
  };

  const handleSendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const timestamp = new Date().toLocaleTimeString();
      const messageData = { 
        type: 'message',
        channel: selectedChannel, 
        text: message, 
        username: currentUser, 
        timestamp
      };
      socket.send(JSON.stringify(messageData));
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {!isLoggedIn ? (
          <>
            <div className="col-md-4 d-flex align-items-center justify-content-center">
              <Login onLogin={handleLogin} />
            </div>
            <div className="col-md-8 d-flex align-items-center justify-content-center">
              <Register />
            </div>
          </>
        ) : (
          <>
            <div className="col-md-2 p-0">
              <Sidebar 
                channels={channels} 
                onChannelClick={handleChannelClick} 
                currentUser={currentUser}
                selectedChannel={selectedChannel}
                connectedUsers={connectedUsers}
              />
            </div>
            <div className="col-md-10">
              <MessageArea 
                messages={messages.filter(msg => msg.channel === selectedChannel)} 
                selectedChannel={ selectedChannel} 
                onSendMessage={handleSendMessage} 
                currentUser={currentUser}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;