import React, { useState, useEffect } from 'react';
import './UserStyle.css';
import SessionControls from './SessionControls';

function UserControlPanel({ id }) {
  const [userSelection, setUserSelection] = useState('idle');

  useEffect(() => {
    const handleUserSelection = async () => {
      switch (userSelection) {
        case 'clock-in':
          await sendClockIn();
          break;
        case 'break-in':
          await sendBreakIn();
          break;
        case 'clock-out':
          await sendClockOut();
          break;
        case 'break-out':
          await sendBreakOut();
          break;
        default:
          break;
      }
      setUserSelection('idle');
    };

    if (userSelection !== 'idle') {
      handleUserSelection();
    }
  }, [userSelection]);

  const sendClockIn = async () => {
    try {
      const response = await fetch(`http://localhost:3000/attendance/clock-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employee_id: id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred');
      }

      console.log('Clock-in successful');
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  const sendClockOut = async () => {
    try {
      const response = await fetch(`http://localhost:3000/attendance/clock-out`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employee_id: id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred');
      }

      console.log('Clock-out successful');
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  const sendBreakIn = async () => {
    try {
      const response = await fetch(`http://localhost:3000/attendance/break-in`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employee_id: id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred');
      }

      console.log('Break-in successful');
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  const sendBreakOut = async () => {
    try {
      const response = await fetch(`http://localhost:3000/attendance/break-out`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employee_id: id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred');
      }

      console.log('Break-out successful');
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  const today = new Date().toLocaleDateString();

  return (
    <>
      <div className="sessions-card">
        <h3 className="sessions-title">Today's Sessions</h3>
        <p>Date: {today}</p>
        <p>Clock In: 10:22:06 PM</p>
        <p>Break Start: 10:22:13 PM</p>
        <p>Break End: 10:22:15 PM</p>
        <p>Clock Out: 10:22:17 PM</p>
      </div>
      <SessionControls setUserSelection={setUserSelection} />
    </>
  );
}

export default UserControlPanel;