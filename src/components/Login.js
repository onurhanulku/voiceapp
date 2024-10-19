import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://31.210.36.25:5000/api/login', {
        username,
        password,
      });
      onLogin(username);
      
      // WebSocket bağlantısını Login bileşeninden kaldırıyoruz
      // Bunun yerine, Sidebar bileşeninde bağlantı kuracağız
    } catch (err) {
      setError('Geçersiz kullanıcı adı veya şifre.');
    }
  };

  return (
    <div className="logreg logreg-right">
      <h2>Giriş Yap</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className='submit'>Giriş Yap</button>
      </form>
    </div>
  );
};

export default Login;