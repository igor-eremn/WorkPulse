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

  useEffect(() => {
    if (!userId || userId === 0) {
      console.log('No user ID, redirecting to home');
      navigate('/');
    } else {
      console.log('USER VIEW SAYS: uid -> ', userId);
    }
  }, [userId, navigate]);

  return (
    <div className="centered-container">
      <div className="page-style">
        <Header title="WORKPULSE" pageName="USER VIEW" />
        <UserDashboard setActiveComponent={setActiveComponent} />
        <div className="admin-user-content">
          <UserControlPanel id={userId}/>
          <UserHistory id={userId} />
        </div>
      </div>
    </div>
  );
}

export default UserView;