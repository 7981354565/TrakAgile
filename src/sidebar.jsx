import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './button';
import './sidebar.css';
import photo from './assets/defaultprofilephoto.jpeg';
// import  traagilelogo from './assets/traagilelogo.jpeg';
import { FaHome, FaUsers, FaTasks, FaClipboardList, FaCalendarCheck, FaSignOutAlt, FaMapMarkerAlt, FaMap, FaCog } from 'react-icons/fa';

function Sidebar() {
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
          <h2 className="username">Admin</h2>
          <p className="role">{userName}</p>
        </div>
      </div>
      <nav className="nav">
        <Button to="/dashboard" icon={<FaHome className="icon" />} label="Dashboard" />
        <Button to="/task-management" icon={<FaTasks className="icon" />} label="Tasks" />
        <Button to="/employees" icon={<FaUsers className="icon" />} label="Employees" />
        <Button to="/attendance" icon={<FaCalendarCheck className="icon" />} label="Attendance" />
        <Button to="/leave-tracking" icon={<FaClipboardList className="icon" />} label="Leaves" />
        <Button to="/sites" icon={<FaMap className="icon" />} label="Sites" /> {/* Updated icon */}
        {/* <Button to="/user-management" icon={<FaUser className="icon" />} label="FRT Team" />
        <Button to="/request-tracking" icon={<FaFileAlt className="icon" />} label="Settings" /> */}
        <Button to="/settings" icon={<FaCog className="icon" />} label="Settings" /> {/* Updated icon */}
        <Button onClick={handleLogoutClick} icon={<FaSignOutAlt className="icon" />} label="Logout" /> {/* Attach onClick */}
      </nav>
    </div>
  );
}

export default Sidebar;
