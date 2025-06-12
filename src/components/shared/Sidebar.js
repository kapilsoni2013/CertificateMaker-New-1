import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink 
            to="/students" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={() => setIsOpen(false)}
          >
            <span className="icon">👨‍🎓</span>
            <span className="text">Student Records</span>
          </NavLink>
          <NavLink 
            to="/templates" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={() => setIsOpen(false)}
          >
            <span className="icon">🖼️</span>
            <span className="text">Template Manager</span>
          </NavLink>
          <NavLink 
            to="/generate" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={() => setIsOpen(false)}
          >
            <span className="icon">🏆</span>
            <span className="text">Generate Certificates</span>
          </NavLink>
        </nav>
      </div>
      
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>
    </>
  );
};

export default Sidebar;