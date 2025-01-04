import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import Home from './pages/Home';
import AdminView from './pages/AdminView';
import UserView from './pages/UserView';
import { Navigate } from 'react-router-dom';

function App() {
  const [sessionUser, setSessionUser] = useState(0);

  //TODO: https://www.npmjs.com/package/react-notifications for responses from the server

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home setUser={setSessionUser}/>} />
          <Route path="/admin-view" element={<AdminView userId={sessionUser}/>} />
          <Route path="/user-view" element={<UserView userId={sessionUser} />} />
          <Route path="/user-view/:id" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;