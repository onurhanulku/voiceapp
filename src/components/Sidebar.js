import React, { useEffect, useState } from 'react';

const Sidebar = ({ channels, onChannelClick }) => {
  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://31.210.36.25:5000'); // WebSocket sunucu adresi

    ws.onmessage = (event) => {
      console.log('Gelen veri:', event.data);

      // Gelen veriyi JSON formatında ayrıştır
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'userList') {
          setConnectedUsers(data.users); // Kullanıcıları güncelle
        }
      } catch (error) {
        console.error('Veri ayrıştırma hatası:', error);
      }
    };

    ws.onopen = () => {
      console.log('WebSocket bağlantısı açıldı.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };

    return () => {
      ws.close(); // Bileşen kapatıldığında WebSocket bağlantısını kapat
    };
  }, []);

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
      <h3>Bağlı Kullanıcılar</h3>
      <ul className="list-group">
        {connectedUsers.map((user, index) => (
          <li key={index} className="list-group-item bg-secondary text-white">
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;