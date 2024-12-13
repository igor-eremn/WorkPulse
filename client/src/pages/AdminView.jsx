import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminList from '../components/admin/AdminList';
import AdminStatistics from '../components/admin/AdminStatistics';
import AdminDates from '../components/admin/AdminDates';
import { useNavigate } from 'react-router-dom';

function AdminView( { userId } ) {
  const [activeComponent, setActiveComponent] = useState('List');
  const navigate = useNavigate();

  const id = userId;
  useEffect(() => {
    if((id == 0) || (id == null) || (id == undefined)){
      navigate('/');
    }else{
      console.log('ADMIN VIEW SAYS: uid -> ', id);
    }
  }, []);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'List':
        return <AdminList />;
      case 'Statistics':
        return <AdminStatistics />;
      default:
        return null;
    }
  };

  return (
    <div className="centered-container">
      <div className="page-style">
        <Header title="WORKPULSE" pageName="ADMIN PAGE" />
        <AdminDashboard setActiveComponent={setActiveComponent} />
        <div className="admin-user-content">{renderComponent()}</div>
      </div>
    </div>
  );
}

export default AdminView;