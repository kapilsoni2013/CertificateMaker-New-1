import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import DynamicFormBuilder from './components/DynamicFormBuilder';
import StudentRecords from './components/StudentRecords';
import TemplateManager from './components/TemplateManager';
import CertificateGenerator from './components/CertificateGenerator';
import Home from './components/Home';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form-builder" element={<DynamicFormBuilder />} />
          <Route path="/student-records" element={<StudentRecords />} />
          <Route path="/template-manager" element={<TemplateManager />} />
          <Route path="/certificate-generator" element={<CertificateGenerator />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;