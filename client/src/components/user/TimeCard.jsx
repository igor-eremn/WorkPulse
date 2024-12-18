import React from 'react';
import './UserStyle.css';

function TimeCard({ title, date, data }) {
  return (
    <div className="user-sessions-card">
      <h3 className="user-sessions-title">
        {title} {date ? ` - ${date}` : ''}
      </h3>
      <div className="user-sessions-row">
        <div className="user-sessions-labels">
          <p>CLOCK__IN</p>
          <p>BREAK__IN</p>
          <p>BREAK_OUT</p>
          <p>CLOCK_OUT</p>
        </div>
        <div className="user-sessions-times">
          <p>{data?.clock_in_time || 'Not yet'}</p>
          <p>{data?.break_in_time || 'Not yet'}</p>
          <p>{data?.break_out_time || 'Not yet'}</p>
          <p>{data?.clock_out_time || 'Not yet'}</p>
        </div>
      </div>
    </div>
  );
}

export default TimeCard;