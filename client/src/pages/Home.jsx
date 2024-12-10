// pages/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(0);
  const [id, setId] = useState(0);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:3000/employees/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name: username,
                password: password,
            }),
        });

        if (!response.ok) {
            throw new Error('Invalid username or password');
        }

        const data = await response.json();
        setRole(data.role);
        setId(data.id);

        if (data.role === 1) {
            navigate('/admin-view');
        } else if (data.role === 0) {
            navigate(`/user-view/${data.id}`);
        } else {
            alert('Unknown role');
        }
    } catch (error) {
        console.error('Error:', error);
        setError(error.message);
    }
};

  return (
    <div className="centered-container">
      <div className="home-page-style">
        <Header title="WORKPULSE" pageName=" HOME PAGE"/>
        <form onSubmit={handleLogin} className="login-form">
            <div>
                <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ENTER YOUR USERNAME"
                className="form-input"
                autoComplete="username"
                />
            </div>
            <div>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER YOUR PASSWORD"
                className="form-input"
                autoComplete="current-password"
                />
            </div>
            <button type="submit" className="form-button">
                LOGIN
            </button>
        </form>
      </div>
  </div>
  );
}

export default Home;