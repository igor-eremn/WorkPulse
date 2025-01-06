import React, { useEffect, useState } from 'react';
import './UserStyle.css';
import TimeCard from './TimeCard';
import HoursStat from './HoursStat';
const apiUrl = import.meta.env.VITE_API_URL;

function UserHistory({ id }) {
  const [historyData, setHistoryData] = useState([]);
  const [hours, setHours] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${apiUrl}/attendance/${id}`, {
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

        if (Array.isArray(data) && data.length > 0) {
          const formatTime = (dateString) =>
            dateString
              ? new Date(dateString).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hourCycle: 'h23',
                })
              : 'Not yet';
          
          const extractDate = (dateString) =>
            dateString
              ? new Date(dateString).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'No date';
          
          const formattedData = data.map((record) => ({
            ...record,
            date: extractDate(record.clock_in_time),
            clock_in_time: formatTime(record.clock_in_time),
            break_in_time: formatTime(record.break_in_time),
            break_out_time: formatTime(record.break_out_time),
            clock_out_time: formatTime(record.clock_out_time),
          }));

          setHistoryData(formattedData);
        } else {
          setHistoryData([]);
        }
      } catch (err) {
        console.error('Error:', err.message);
      }
    };
    fetchHistory();

    const fetchHours = async () => {
      try {
        const response = await fetch(`${apiUrl}/attendance/hours/month/${id}`, {
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
        setHours(data.hours);
      } catch (err) {
        console.error('Error:', err.message);
      }
    };
    fetchHours();
  }, [id]);

  return (
    <>
      <HoursStat hours={hours} />
      {historyData.length > 0 ? (
        historyData.map((session, index) => (
          <TimeCard
            key={index}
            title="Records of "
            date={session.date}
            data={{
              clock_in_time: session.clock_in_time,
              clock_out_time: session.clock_out_time,
              break_in_time: session.break_in_time,
              break_out_time: session.break_out_time,
            }}
          />
        ))
      ) : (
        <p>No records found.</p>
      )}
    </>
  );
}

export default UserHistory;