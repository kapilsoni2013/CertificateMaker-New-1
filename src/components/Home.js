import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <h2 className="section-title">Welcome to Certificate Maker Tool</h2>
      <p className="intro">
        Create custom certificates by mapping student data to specific regions on certificate templates.
      </p>
      
      <div className="features">
        <div className="feature-card">
          <h3>1. Dynamic Form Builder</h3>
          <p>Create custom form templates with various field types.</p>
          <Link to="/form-builder" className="btn">Get Started</Link>
        </div>
        
        <div className="feature-card">
          <h3>2. Student Records</h3>
          <p>Fill forms and manage student data using your custom templates.</p>
          <Link to="/student-records" className="btn">Manage Records</Link>
        </div>
        
        <div className="feature-card">
          <h3>3. Certificate Templates</h3>
          <p>Upload certificate designs and map regions to form fields.</p>
          <Link to="/template-manager" className="btn">Manage Templates</Link>
        </div>
        
        <div className="feature-card">
          <h3>4. Certificate Generation</h3>
          <p>Generate certificates by combining templates with student data.</p>
          <Link to="/certificate-generator" className="btn">Generate Certificates</Link>
        </div>
      </div>
      
      <div className="workflow">
        <h3>How It Works</h3>
        <ol>
          <li>Create a dynamic form template with fields for student data</li>
          <li>Upload a certificate template image</li>
          <li>Map regions on the certificate to form fields</li>
          <li>Fill out student records using your form template</li>
          <li>Generate certificates by combining templates with student data</li>
        </ol>
      </div>
    </div>
  );
};

export default Home;