import React from 'react';
import { NavLink } from 'react-router-dom';
import './button.css';

function Button({ to, icon, label, onClick }) {
  const handleClick = (event) => {
    if (onClick) {
      event.preventDefault(); // Prevent the default navigation
      onClick(); // Call the onClick handler
    }
  };

  return (
    <NavLink 
      to={to} 
      className="nav-item" 
      onClick={handleClick}
    >
      {icon}
      <span className="label">{label}</span>
    </NavLink>
  );
}

export default Button;
