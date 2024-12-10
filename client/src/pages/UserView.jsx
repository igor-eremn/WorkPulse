import Header from '../components/Header';
import { useParams } from 'react-router-dom';

function UserView() {
  const { id } = useParams();

  return (
    <div className="centered-container">
      <div className="page-style">
        <Header title="WORKPULSE" pageName="USER VIEW" />
        <div className="user-dashboard">
          <h2 className="dashboard-title">Employee Dashboard</h2>
          <div className="button-container">
            <button className="dashboard-button clock-in">Clock In</button>
            <button className="dashboard-button end-break">End Break</button>
            <button className="dashboard-button clock-out">Clock Out</button>
          </div>
          <h3 className="sessions-title">Today's Sessions</h3>
          <div className="sessions-card">
            <p>Date: 12/5/2024</p>
            <p>Clock In: 10:22:06 PM</p>
            <p>Break Start: 10:22:13 PM</p>
            <p>Break End: 10:22:15 PM</p>
            <p>Clock Out: 10:22:17 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserView;