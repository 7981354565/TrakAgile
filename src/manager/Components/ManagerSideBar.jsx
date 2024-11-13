import React from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerButton from './ManagerButton';
import '../Css/ManagerSideBar.css';
import photo from '../ManagerAssets/defaultprofilephoto.jpeg';
import { FaHome, FaUsers, FaTasks, FaClipboardList, FaCalendarCheck, FaSignOutAlt, FaMapMarkerAlt, FaMap, FaCog } from 'react-icons/fa';

function ManagerSideBar() {
  const userName = localStorage.getItem('username');
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem('token'); // Clear token or any other logout logic
      navigate('/login'); // Redirect to the login page
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaMapMarkerAlt className="header-icon" />
        <span className="header-text">TrakAgile</span>
      </div>
      <div className="profile">
        <img src={photo} alt="User" className="photo" /> <br />
        <div className="profile-info">
          <h2 className="username">Manager</h2>
          <p className="role">{userName}</p>
        </div>
      </div>
      <nav className="nav">
        <ManagerButton to="/manager/dashboard" icon={<FaHome className="icon" />} label="Dashboard" />
        <ManagerButton to="/manager/task-management" icon={<FaTasks className="icon" />} label="Tasks" />
        <ManagerButton to="/manager/employees" icon={<FaUsers className="icon" />} label="Employees" />
        <ManagerButton to="/manager/attendance" icon={<FaCalendarCheck className="icon" />} label="Attendance" />
        <ManagerButton to="/manager/leave-tracking" icon={<FaClipboardList className="icon" />} label="Leaves" />
        <ManagerButton to="/manager/sites" icon={<FaMap className="icon" />} label="Sites" /> {/* Updated icon */}
        {/* <ManagerButton to="/user-management" icon={<FaUser className="icon" />} label="FRT Team" />
        <ManagerButton to="/request-tracking" icon={<FaFileAlt className="icon" />} label="Settings" /> */}
        <ManagerButton to="/manager/settings" icon={<FaCog className="icon" />} label="Settings" /> {/* Updated icon */}
        <ManagerButton onClick={handleLogoutClick} icon={<FaSignOutAlt className="icon" />} label="Logout" /> {/* Attach onClick */}
      </nav>
    </div>
  );
}

export default ManagerSideBar;
