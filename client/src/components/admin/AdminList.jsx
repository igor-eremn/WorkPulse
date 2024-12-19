import React, { useEffect, useState } from 'react';
import './AdminStyle.css';
import ListCardTemplate from './ListCardTemplate';
import DatePicker from './DatePicker'; // New component for selecting dates

function List() {
  const [users, setUsers] = useState([]);
  const [startDate, setStartDate] = useState('2024-12-01');
  const [endDate, setEndDate] = useState('2024-12-18');
  const [datesAreSet, setDatesAreSet] = useState(false);

  // Reset dates to today and unset the date filter
  const resetDates = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setDatesAreSet(false); // Reset the filter
  };

  // Fetch users based on whether dates are set
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

  // Trigger fetchUsers whenever startDate, endDate, or datesAreSet changes
  useEffect(() => {
    fetchUsers();
  }, [datesAreSet, startDate, endDate]);

  // Update the date filter state when startDate or endDate changes
  useEffect(() => {
    console.log('Date changed:', startDate, endDate);
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