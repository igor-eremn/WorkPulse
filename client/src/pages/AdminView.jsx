import React, { useState } from 'react';
import Header from '../components/Header';
import AdminDashboard from '../components/AdminDashboard';
import AdminList from '../components/List';
import AdminStatistics from '../components/Statistics';
import AdminDates from '../components/Dates';

function AdminView() {
  const [activeComponent, setActiveComponent] = useState('List');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'List':
        return <AdminList />;
      case 'Statistics':
        return <AdminStatistics />;
      case 'Dates':
        return <AdminDates />;
      default:
        return null;
    }
  };

  return (
    <div className="centered-container">
      <Header title="WORKPULSE" pageName="ADMIN PAGE" />
      <AdminDashboard setActiveComponent={setActiveComponent} />
      <div className="admin-content">{renderComponent()}</div>
    </div>
  );
}

export default AdminView;