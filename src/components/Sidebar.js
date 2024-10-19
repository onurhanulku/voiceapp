import React, { useEffect, useState } from 'react';
import '../App.css';

const Sidebar = ({ channels, onChannelClick, currentUser, selectedChannel }) => {
  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://31.210.36.25:5000');

    ws.onopen = () => {
      console.log('WebSocket bağlantısı açıldı.');
      ws.send(JSON.stringify({ type: 'login', username: currentUser }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'userList') {
          setConnectedUsers(data.users);
        }
      } catch (error) {
        console.error("JSON ayrıştırma hatası:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket hatası:", error);
    };

    return () => {
      ws.close();
    };
  }, [currentUser]);

  return (
    <div className="sidebar">
      <h2>Kanal Listesi</h2>
      <div className="channel-list">
        <ul>
          {channels.map((channel, index) => (
            <li 
              key={index} 
              onClick={() => onChannelClick(channel)}
              className={channel === selectedChannel ? 'active' : ''}
            >
              # {channel}
            </li>
          ))}
        </ul>
      </div>
      <div className="connected-users">
        <h3>Bağlı Kullanıcılar</h3>
        <ul>
          {connectedUsers.map((user, index) => (
            <li key={index}>
              <span className="online-indicator"></span>
              {user}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;