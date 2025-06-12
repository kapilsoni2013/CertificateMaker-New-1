# Certificate Maker Tool

A comprehensive web application for creating custom certificates by mapping student data to specific regions on certificate templates.

## Features

### Student Records Management
- Add, edit, and delete student records
- Store student details including name, roll number, class/grade, and subject marks
- Persistent storage using browser localStorage

### Certificate Template Management
- Upload certificate template images (PNG/JPG)
- Interactive region mapping using HTML5 Canvas
- Define rectangular regions on templates and map them to student data fields
- Visual feedback with colored borders and labels for selected regions

### Certificate Generation
- Select from saved certificate templates
- Choose student records to generate certificates for
- Automatic data mapping between student records and template regions
- Preview generated certificates with student data overlaid on templates
- Download certificates as images or PDFs, or print them directly

## Technology Stack

- **React.js** - Frontend library
- **React Router** - Navigation and routing
- **React Context API** - State management
- **HTML5 Canvas** - Template region selection
- **localStorage** - Data persistence
- **html2canvas** - Certificate image generation
- **jsPDF** - PDF generation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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

### Adding Student Records

1. Navigate to the "Student Records" section
2. Click "Add New Student"
3. Fill in the student details including name, roll number, class/grade
4. Add subject marks by clicking "Add Subject"
5. Click "Add Student" to save the record

### Creating Certificate Templates

1. Navigate to the "Template Manager" section
2. Click "Upload New Template"
3. Enter a template name and upload an image file
4. After uploading, click "Edit Regions" on the template card
5. Click and drag on the template to create rectangular regions
6. Name each region to match student data fields (e.g., "name", "roll_number", "math_marks")
7. Click "Save Template" when finished

### Generating Certificates

1. Navigate to the "Generate Certificates" section
2. Select a certificate template from the dropdown
3. Select a student record from the dropdown
4. Click "Generate Certificate" to preview the certificate
5. Customize text appearance using the font options
6. Download the certificate as an image or PDF, or print it directly

## Data Field Mapping

When creating template regions, use these field names to map to student data:

- `name` - Student's name
- `roll_number` - Student's roll number
- `class` - Student's class/grade
- `[subject_name]_marks` - Marks for a specific subject (e.g., "math_marks", "science_marks")
- `total_marks` - Sum of all subject marks
- `percentage` - Overall percentage score

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by [Emoji](https://emojipedia.org/)
- PDF generation powered by [jsPDF](https://github.com/MrRio/jsPDF)
- Image capture powered by [html2canvas](https://github.com/niklasvh/html2canvas)