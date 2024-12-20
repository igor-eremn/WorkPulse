import React from 'react';
import './AdminStyle.css';
import { IoDownload } from "react-icons/io5";
const apiUrl = import.meta.env.VITE_API_URL;

function ListCardTemplate({ name, hoursWorked, id, datesAreSet, startDate, endDate }) {
  const download = async () => {
    try {
      const baseURL = `${apiUrl}/employees/user`;
      const url = datesAreSet
        ? `${baseURL}/${id}/total/period/download?startDate=${startDate}&endDate=${endDate}`
        : `${baseURL}/${id}/total/download`;

      console.log(`🚀 ~ Downloading report for: ${name}`);
      console.log(`🚀 ~ Using URL: ${url}`);

      const response = await fetch(url, { method: 'GET' });

      if (!response.ok) {
        throw new Error('Failed to download the file');
      }

      const blob = await response.blob();
      const downloadURL = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadURL;

      const fileName = datesAreSet
        ? `attendance_${name}_${startDate}_to_${endDate}.xlsx`
        : `total_hours_worked_${name}.xlsx`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadURL);
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