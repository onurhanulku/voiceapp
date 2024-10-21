import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

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

    ws.onclose = () => {
      console.log('WebSocket bağlantısı kapandı. Yeniden bağlanılıyor...');
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    };

    socketRef.current = ws;
  }, [currentUser]);

  useEffect(() => {
    if (isLoggedIn) {
      connectWebSocket();
    }

    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Her 30 saniyede bir ping gönder

    const handleVisibilityChange = () => {
      if (!document.hidden && isLoggedIn) {
        connectWebSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isLoggedIn, connectWebSocket]);

  const handleLogin = (username) => {
    console.log(`Giriş yapıldı: ${username}`);
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
  };

  const handleSendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const timestamp = new Date().toLocaleTimeString();
      const messageData = { 
        type: 'message',
        channel: selectedChannel, 
        text: message, 
        username: currentUser, 
        timestamp
      };
      socketRef.current.send(JSON.stringify(messageData));
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
                onLogout={handleLogout}
              />
            </div>
            <div className="col-md-10">
              <MessageArea 
                messages={messages.filter(msg => msg.channel === selectedChannel)} 
                selectedChannel={selectedChannel} 
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