const WebSocket = require('ws');

const wsServer = (server) => {
  const wss = new WebSocket.Server({ server });
  let connectedUsers = new Set();

  wss.on('connection', (ws) => {
    console.log('Yeni bir bağlantı kuruldu.');

    ws.on('message', (message) => {
      console.log(`Mesaj alındı: ${message}`);
      let data;
      try {
        data = JSON.parse(message);
      } catch (error) {
        console.error('Invalid JSON:', error);
        return;
      }

      if (data.type === 'login') {
        connectedUsers.add(data.username);
        ws.username = data.username;
        broadcastUserList();
      } else if (data.type === 'message') {
        // Mesajı tüm bağlı istemcilere ilet
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    });

    ws.on('close', () => {
      if (ws.username) {
        connectedUsers.delete(ws.username);
        broadcastUserList();
      }
    });

    function broadcastUserList() {
      const userList = Array.from(connectedUsers);
      const message = JSON.stringify({ type: 'userList', users: userList });
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });

  console.log('WebSocket sunucusu başlatıldı.');
};

module.exports = wsServer;