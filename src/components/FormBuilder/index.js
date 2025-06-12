import React from 'react';
import DynamicFormBuilder from '../components/DynamicFormBuilder';
import './FormBuilder.css';

const FormBuilder = () => {
  return (
    <div className="form-builder-container">
      <h2>Form Builder</h2>
      <DynamicFormBuilder />
    </div>
  );
};

export default FormBuilder;