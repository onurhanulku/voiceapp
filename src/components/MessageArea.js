import React, { useState, useEffect, useRef } from 'react';

const MessageArea = ({ messages, selectedChannel, setMessages, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket('ws://31.210.36.25:5000');

    ws.onopen = () => {
      console.log('WebSocket bağlantısı açıldı.');
      ws.send(JSON.stringify({ type: 'login', username: currentUser }));
    };

    ws.onmessage = (event) => {
      console.log('Gelen veri:', event.data);
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          setMessages(prevMessages => [...prevMessages, data]);
        }
      } catch (error) {
        console.error("Mesaj ayrıştırma hatası:", error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };

    setSocket(ws);
    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [currentUser, setMessages]);

  const handleSendMessage = () => {
    if (newMessage && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const timestamp = new Date().toLocaleTimeString();
      const message = { 
        type: 'message',
        channel: selectedChannel, 
        text: newMessage, 
        username: currentUser, 
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

  return (
    <div className="message-area">
      <h2>{selectedChannel}</h2>
      <div className="messages">
        {messages.filter(msg => msg.channel === selectedChannel).map((msg, index) => (
          <div key={index} className="message">
            <span>{msg.username}: {msg.text}</span>
            <span className="timestamp" style={{ float: 'right' }}>{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
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
      <button className='submit' onClick={handleSendMessage}>Gönder</button>
    </div>
  );
};

export default MessageArea;