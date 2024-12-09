import React from 'react';
import './AdminStyle.css';

function AdminDashboard({ setActiveComponent }) {
  return (
    <div className="dashboard">
      <button className="dashboard-button" onClick={() => setActiveComponent('List')}>List</button>
      <button className="dashboard-button" onClick={() => setActiveComponent('Statistics')}>Statistics</button>
      <button className="dashboard-button" onClick={() => setActiveComponent('Dates')}>Dates</button>
    </div>
  );
}

export default AdminDashboard;