import React from 'react';
import './AdminStyle.css';

import { IoList } from "react-icons/io5";
import { IoStatsChart } from "react-icons/io5";
import { IoCalendarClearSharp } from "react-icons/io5";

function AdminDashboard({ setActiveComponent }) {
  return (
    <div className="dashboard">
      <button className="dashboard-button" onClick={() => setActiveComponent('List')}><IoList /></button>
      <button className="dashboard-button" onClick={() => setActiveComponent('Statistics')}><IoStatsChart /></button>
      <button className="dashboard-button" onClick={() => setActiveComponent('Dates')}><IoCalendarClearSharp /></button>
    </div>
  );
}

export default AdminDashboard;