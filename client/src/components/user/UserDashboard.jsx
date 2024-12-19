import React from 'react';
import './UserStyle.css';

import { IoReader } from "react-icons/io5";
import { IoToday } from "react-icons/io5";

function UserDashboard({ scrollToSection }) {
  return (
    <div className="admin-dashboard">
      <button
        className="admin-dashboard-button"
        onClick={() => scrollToSection('Dashboard')}
      >
        <IoToday />
      </button>
      <button
        className="admin-dashboard-button"
        onClick={() => scrollToSection('History')}
      >
        <IoReader />
      </button>
    </div>
  );
}

export default UserDashboard;