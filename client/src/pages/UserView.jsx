import React, { useEffect, useRef } from 'react';
import Header from '../components/Header';
import UserDashboard from '../components/user/UserDashboard';
import UserControlPanel from '../components/user/UserControlPanel';
import UserHistory from '../components/user/UserHistory';
import { useNavigate } from 'react-router-dom';

function UserView({ userId }) {
  const navigate = useNavigate();

  const controlPanelRef = useRef(null);
  const historyRef = useRef(null);

  useEffect(() => {
    if (!userId || userId === 0) {
      console.log('No user ID, redirecting to home');
      navigate('/');
    } else {
      console.log('USER VIEW SAYS: uid -> ', userId);
    }
  }, [userId, navigate]);
  const scrollToSection = (section) => {
    if (section === 'Dashboard' && controlPanelRef.current) {
      controlPanelRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'History' && historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="centered-container">
      <div className="page-style">
        <div ref={controlPanelRef}>
          <Header title="WORKPULSE" pageName="USER VIEW" />
        </div>
        <UserDashboard scrollToSection={scrollToSection} />
        <div className="admin-user-content">
          <UserControlPanel id={userId} />
          <div ref={historyRef}>
            <UserHistory id={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserView;