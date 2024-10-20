import React, { useEffect, useState, useRef } from 'react';
import '../App.css';

const Sidebar = ({ channels, onChannelClick, currentUser, selectedChannel, onLogout }) => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      <div className="user-info">
        <div className="user-avatar">
          <div className="avatar-placeholder"></div>
        </div>
        <div className="user-details">
          <span className="username">{currentUser}</span>
          <span className="connection-status">Çevrimiçi</span>
        </div>
        <div className="user-actions" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="dropdown-toggle">⋮</button>
          {showDropdown && (
            <div className="dropdownmenu">
              <div>test 1</div>
              <div>test 2</div>
              <div>test 3</div>
              <div onClick={onLogout}>Çıkış</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;