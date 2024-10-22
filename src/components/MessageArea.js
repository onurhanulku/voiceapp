import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

const MessageArea = ({ messages, selectedChannel, currentUser  }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket('wss://voiceapp.online');

    ws.onopen = () => {
      console.log('WebSocket bağlantısı açıldı.');
      ws.send(JSON.stringify({ type: 'login', username: currentUser  }));
    };

    ws.onmessage = (event) => {
      console.log('Gelen veri:', event.data);
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          // Mesajı doğrudan eklemiyoruz, App bileşeni yönetecek
        }
      } catch (error) {
        console.error("Mesaj ayrıştırma hatası:", error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [currentUser ]);

  const handleSendMessage = () => {
    if (newMessage && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const timestamp = new Date().toLocaleTimeString();
      const message = { 
        type: 'message',
        channel: selectedChannel, 
        text: newMessage, 
        username: currentUser , 
        timestamp
      };
      try {
        socketRef.current.send(JSON.stringify(message));
        setNewMessage('');
      } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
      }
    } else {
      console.error('WebSocket bağlantısı kapalı veya mesaj boş!');
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
  };

  return (
    <div className="message-area">
      <h2>{selectedChannel}</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className='userlabel'>{msg.username}: </span><span>{msg.text}</span>
            <span className="timestamp" style={{ float: 'right' }}>{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input-container">
        <input 
          className='m-input'
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }} 
          placeholder="Mesaj yaz..." 
        />
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-button">😊</button>
        <button className='submit' onClick={handleSendMessage}>Gönder</button>
      </div>
      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
};

export default MessageArea;