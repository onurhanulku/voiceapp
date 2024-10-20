import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://voiceapp.online/api/register', {username, password });
      setMessage(response.data.message);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else if (error.request) {
        setMessage('Sunucuya erişilemedi. Lütfen daha sonra tekrar deneyin.');
      } else {
        setMessage('Bir hata oluştu: ' + error.message);
      }
    }
  };

  return (
    <div className="logreg">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleRegister}>
        <div>
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <button type="submit" className='submit'>Kaydol</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Register;