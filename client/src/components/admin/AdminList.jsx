import React, { useEffect, useState } from 'react';
import './AdminStyle.css';
import ListCardTemplate from './ListCardTemplate';
import DatePicker from './DatePicker';

function List() {
  const [users, setUsers] = useState([]);
  const [startDate, setStartDate] = useState('2024-12-01');
  const [endDate, setEndDate] = useState('2024-12-18');
  const [datesAreSet, setDatesAreSet] = useState(false);

  const resetDates = () => {
    const today = new Date().toLocaleDateString('en-CA');
    setStartDate(today);
    setEndDate(today);
    setDatesAreSet(false);
  };

  const fetchUsers = async () => {
    try {
      const url = datesAreSet
        ? `http://localhost:3000/employees/user/total/period?startDate=${startDate}&endDate=${endDate}`
        : `http://localhost:3000/employees/user/total`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [datesAreSet, startDate, endDate]);

  useEffect(() => {
    setDatesAreSet(true);
  }, [startDate, endDate]);

  return (
    <>
      <DatePicker
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        resetDates={resetDates}
      />
      <div className="admin-stat-line">
        <h3 className="admin-stat-title">
          {datesAreSet ? `Hours for Selected Dates:` : 'Total Hours Stats:'}
        </h3>
      </div>
      <div className="list-container">
        {users.length > 0 ? (
          users.map(user => (
            <ListCardTemplate
              key={user.id}
              name={user.name}
              id={user.id}
              hoursWorked={user.hours_worked}
              datesAreSet={datesAreSet}
              startDate={startDate}
              endDate={endDate}
            />
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </>
  );
}

export default List;