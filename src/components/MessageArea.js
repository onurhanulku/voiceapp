import React, { useState, useEffect } from 'react';

const MessageArea = ({ messages, selectedChannel, setMessages, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://31.210.36.25:5000'); // WebSocket sunucu adresi

    ws.onmessage = async (event) => {
      console.log('Gelen veri:', event.data);
      
      // Eğer gelen veri bir Blob ise, onu metin formatına dönüştür
      if (event.data instanceof Blob) {
        const text = await event.data.text();
        console.log('Blob verisi:', text); // Blob verisini kontrol et
        try {
          const msg = JSON.parse(text);
          setMessages((prevMessages) => [...prevMessages, msg]);
        } catch (error) {
          console.error("Mesaj ayrıştırma hatası:", error);
        }
      } else if (typeof event.data === 'string') {
        console.log('String verisi:', event.data); // String verisini kontrol et
        try {
          const msg = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, msg]);
        } catch (error) {
          console.error("Mesaj ayrıştırma hatası:", error);
        }
      } else {
        console.error("Gelen veri JSON formatında değil.");
      }
    };

    ws.onopen = () => {
      console.log('WebSocket bağlantısı açıldı.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };

    setSocket(ws);

    return () => {
      ws.close(); // Bileşen kapatıldığında WebSocket bağlantısını kapat
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage && socket && socket.readyState === WebSocket.OPEN) {
      const timestamp = new Date().toLocaleTimeString(); // Sadece saat bilgisini al
      const message = { 
        channel: selectedChannel, 
        text: newMessage, 
        username: currentUser, 
        timestamp // Saat bilgisini ekle
      }; 
      try {
        socket.send(JSON.stringify(message)); // Mesaj gönder
        setNewMessage(''); // Mesaj kutusunu temizle
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
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span>{msg.username}: {msg.text}</span>
            <span className="timestamp" style={{ float: 'right' }}>{msg.timestamp}</span>
          </div>
        ))}
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
