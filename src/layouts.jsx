import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './navbar';
import Sidebar from './sidebar';
import './App.css'
function Layout() {
  return (
    <div className="app">
        <Sidebar />
      <div className="main-content">
      <Header />
      <div className="content">
        <main>
          <Outlet />
        </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;