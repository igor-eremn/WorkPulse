import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ title, pageName }) {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <header className="header-container">
      <h1 className="header-title" onClick={goHome}>
        {title}
      </h1>
      {pageName && <div className="header-label">{pageName}</div>}
    </header>
  );
}

export default Header;