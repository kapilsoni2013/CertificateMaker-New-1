# Certificate Maker Tool

A comprehensive web application for creating custom certificates by mapping dynamic form data to specific regions on certificate templates.

## Features

### 1. Dynamic Form Builder
- Create custom form templates with various field types:
  - Text Input
  - Number Input
  - Dropdown/Select
  - Date Picker
  - Textarea
- Assign unique region identifiers to each field
- Manage form templates with full CRUD operations

### 2. Student Records Management
- Select from created form templates to add student records
- Dynamically render form fields based on the selected template
- View, edit, and delete student records
- Group records by form template type

### 3. Certificate Template Management
- Upload certificate template images (PNG/JPG)
- Interactive region mapping with HTML5 Canvas
- Select region identifiers from available form fields
- Set text formatting options (font size, color, alignment)
- Visual feedback for selected regions

### 4. Certificate Generation
- Triple-selection process:
  1. Select Form Template
  2. Select Certificate Template
  3. Select Student Record(s)
- Automatic data mapping using region identifiers
- Preview certificates with student data overlaid
- Batch generation for multiple students
- Download options: PNG, PDF, or Print

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/certificate-maker.git
cd certificate-maker
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Creating a Form Template
1. Navigate to the "Form Builder" section
2. Click "Create New Template"
3. Add a name and description for your template
4. Add fields with the "+ Add Field" button
5. Configure each field's type, label, and region identifier
6. Click "Create Template" to save

### Adding Student Records
1. Navigate to the "Student Records" section
2. Select a form template from the dropdown
3. Click "Add New Record"
4. Fill in the form fields with student data
5. Click "Add Record" to save

### Creating a Certificate Template
1. Navigate to the "Certificate Templates" section
2. Click "Upload Template"
3. Enter a name and upload an image file
4. Click "Upload Template" to save
5. Click "Edit" on the uploaded template
6. Click and drag on the image to create regions
7. Select a region identifier for each region
8. Set formatting options for each region
9. Click "Save Template" to save changes

### Generating Certificates
1. Navigate to the "Generate Certificates" section
2. Select a form template
3. Select a compatible certificate template
4. Select a student record or enable batch mode
5. Preview the certificate
6. Download as image/PDF or print

## Data Storage

All data is stored in the browser's localStorage:
- Form templates
- Student records
- Certificate templates

## Technologies Used

- React.js
- HTML5 Canvas
- React Router
- Context API for state management
- html2canvas for certificate generation
- jsPDF for PDF export

## License

This project is licensed under the MIT License - see the LICENSE file for details.