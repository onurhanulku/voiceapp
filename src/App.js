import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MessageArea from './components/MessageArea';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const App = () => {
  const [channels] = useState(['Kanal 1', 'Kanal 2', 'Kanal 3']);
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [messages, setMessages] = useState([]); // Mesajlar burada saklanacak
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(''); // Kullanıcı adını saklamak için yeni state
  

  const handleLogin = (username) => {
    console.log(`Giriş yapıldı: ${username}`);
    setCurrentUser(username); // Kullanıcı adını kaydet
    setIsLoggedIn(true);
  };

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
  };

  return (
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
          <div className="col-md-4">
            <Sidebar channels={channels} onChannelClick={handleChannelClick} />
          </div>
          <div className="col-md-8">
            <MessageArea 
              messages={messages.filter(msg => msg.channel === selectedChannel)} 
              selectedChannel={selectedChannel} 
              setMessages={setMessages} 
              currentUser={currentUser} // Kullanıcı adını MessageArea'ya geçir
            />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
