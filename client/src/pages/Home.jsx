// pages/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username == 'admin') {
      navigate('/admin-view');
    } else if (username == 'user') {
      navigate('/user-view');
    }else {
      alert('Please enter username and password!');
    }
  };

  return (
    <div className="centered-container">
        <Header title="WORKPULSE" pageName=" HOME PAGE"/>
        <form onSubmit={handleLogin} className="login-form">
            <div>
                <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ENTER YOUR USERNAME"
                className="form-input"
                />
            </div>
            <div>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER YOUR PASSWORD"
                className="form-input"
                />
            </div>
            <button type="submit" className="form-button">
                LOGIN
            </button>
        </form>
    </div>
  );
}

export default Home;