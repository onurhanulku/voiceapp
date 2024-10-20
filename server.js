const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http'); // http modülünü içe aktar
const wsServer = require('./wsServer'); // wsServer dosyasını içe aktar

const app = express();
const PORT = 5000;

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/voiceapp')
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use(cors());
app.use(bodyParser.json());

// Kullanıcı Şeması
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Login API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ message: 'Login successful!', user: username });
    } else {
      res.status(401).json({ message: 'Invalid username or password.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Register API
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'Registration successful!', user: newUser.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// HTTP sunucusunu oluştur
const server = http.createServer(app);

// WebSocket sunucusunu başlat
wsServer(server); // WebSocket sunucusunu başlat

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});