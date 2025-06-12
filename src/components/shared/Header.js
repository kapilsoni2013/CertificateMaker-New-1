import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <h1>Certificate Maker</h1>
        <nav>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/form-builder" className={({ isActive }) => isActive ? 'active' : ''}>
                Form Builder
              </NavLink>
            </li>
            <li>
              <NavLink to="/student-records" className={({ isActive }) => isActive ? 'active' : ''}>
                Student Records
              </NavLink>
            </li>
            <li>
              <NavLink to="/template-manager" className={({ isActive }) => isActive ? 'active' : ''}>
                Certificate Templates
              </NavLink>
            </li>
            <li>
              <NavLink to="/certificate-generator" className={({ isActive }) => isActive ? 'active' : ''}>
                Generate Certificates
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;