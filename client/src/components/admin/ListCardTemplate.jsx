import React from 'react';
import './AdminStyle.css';

function ListCardTemplate({ name, role }) {
  return (
    <div className="list-card">
      <p className="list-card-name">Name: {name}</p>
      <p className="list-card-role">Role: {role === 0 ? 'Regular User' : 'Admin'}</p>
    </div>
  );
}

export default ListCardTemplate;