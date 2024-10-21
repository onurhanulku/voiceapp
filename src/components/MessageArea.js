import React, { useState, useEffect, useRef } from 'react';

const MessageArea = ({ messages, selectedChannel, onSendMessage, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
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
        <button className='submit' onClick={handleSendMessage}>Gönder</button>
      </div>
    </div>
  );
};

export default MessageArea;