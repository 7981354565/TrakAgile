import React from 'react';
import '../Css/ManagerNavBar.css';
import { FaBell, FaUser } from 'react-icons/fa';

function ManagerHeader() {
  const userName = localStorage.getItem('username');
  return (
    <header className="header">
      <h5>My Header</h5>
      <div className="headerIcons">
        <button className="icon-button"><FaBell /></button>
        <button className="icon-button"><FaUser /> {userName}</button>
      </div>
    </header>
  );
}

export default ManagerHeader;
