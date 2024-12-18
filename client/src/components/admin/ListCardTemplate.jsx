import React from 'react';
import './AdminStyle.css';
import { IoDownload } from "react-icons/io5";

function ListCardTemplate({ name, hoursWorked, id }) {

  const download = async () => {
    try {
      console.log("🚀 ~ ListCardTemplate ~ Downloading report for:", name)
      const response = await fetch(`http://localhost:3000/employees/user/${id}/total/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download the file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `total_hours_worked_${name}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  return (
    <div className="list-card">
      <div className="list-card-content">
        <p className="list-card-name">Name: {name}</p>
        <p className="list-card-role">Worked: {hoursWorked} h</p>
      </div>
      <IoDownload className="list-card-download" onClick={download} />
    </div>
  );
}

export default ListCardTemplate;