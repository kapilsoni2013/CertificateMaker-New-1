import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Button, Paper, Grid, TextField, 
  MenuItem, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Divider, Card, 
  CardContent, CardActions, Select, FormControl,
  InputLabel, FormHelperText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../../context/AppContext';

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'select', label: 'Dropdown/Select' },
  { value: 'date', label: 'Date Picker' },
  { value: 'textarea', label: 'Textarea' }
];

const DynamicFormBuilder = () => {
  const { 
    formTemplates, 
    setFormTemplates, 
    saveToLocalStorage 
  } = useContext(AppContext);
  
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentField, setCurrentField] = useState({
    id: '',
    type: 'text',
    label: '',
    region_identifier: '',
    required: false,
    options: [] // For select/dropdown fields
  });
  const [errors, setErrors] = useState({});
  const [selectOption, setSelectOption] = useState('');

  // Load templates from context on component mount
  useEffect(() => {
    if (!formTemplates) {
      setFormTemplates([]);
    }
  }, [formTemplates, setFormTemplates]);

  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setFormName('');
    setFields([]);
    setIsEditing(true);
  };

  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setFormName(template.name);
    setFields([...template.fields]);
    setIsEditing(true);
  };

  const handleDeleteTemplate = (templateId) => {
    const updatedTemplates = formTemplates.filter(t => t.id !== templateId);
    setFormTemplates(updatedTemplates);
    saveToLocalStorage('formTemplates', updatedTemplates);
  };

  const handleSaveTemplate = () => {
    if (!formName.trim()) {
      setErrors({...errors, formName: 'Form name is required'});
      return;
    }
    
    if (fields.length === 0) {
      setErrors({...errors, fields: 'At least one field is required'});
      return;
    }

    // Check for duplicate region identifiers
    const identifiers = fields.map(f => f.region_identifier);
    const hasDuplicates = identifiers.some((id, index) => 
      identifiers.indexOf(id) !== index
    );
    
    if (hasDuplicates) {
      setErrors({...errors, fields: 'Duplicate region identifiers found'});
      return;
    }

    const template = {
      id: currentTemplate ? currentTemplate.id : uuidv4(),
      name: formName,
      fields: fields,
      createdAt: currentTemplate ? currentTemplate.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedTemplates;
    if (currentTemplate) {
      updatedTemplates = formTemplates.map(t => 
        t.id === template.id ? template : t
      );
    } else {
      updatedTemplates = [...formTemplates, template];
    }

    setFormTemplates(updatedTemplates);
    saveToLocalStorage('formTemplates', updatedTemplates);
    setIsEditing(false);
    setErrors({});
  };

  const handleOpenFieldDialog = (field = null) => {
    if (field) {
      setCurrentField({...field});
    } else {
      setCurrentField({
        id: uuidv4(),
        type: 'text',
        label: '',
        region_identifier: '',
        required: false,
        options: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseFieldDialog = () => {
    setOpenDialog(false);
    setSelectOption('');
  };

  const handleAddField = () => {
    // Validate field
    const fieldErrors = {};
    if (!currentField.label.trim()) {
      fieldErrors.label = 'Label is required';
    }
    if (!currentField.region_identifier.trim()) {
      fieldErrors.region_identifier = 'Region identifier is required';
    } else if (!/^[a-z0-9_]+$/.test(currentField.region_identifier)) {
      fieldErrors.region_identifier = 'Only lowercase letters, numbers, and underscores allowed';
    } else {
      // Check for duplicate identifiers (excluding current field if editing)
      const isDuplicate = fields.some(f => 
        f.region_identifier === currentField.region_identifier && 
        f.id !== currentField.id
      );
      if (isDuplicate) {
        fieldErrors.region_identifier = 'This identifier is already used';
      }
    }

    if (currentField.type === 'select' && currentField.options.length === 0) {
      fieldErrors.options = 'At least one option is required';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    // Add or update field
    let updatedFields;
    const existingFieldIndex = fields.findIndex(f => f.id === currentField.id);
    
    if (existingFieldIndex >= 0) {
      updatedFields = [...fields];
      updatedFields[existingFieldIndex] = {...currentField};
    } else {
      updatedFields = [...fields, {...currentField}];
    }
    
    setFields(updatedFields);
    handleCloseFieldDialog();
    setErrors({});
  };

  const handleDeleteField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleAddOption = () => {
    if (!selectOption.trim()) {
      setErrors({...errors, selectOption: 'Option cannot be empty'});
      return;
    }
    
    setCurrentField({
      ...currentField,
      options: [...currentField.options, selectOption.trim()]
    });
    
    setSelectOption('');
    setErrors({...errors, selectOption: null, options: null});
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = [...currentField.options];
    updatedOptions.splice(index, 1);
    setCurrentField({...currentField, options: updatedOptions});
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFields(items);
  };

  // Render form preview
  const renderFormPreview = () => {
    return (
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Form Preview: {formName}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            {fields.map((field) => (
              <Box key={field.id} sx={{ mb: 3 }}>
                {field.type === 'text' && (
                  <TextField
                    fullWidth
                    label={field.label}
                    required={field.required}
                    helperText={`Region ID: ${field.region_identifier}`}
                  />
                )}
                {field.type === 'number' && (
                  <TextField
                    fullWidth
                    type="number"
                    label={field.label}
                    required={field.required}
                    helperText={`Region ID: ${field.region_identifier}`}
                  />
                )}
                {field.type === 'textarea' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={field.label}
                    required={field.required}
                    helperText={`Region ID: ${field.region_identifier}`}
                  />
                )}
                {field.type === 'date' && (
                  <TextField
                    fullWidth
                    type="date"
                    label={field.label}
                    required={field.required}
                    InputLabelProps={{ shrink: true }}
                    helperText={`Region ID: ${field.region_identifier}`}
                  />
                )}
                {field.type === 'select' && (
                  <FormControl fullWidth required={field.required}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select label={field.label}>
                      {field.options.map((option, idx) => (
                        <MenuItem key={idx} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{`Region ID: ${field.region_identifier}`}</FormHelperText>
                  </FormControl>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render field dialog
  const renderFieldDialog = () => {
    return (
      <Dialog open={openDialog} onClose={handleCloseFieldDialog} fullWidth>
        <DialogTitle>
          {currentField.id ? 'Edit Field' : 'Add New Field'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Field Label"
              value={currentField.label}
              onChange={(e) => setCurrentField({...currentField, label: e.target.value})}
              error={!!errors.label}
              helperText={errors.label}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Region Identifier"
              value={currentField.region_identifier}
              onChange={(e) => setCurrentField({
                ...currentField, 
                region_identifier: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
              })}
              error={!!errors.region_identifier}
              helperText={errors.region_identifier || "Unique identifier used to map data to certificate regions"}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={currentField.type}
                label="Field Type"
                onChange={(e) => setCurrentField({...currentField, type: e.target.value})}
              >
                {fieldTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {currentField.type === 'select' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Options
                </Typography>
                
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Option"
                    value={selectOption}
                    onChange={(e) => setSelectOption(e.target.value)}
                    error={!!errors.selectOption}
                    helperText={errors.selectOption}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddOption}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
                
                {errors.options && (
                  <Typography color="error" variant="caption">
                    {errors.options}
                  </Typography>
                )}
                
                <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
                  {currentField.options.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No options added yet
                    </Typography>
                  ) : (
                    currentField.options.map((option, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          borderBottom: index < currentField.options.length - 1 ? '1px solid #eee' : 'none'
                        }}
                      >
                        <Typography>{option}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveOption(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Paper>
              </Box>
            )}
            
            <FormControl sx={{ mt: 2 }}>
              <label>
                <input
                  type="checkbox"
                  checked={currentField.required}
                  onChange={(e) => setCurrentField({...currentField, required: e.target.checked})}
                />
                {' '}Required Field
              </label>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFieldDialog}>Cancel</Button>
          <Button onClick={handleAddField} variant="contained">
            {currentField.id ? 'Update Field' : 'Add Field'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Form builder interface
  const renderFormBuilder = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Form Template Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            error={!!errors.formName}
            helperText={errors.formName}
          />
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Form Fields
            {errors.fields && (
              <Typography component="span" color="error" sx={{ ml: 2, fontSize: '0.8rem' }}>
                {errors.fields}
              </Typography>
            )}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenFieldDialog()}
          >
            Add Field
          </Button>
        </Box>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ mb: 3 }}
              >
                {fields.length === 0 ? (
                  <Paper 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <Typography color="text.secondary">
                      No fields added yet. Click "Add Field" to start building your form.
                    </Typography>
                  </Paper>
                ) : (
                  fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{ 
                            p: 2, 
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Box {...provided.dragHandleProps} sx={{ mr: 2, color: 'text.secondary' }}>
                            <DragIcon />
                          </Box>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1">
                              {field.label}
                              {field.required && (
                                <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
                              )}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                Type: {fieldTypes.find(t => t.value === field.type)?.label}
                              </Typography>
                              <Typography variant="caption" color="primary">
                                Region ID: {field.region_identifier}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenFieldDialog(field)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={() => handleDeleteField(field.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Paper>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<PreviewIcon />}
              onClick={() => setShowPreview(true)}
              sx={{ mr: 2 }}
              disabled={fields.length === 0}
            >
              Preview Form
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSaveTemplate}
            >
              Save Template
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  // Template list view
  const renderTemplateList = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Dynamic Form Templates</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateTemplate}
          >
            Create New Template
          </Button>
        </Box>
        
        {formTemplates.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Form Templates Yet
            </Typography>
            <Typography color="text.secondary" paragraph>
              Create your first dynamic form template to get started.
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleCreateTemplate}
            >
              Create Template
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {formTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mt: 1 }}>
                      {template.fields.slice(0, 3).map((field) => (
                        <Typography key={field.id} variant="caption" display="block" color="text.secondary">
                          • {field.label} ({field.region_identifier})
                        </Typography>
                      ))}
                      {template.fields.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          ...and {template.fields.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleEditTemplate(template)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {isEditing ? renderFormBuilder() : renderTemplateList()}
      {renderFieldDialog()}
      {renderFormPreview()}
    </Box>
  );
};

export default DynamicFormBuilder;