import React from 'react';
import { useAppContext } from '../../context/AppContext';
import './Header.css';

const Header = () => {
  const { notification } = useAppContext();

  return (
    <header className="header">
      <div className="header-content">
        <h1>Certificate Maker</h1>
        <p>Create custom certificates by mapping student data to templates</p>
      </div>
      
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
    </header>
  );
};

export default Header;