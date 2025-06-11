import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/shared/Header';
import Sidebar from './components/shared/Sidebar';
import StudentRecords from './components/StudentRecords';
import TemplateManager from './components/TemplateManager';
import CertificateGenerator from './components/CertificateGenerator';
import NotFound from './components/shared/NotFound';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/students" replace />} />
            <Route path="/students" element={<StudentRecords />} />
            <Route path="/templates" element={<TemplateManager />} />
            <Route path="/generate" element={<CertificateGenerator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;