import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import AdminView from './pages/AdminView';
import UserView from './pages/UserView';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-view" element={<AdminView />} />
          <Route path="/user-view/:id" element={<UserView />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;