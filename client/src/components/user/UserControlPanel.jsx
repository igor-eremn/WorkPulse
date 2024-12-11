import React, { useState, useEffect } from 'react';
import './UserStyle.css';
import SessionControls from './SessionControls';

function UserControlPanel({ id }) {
  const [userSelection, setUserSelection] = useState('idle');
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    getTodaySession();
  }, []);

  useEffect(() => {
    const handleUserSelection = async () => {
      switch (userSelection) {
        case 'clock-in':
          await sendClockIn();
          getTodaySession();
          break;
        case 'break-in':
          await sendBreakIn();
          getTodaySession();
          break;
        case 'clock-out':
          await sendClockOut();
          getTodaySession();
          break;
        case 'break-out':
          await sendBreakOut();
          getTodaySession();
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

  const getTodaySession = async () => {
    try {
      const response = await fetch(`http://localhost:3000/attendance/today?employee_id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred');
      }
  
      const data = await response.json();
  
      if (data[0]) {
        const formatTime = (dateString) =>
          dateString ? new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Not yet';
  
        setSessionData({
          ...data[0],
          clock_in_time: formatTime(data[0].clock_in_time),
          break_in_time: formatTime(data[0].break_in_time),
          break_out_time: formatTime(data[0].break_out_time),
          clock_out_time: formatTime(data[0].clock_out_time),
        });
      } else {
        setSessionData(null);
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  };
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div className="sessions-card">
        <h3 className="sessions-title">Today's Sessions - {today}</h3>
        <p>..Started Work: {sessionData?.clock_in_time || 'Not yet'}</p>
        <p>.Started Break: {sessionData?.break_in_time || 'Not yet'}</p>
        <p>Finished Break: {sessionData?.break_out_time || 'Not yet'}</p>
        <p>.Finished Work: {sessionData?.clock_out_time || 'Not yet'}</p>
      </div>
      <SessionControls setUserSelection={setUserSelection} />
    </>
  );
}

export default UserControlPanel;