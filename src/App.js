import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import components
import StudentRecords from './components/StudentRecords';
import TemplateManager from './components/TemplateManager';
import CertificateGenerator from './components/CertificateGenerator';
import DynamicFormBuilder from './components/DynamicFormBuilder';
import { AppProvider } from './context/AppContext';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Header />
          <div className="main-content">
            <nav className="main-nav">
              <ul>
                <li><Link to="/">Student Records</Link></li>
                <li><Link to="/templates">Template Manager</Link></li>
                <li><Link to="/generator">Certificate Generator</Link></li>
                <li><Link to="/form-builder">Dynamic Form Builder</Link></li>
              </ul>
            </nav>
            <div className="content-area">
              <Routes>
                <Route path="/" element={<StudentRecords />} />
                <Route path="/templates" element={<TemplateManager />} />
                <Route path="/generator" element={<CertificateGenerator />} />
                <Route path="/form-builder" element={<DynamicFormBuilder />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;