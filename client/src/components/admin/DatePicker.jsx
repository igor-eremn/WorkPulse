import React from 'react';
import './AdminStyle.css';

function DatePicker({ startDate, setStartDate, endDate, setEndDate, resetDates, fetchData }) {
  return (
    <div className="date-picker-card">
      <div className="date-picker-row">
        <span className="date-picker-label">Start Date:</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="date-picker-input"
        />
      </div>
      <div className="date-picker-row">
        <span className="date-picker-label">End Date:</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="date-picker-input"
        />
      </div>
      <div className="date-picker-actions">
        <button className="date-picker-button" onClick={resetDates}>
          Reset
        </button>

      </div>
    </div>
  );
}

export default DatePicker;