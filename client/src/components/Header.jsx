import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ title }) {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <h1 onClick={goHome}>{title}</h1>
    </header>
  );
}

export default Header;