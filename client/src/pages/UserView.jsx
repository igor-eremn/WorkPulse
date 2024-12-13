import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import UserDashboard from '../components/user/UserDashboard';
import UserControlPanel from '../components/user/UserControlPanel';
import UserHistory from '../components/user/UserHistory';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function UserView( { userId } ) {
  const [activeComponent, setActiveComponent] = useState('Dashboard');
  const navigate = useNavigate();

  const id = userId;
    useEffect(() => {
      if((id == 0) || (id == null) || (id == undefined)){
        navigate('/');
      }else{
        console.log('ADMIN VIEW SAYS: uid -> ', id);
      }
    }, []);

  useEffect(() => {
    console.log('USER VIEW SAYS: uid -> ', id);
  }, [id]);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <UserControlPanel id={id}/>;
      case 'History':
        return <UserHistory id={id} />;
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