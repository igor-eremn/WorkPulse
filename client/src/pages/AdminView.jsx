import React, { useState } from 'react';
import Header from '../components/Header';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminList from '../components/admin/AdminList';
import AdminStatistics from '../components/admin/AdminStatistics';
import AdminDates from '../components/admin/AdminDates';

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
      <div className="page-style">
        <Header title="WORKPULSE" pageName="ADMIN PAGE" />
        <AdminDashboard setActiveComponent={setActiveComponent} />
        <div className="admin-content">{renderComponent()}</div>
      </div>
    </div>
  );
}

export default AdminView;