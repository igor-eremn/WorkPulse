import React, { useState, useEffect } from 'react';
import './UserStyle.css';

import SessionControls from './SessionControls';

function UserControlPanel() {
  const [userSelection, setUserSelection] = useState('idle');

  useEffect(() => {
    console.log('User selection:', userSelection);
  }, [userSelection]);

  return (
    <>
      <div className="sessions-card">
        <h3 className="sessions-title">Today's Sessions</h3>
        <p>Date: 12/5/2024</p>
        <p>Clock In: 10:22:06 PM</p>
        <p>Break Start: 10:22:13 PM</p>
        <p>Break End: 10:22:15 PM</p>
        <p>Clock Out: 10:22:17 PM</p>
      </div>
      <SessionControls setUserSelection={setUserSelection}/>
    </>
  );
}

export default UserControlPanel;