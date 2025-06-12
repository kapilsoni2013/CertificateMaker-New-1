import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import components
import StudentRecords from './components/StudentRecords';
import TemplateManager from './components/TemplateManager';
import CertificateGenerator from './components/CertificateGenerator';
import FormBuilder from './components/FormBuilder';
import CertificatePreview from './components/CertificatePreview';
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
                <li><Link to="/form-builder">Form Builder</Link></li>
                <li><Link to="/preview">Certificate Preview</Link></li>
              </ul>
            </nav>
            <div className="content-area">
              <Routes>
                <Route path="/" element={<StudentRecords />} />
                <Route path="/templates" element={<TemplateManager />} />
                <Route path="/generator" element={<CertificateGenerator />} />
                <Route path="/form-builder" element={<FormBuilder />} />
                <Route path="/preview" element={<CertificatePreview />} />
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