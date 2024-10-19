import React, { useState } from 'react';
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

  const handleLogin = (username) => {
    console.log(`Giriş yapıldı: ${username}`);
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
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
            <div className="col-md-2">
              <Sidebar 
                channels={channels} 
                onChannelClick={handleChannelClick} 
                currentUser={currentUser}
                selectedChannel={selectedChannel}
              />
            </div>
            <div className="col-md-10">
              <MessageArea 
                messages={messages.filter(msg => msg.channel === selectedChannel)} 
                selectedChannel={selectedChannel} 
                setMessages={setMessages} 
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