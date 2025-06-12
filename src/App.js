import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/shared/Header';
import Sidebar from './components/shared/Sidebar';
import StudentList from './components/students/StudentList';
import TemplateList from './components/templates/TemplateList';
import CertificateCreator from './components/certificates/CertificateCreator';
import CertificateViewer from './components/certificates/CertificateViewer';
import NotFound from './components/shared/NotFound';

// Context
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Header />
        <div className="main-container">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/students" replace />} />
              <Route path="/students" element={<StudentList />} />
              <Route path="/templates" element={<TemplateList />} />
              <Route path="/generate" element={<CertificateCreator />} />
              <Route path="/certificate-preview/:id" element={<CertificateViewer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;