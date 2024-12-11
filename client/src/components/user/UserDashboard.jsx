import React from 'react';
import './UserStyle.css';

import { IoReader } from "react-icons/io5";
import { IoToday } from "react-icons/io5";

function UserDashboard({ setActiveComponent }) {
  return (
    <div className="admin-dashboard">
      <button
        className="admin-dashboard-button"
        onClick={() => setActiveComponent('Dashboard')}
      >
        <IoToday />
      </button>
      <button
        className="admin-dashboard-button"
        onClick={() => setActiveComponent('History')}
      >
        <IoReader />
      </button>
    </div>
  );
}

export default UserDashboard;