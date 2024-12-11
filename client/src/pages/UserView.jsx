import React, { useState } from 'react';
import Header from '../components/Header';
import UserDashboard from '../components/user/UserDashboard';
import UserControlPanel from '../components/user/UserControlPanel';
import UserHistory from '../components/user/UserHistory';

function UserView() {
  const [activeComponent, setActiveComponent] = useState('Dashboard');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <UserControlPanel />;
      case 'History':
        return <UserHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="centered-container">
      <div className="page-style">
        <Header title="WORKPULSE" pageName="USER VIEW" />
        <UserDashboard setActiveComponent={setActiveComponent} />
        <div className="admin-user-content">{renderComponent()}</div>
      </div>
    </div>
  );
}

export default UserView;