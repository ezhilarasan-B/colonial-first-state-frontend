/**
 * Persistent Layout Component
 * Contains Header, Sidebar, Toast notifications container, and the Outlet for child routes.
 * Stays continuously mounted across user route navigations without re-renders or page refreshes.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './layout.css';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Header
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="app-layout__body">
        <Sidebar isOpen={isSidebarOpen} onCloseMobile={handleCloseSidebar} />

        <main className="app-layout__content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

