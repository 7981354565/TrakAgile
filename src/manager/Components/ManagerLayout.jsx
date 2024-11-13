import React from 'react';
import { Outlet } from 'react-router-dom';
import ManagerHeader from './ManagerNavBar';
import ManagerSideBar from './ManagerSideBar';
import '../Css/ManagerApp.css';
function ManagerLayout() {
  return (
    <div className="app">
        <ManagerSideBar />
      <div className="main-content">
      <ManagerHeader />
      <div className="content">
        <main>
          <Outlet />
        </main>
        </div>
      </div>
    </div>
  );
}

export default ManagerLayout;