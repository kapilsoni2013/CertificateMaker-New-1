import React, { useState, useEffect, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../../context/AppContext';
import styled from 'styled-components';

// Styled components to replace MUI components
const Container = styled.div`
  padding: 20px;
`;

const Button = styled.button`
  background-color: ${props => props.variant === 'contained' ? '#1976d2' : 'white'};
  color: ${props => props.variant === 'contained' ? 'white' : '#1976d2'};
  border: ${props => props.variant === 'outlined' ? '1px solid #1976d2' : 'none'};
  border-radius: 4px;
  padding: 8px 16px;
  margin: ${props => props.margin || '0'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.variant === 'contained' ? '#1565c0' : '#f0f7ff'};
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #9e9e9e;
    cursor: default;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color === 'error' ? '#d32f2f' : '#757575'};
  
  &:hover {
    background-color: #f5f5f5;
    border-radius: 50%;
  }
`;

const TextField = styled.div`
  margin-bottom: ${props => props.mb || '16px'};
  width: 100%;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: ${props => props.error ? '#d32f2f' : '#666'};
  }
  
  input, textarea, select {
    width: 100%;
    padding: 8px;
    border: 1px solid ${props => props.error ? '#d32f2f' : '#ccc'};
    border-radius: 4px;
    font-size: 16px;
    
    &:focus {
      outline: none;
      border-color: #1976d2;
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .helper-text {
    font-size: 12px;
    color: ${props => props.error ? '#d32f2f' : '#666'};
    margin-top: 4px;
  }
`;

const Paper = styled.div`
  background-color: ${props => props.bgColor || 'white'};
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: ${props => props.padding || '16px'};
  margin-bottom: ${props => props.mb || '0'};
`;

const Card = styled.div`
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CardActions = styled.div`
  display: flex;
  padding: 8px;
`;

const Typography = styled.div`
  margin-bottom: ${props => props.mb || '0'};
  color: ${props => {
    if (props.color === 'error') return '#d32f2f';
    if (props.color === 'text.secondary') return '#666';
    if (props.color === 'primary') return '#1976d2';
    return 'inherit';
  }};
  font-size: ${props => {
    if (props.variant === 'h5') return '1.5rem';
    if (props.variant === 'h6') return '1.25rem';
    if (props.variant === 'subtitle1') return '1rem';
    if (props.variant === 'subtitle2') return '0.875rem';
    if (props.variant === 'body2' || props.variant === 'caption') return '0.875rem';
    return '1rem';
  }};
  font-weight: ${props => {
    if (props.variant && props.variant.startsWith('h')) return 'bold';
    if (props.variant && props.variant.startsWith('subtitle')) return 'bold';
    return 'normal';
  }};
  display: ${props => props.display || 'block'};
  text-align: ${props => props.textAlign || 'left'};
`;

const Box = styled.div`
  display: ${props => props.display || 'block'};
  flex-direction: ${props => props.flexDirection || 'row'};
  justify-content: ${props => props.justifyContent || 'flex-start'};
  align-items: ${props => props.alignItems || 'flex-start'};
  margin-bottom: ${props => props.mb || '0'};
  margin-top: ${props => props.mt || '0'};
  margin-right: ${props => props.mr || '0'};
  margin-left: ${props => props.ml || '0'};
  padding: ${props => props.p || '0'};
  flex-grow: ${props => props.flexGrow || '0'};
`;

const FlexBox = styled(Box)`
  display: flex;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 16px;
`;

const GridItem = styled.div`
  grid-column: span ${props => props.xs || 12};
  
  @media (min-width: 600px) {
    grid-column: span ${props => props.sm || props.xs || 12};
  }
  
  @media (min-width: 960px) {
    grid-column: span ${props => props.md || props.sm || props.xs || 12};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 16px 0;
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: white;
  border-radius: 4px;
  width: 100%;
  max-width: ${props => props.maxWidth === 'md' ? '800px' : '500px'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const DialogTitle = styled.div`
  padding: 16px 24px;
  font-size: 1.25rem;
  font-weight: bold;
  border-bottom: 1px solid #eee;
`;

const DialogContent = styled.div`
  padding: 16px 24px;
  overflow-y: auto;
`;

const DialogActions = styled.div`
  padding: 8px 16px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eee;
`;

// Icon components
const AddIcon = () => <span>➕</span>;
const DeleteIcon = () => <span>🗑️</span>;
const EditIcon = () => <span>✏️</span>;
const DragIcon = () => <span>⋮⋮</span>;
const SaveIcon = () => <span>💾</span>;
const PreviewIcon = () => <span>👁️</span>;

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
    if (!showPreview) return null;
    
    return (
      <DialogOverlay>
        <Dialog maxWidth="md">
          <DialogTitle>
            Form Preview: {formName}
          </DialogTitle>
          <DialogContent>
            <Box mt="16px">
              {fields.map((field) => (
                <Box key={field.id} mb="24px">
                  {field.type === 'text' && (
                    <TextField>
                      <label>{field.label}{field.required && ' *'}</label>
                      <input type="text" />
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </TextField>
                  )}
                  {field.type === 'number' && (
                    <TextField>
                      <label>{field.label}{field.required && ' *'}</label>
                      <input type="number" />
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </TextField>
                  )}
                  {field.type === 'textarea' && (
                    <TextField>
                      <label>{field.label}{field.required && ' *'}</label>
                      <textarea rows="4"></textarea>
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </TextField>
                  )}
                  {field.type === 'date' && (
                    <TextField>
                      <label>{field.label}{field.required && ' *'}</label>
                      <input type="date" />
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </TextField>
                  )}
                  {field.type === 'select' && (
                    <TextField>
                      <label>{field.label}{field.required && ' *'}</label>
                      <select>
                        <option value="">Select...</option>
                        {field.options.map((option, idx) => (
                          <option key={idx} value={option}>{option}</option>
                        ))}
                      </select>
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </TextField>
                  )}
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPreview(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </DialogOverlay>
    );
  };

  // Render field dialog
  const renderFieldDialog = () => {
    if (!openDialog) return null;
    
    return (
      <DialogOverlay>
        <Dialog>
          <DialogTitle>
            {currentField.id ? 'Edit Field' : 'Add New Field'}
          </DialogTitle>
          <DialogContent>
            <Box mt="16px">
              <TextField error={!!errors.label} mb="16px">
                <label>Field Label</label>
                <input
                  type="text"
                  value={currentField.label}
                  onChange={(e) => setCurrentField({...currentField, label: e.target.value})}
                />
                {errors.label && <div className="helper-text">{errors.label}</div>}
              </TextField>
              
              <TextField error={!!errors.region_identifier} mb="16px">
                <label>Region Identifier</label>
                <input
                  type="text"
                  value={currentField.region_identifier}
                  onChange={(e) => setCurrentField({
                    ...currentField, 
                    region_identifier: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                  })}
                />
                <div className="helper-text">
                  {errors.region_identifier || "Unique identifier used to map data to certificate regions"}
                </div>
              </TextField>
              
              <TextField mb="16px">
                <label>Field Type</label>
                <select
                  value={currentField.type}
                  onChange={(e) => setCurrentField({...currentField, type: e.target.value})}
                >
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </TextField>
              
              {currentField.type === 'select' && (
                <Box mb="16px">
                  <Typography variant="subtitle2" mb="8px">Options</Typography>
                  
                  <FlexBox mb="8px">
                    <TextField error={!!errors.selectOption} mb="0" style={{flexGrow: 1}}>
                      <input
                        type="text"
                        placeholder="Add Option"
                        value={selectOption}
                        onChange={(e) => setSelectOption(e.target.value)}
                      />
                      {errors.selectOption && <div className="helper-text">{errors.selectOption}</div>}
                    </TextField>
                    <Button variant="contained" onClick={handleAddOption} margin="0 0 0 8px">
                      Add
                    </Button>
                  </FlexBox>
                  
                  {errors.options && (
                    <Typography color="error" variant="caption">
                      {errors.options}
                    </Typography>
                  )}
                  
                  <Paper padding="8px" mt="8px">
                    {currentField.options.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No options added yet
                      </Typography>
                    ) : (
                      currentField.options.map((option, index) => (
                        <FlexBox 
                          key={index} 
                          justifyContent="space-between"
                          alignItems="center"
                          p="8px"
                          style={{
                            borderBottom: index < currentField.options.length - 1 ? '1px solid #eee' : 'none'
                          }}
                        >
                          <Typography>{option}</Typography>
                          <IconButton onClick={() => handleRemoveOption(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </FlexBox>
                      ))
                    )}
                  </Paper>
                </Box>
              )}
              
              <Box mt="16px">
                <label style={{display: 'flex', alignItems: 'center'}}>
                  <input
                    type="checkbox"
                    checked={currentField.required}
                    onChange={(e) => setCurrentField({...currentField, required: e.target.checked})}
                    style={{marginRight: '8px'}}
                  />
                  Required Field
                </label>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFieldDialog}>Cancel</Button>
            <Button onClick={handleAddField} variant="contained">
              {currentField.id ? 'Update Field' : 'Add Field'}
            </Button>
          </DialogActions>
        </Dialog>
      </DialogOverlay>
    );
  };

  // Form builder interface
  const renderFormBuilder = () => {
    return (
      <Container>
        <Box mb="24px">
          <TextField error={!!errors.formName}>
            <label>Form Template Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            {errors.formName && <div className="helper-text">{errors.formName}</div>}
          </TextField>
        </Box>
        
        <FlexBox mb="24px" justifyContent="space-between">
          <Typography variant="h6">
            Form Fields
            {errors.fields && (
              <Typography as="span" color="error" style={{marginLeft: '16px', fontSize: '0.8rem'}}>
                {errors.fields}
              </Typography>
            )}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => handleOpenFieldDialog()}
          >
            <AddIcon /> Add Field
          </Button>
        </FlexBox>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{marginBottom: '24px'}}
              >
                {fields.length === 0 ? (
                  <Paper 
                    padding="24px" 
                    bgColor="#f9f9f9"
                    style={{textAlign: 'center'}}
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
                          padding="16px"
                          mb="16px"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            ...provided.draggableProps.style
                          }}
                        >
                          <div {...provided.dragHandleProps} style={{marginRight: '16px', color: '#666'}}>
                            <DragIcon />
                          </div>
                          
                          <Box flexGrow="1">
                            <Typography variant="subtitle1">
                              {field.label}
                              {field.required && (
                                <Typography as="span" color="error" style={{marginLeft: '4px'}}>*</Typography>
                              )}
                            </Typography>
                            
                            <FlexBox alignItems="center" mt="4px">
                              <Typography variant="caption" color="text.secondary" mr="16px">
                                Type: {fieldTypes.find(t => t.value === field.type)?.label}
                              </Typography>
                              <Typography variant="caption" color="primary">
                                Region ID: {field.region_identifier}
                              </Typography>
                            </FlexBox>
                          </Box>
                          
                          <div>
                            <IconButton 
                              onClick={() => handleOpenFieldDialog(field)}
                              style={{marginRight: '8px'}}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDeleteField(field.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </Paper>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <FlexBox justifyContent="space-between">
          <Button 
            variant="outlined" 
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <div>
            <Button 
              variant="outlined" 
              onClick={() => setShowPreview(true)}
              style={{marginRight: '16px'}}
              disabled={fields.length === 0}
            >
              <PreviewIcon /> Preview Form
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveTemplate}
            >
              <SaveIcon /> Save Template
            </Button>
          </div>
        </FlexBox>
      </Container>
    );
  };

  // Template list view
  const renderTemplateList = () => {
    return (
      <Container>
        <FlexBox mb="24px" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Dynamic Form Templates</Typography>
          <Button 
            variant="contained" 
            onClick={handleCreateTemplate}
          >
            <AddIcon /> Create New Template
          </Button>
        </FlexBox>
        
        {formTemplates.length === 0 ? (
          <Paper padding="24px" bgColor="#f9f9f9" style={{textAlign: 'center'}}>
            <Typography variant="h6" color="text.secondary" mb="16px">
              No Form Templates Yet
            </Typography>
            <Typography color="text.secondary" mb="16px">
              Create your first dynamic form template to get started.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={handleCreateTemplate}
            >
              <AddIcon /> Create Template
            </Button>
          </Paper>
        ) : (
          <Grid>
            {formTemplates.map((template) => (
              <GridItem key={template.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" mb="8px">
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb="8px">
                      {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                    </Typography>
                    <Divider />
                    <Box mt="8px">
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
                      onClick={() => handleEditTemplate(template)}
                    >
                      Edit
                    </Button>
                    <Button 
                      color="error"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </GridItem>
            ))}
          </Grid>
        )}
      </Container>
    );
  };

  return (
    <div>
      {isEditing ? renderFormBuilder() : renderTemplateList()}
      {renderFieldDialog()}
      {renderFormPreview()}
    </div>
  );
};

export default DynamicFormBuilder;