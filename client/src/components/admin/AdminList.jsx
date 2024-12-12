import React, { useEffect, useState } from 'react';
import './AdminStyle.css';
import ListCardTemplate from './ListCardTemplate';

function List() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/employees/user', {
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
  }, []);

  return (
    <div className="list-container">
      <h3 className="list-title">Regular Users</h3>
      {users.length > 0 ? (
        users.map(user => (
          <ListCardTemplate key={user.id} name={user.name} role={user.role} />
        ))
      ) : (
        <p>No users found</p>
      )}
    </div>
  );
}

export default List;