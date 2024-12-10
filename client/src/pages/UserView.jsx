import React, { useState } from 'react';
import Header from '../components/Header';
import { useParams } from 'react-router-dom';

function UserView() {
  const { id } = useParams();
  const [activeComponent, setActiveComponent] = useState('Dashboard');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return (
          <div className="sessions-card">
            <h3 className="sessions-title">Today's Sessions</h3>
            <p>Date: 12/5/2024</p>
            <p>Clock In: 10:22:06 PM</p>
            <p>Break Start: 10:22:13 PM</p>
            <p>Break End: 10:22:15 PM</p>
            <p>Clock Out: 10:22:17 PM</p>
          </div>
        );
      case 'History':
        return (
          <div className="user-component-placeholder">
            <p>History of attendance will be shown here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="centered-container">
      <div className="page-style">
        <Header title="WORKPULSE" pageName={`USER VIEW`} />
        <div className="admin-dashboard">
          <button
            className="admin-dashboard-button"
            onClick={() => setActiveComponent('Dashboard')}
          >
            Dashboard
          </button>
          <button
            className="admin-dashboard-button"
            onClick={() => setActiveComponent('History')}
          >
            History
          </button>
        </div>
        <div className="admin-content">{renderComponent()}</div>
      </div>
    </div>
  );
}

export default UserView;