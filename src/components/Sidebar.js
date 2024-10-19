import React, { useEffect, useState } from 'react';
import '../App.css'; // CSS dosyasını import ediyoruz

const Sidebar = ({ channels, onChannelClick, currentUser }) => {
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
    <div className="sidebar p-3 bg-dark text-white">
      <h2>Kanal Listesi</h2>
      <ul className="list-group">
        {channels.map((channel, index) => (
          <li 
            key={index} 
            className="list-group-item list-group-item-action bg-secondary text-white" 
            onClick={() => onChannelClick(channel)}
          >
            {channel}
          </li>
        ))}
      </ul>
      <h3 className="mt-4">Bağlı Kullanıcılar</h3>
      <ul className="list-group">
        {connectedUsers.map((user, index) => (
          <li key={index} className="list-group-item bg-secondary text-white d-flex align-items-center">
            <span className="online-indicator mt-1 mr-2"></span>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;