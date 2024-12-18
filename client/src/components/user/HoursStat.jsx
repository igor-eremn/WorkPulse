import React from 'react';
import './UserStyle.css';

function HoursStat({ hours }) {
  return (
    <div className="user-stat-card">
      <h3 className="user-stat-title">
            {`This month you worked: ${hours} hours`} 
      </h3>
    </div>
  );
}

export default HoursStat;