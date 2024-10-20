import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import '../App.css';

const avatars = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png'];

const Sidebar = ({ channels, onChannelClick, currentUser, selectedChannel, onLogout }) => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userAvatars, setUserAvatars] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState('avatar1.png');
  const dropdownRef = useRef(null);
  const wsRef = useRef(null);

  const fetchAvatar = useCallback(async () => {
    try {
      const response = await axios.get(`https://voiceapp.online/api/getUserAvatar?username=${currentUser}`);
      setCurrentAvatar(response.data.avatar);
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  }, [currentUser]);

  const fetchAllAvatars = useCallback(async () => {
    try {
      const response = await axios.get('https://voiceapp.online/api/getAllUserAvatars');
      console.log('Fetched avatars:', response.data);
      setUserAvatars(response.data);
    } catch (error) {
      console.error('Error fetching all avatars:', error);
    }
  }, []);

  useEffect(() => {
    fetchAvatar();
    fetchAllAvatars();

    wsRef.current = new WebSocket('wss://voiceapp.online');

    wsRef.current.onopen = () => {
      console.log('WebSocket bağlantısı açıldı.');
      wsRef.current.send(JSON.stringify({ type: 'login', username: currentUser }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'userList') {
          setConnectedUsers(data.users);
        }
      } catch (error) {
        console.error("JSON ayrıştırma hatası:", error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket hatası:", error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentUser, fetchAvatar, fetchAllAvatars]);

  const toggleDropdown = useCallback((e) => {
    e.stopPropagation();
    setShowDropdown(prev => !prev);
  }, []);

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

  const handleAvatarClick = useCallback(() => {
    setShowAvatarModal(true);
  }, []);

  const handleAvatarSelect = useCallback(async (avatar) => {
    try {
      await axios.post('https://voiceapp.online/api/updateAvatar', { username: currentUser, avatar });
      setCurrentAvatar(avatar);
      setShowAvatarModal(false);
      fetchAllAvatars(); // Tüm avatarları güncelle
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  }, [currentUser, fetchAllAvatars]);

  return (
    <div className="sidebar">
      <h2>Kanal Listesi</h2 >
      <div className="channel-list">
        <ul>
          {channels.map((channel, index) => (
            <li 
              key={index} 
              onClick={() => onChannelClick(channel)}
              className={channel === selectedChannel ? 'active' : ''} >
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
              <img 
  src={`/avatars/${userAvatars[user] || 'avatar1.png'}`} 
  alt={user} 
  className="avatar-img-channel" 
/>
              {user}
            </li>
          ))}
        </ul>
      </div>
      <div className="user-info">
        <div className="user-avatar" onClick={handleAvatarClick}>
          <img src={`/avatars/${currentAvatar}`} alt="User Avatar" className="avatar-img" />
          <span className="online-indicator"></span>
        </div>
        <div className="user-details">
          <span className="username">{currentUser}</span>
          <span className="connection-status">Çevrimiçi</span>
        </div>
        <div className="user-actions" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="dropdown-toggle">⋮</button>
        </div>
      </div>
      {showAvatarModal && (
        <div className="avatar-modal">
          {avatars.map((avatar, index) => (
            <img 
              key={index}
              src={`/avatars/${avatar}`}
              alt={avatar}
              onClick={() => handleAvatarSelect(avatar)}
              className="avatar-option"
            />
          ))}
        </div>
      )}
      {showDropdown && (
        <div className="dropdownmenu">
          <div onClick={handleAvatarClick}>Avatar Değiştir</div>
          <div onClick={onLogout}>Çıkış</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;