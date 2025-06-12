import React from 'react';
import { Navigate } from 'react-router-dom';

const DynamicFormBuilder = () => {
  return <Navigate to="/form-builder" replace />;
};

export default DynamicFormBuilder;