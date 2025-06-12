import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  students: [],
  templates: [],
  selectedStudent: null,
  selectedTemplate: null,
  notification: null
};

// Action types
const ActionTypes = {
  ADD_STUDENT: 'ADD_STUDENT',
  UPDATE_STUDENT: 'UPDATE_STUDENT',
  DELETE_STUDENT: 'DELETE_STUDENT',
  SET_SELECTED_STUDENT: 'SET_SELECTED_STUDENT',
  ADD_TEMPLATE: 'ADD_TEMPLATE',
  UPDATE_TEMPLATE: 'UPDATE_TEMPLATE',
  DELETE_TEMPLATE: 'DELETE_TEMPLATE',
  SET_SELECTED_TEMPLATE: 'SET_SELECTED_TEMPLATE',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.ADD_STUDENT:
      return {
        ...state,
        students: [...state.students, action.payload]
      };
    case ActionTypes.UPDATE_STUDENT:
      return {
        ...state,
        students: state.students.map(student => 
          student.id === action.payload.id ? action.payload : student
        )
      };
    case ActionTypes.DELETE_STUDENT:
      return {
        ...state,
        students: state.students.filter(student => student.id !== action.payload)
      };
    case ActionTypes.SET_SELECTED_STUDENT:
      return {
        ...state,
        selectedStudent: action.payload
      };
    case ActionTypes.ADD_TEMPLATE:
      return {
        ...state,
        templates: [...state.templates, action.payload]
      };
    case ActionTypes.UPDATE_TEMPLATE:
      return {
        ...state,
        templates: state.templates.map(template => 
          template.id === action.payload.id ? action.payload : template
        )
      };
    case ActionTypes.DELETE_TEMPLATE:
      return {
        ...state,
        templates: state.templates.filter(template => template.id !== action.payload)
      };
    case ActionTypes.SET_SELECTED_TEMPLATE:
      return {
        ...state,
        selectedTemplate: action.payload
      };
    case ActionTypes.SET_NOTIFICATION:
      return {
        ...state,
        notification: action.payload
      };
    case ActionTypes.CLEAR_NOTIFICATION:
      return {
        ...state,
        notification: null
      };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  // Load data from localStorage on initial render
  const loadInitialState = () => {
    try {
      const studentsData = localStorage.getItem('students');
      const templatesData = localStorage.getItem('templates');
      
      return {
        ...initialState,
        students: studentsData ? JSON.parse(studentsData) : [],
        templates: templatesData ? JSON.parse(templatesData) : []
      };
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(appReducer, loadInitialState());

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('students', JSON.stringify(state.students));
      localStorage.setItem('templates', JSON.stringify(state.templates));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      dispatch({ 
        type: ActionTypes.SET_NOTIFICATION, 
        payload: { 
          type: 'error', 
          message: 'Failed to save data to local storage' 
        } 
      });
    }
  }, [state.students, state.templates]);

  // Helper function to show notifications
  const showNotification = (type, message) => {
    dispatch({ 
      type: ActionTypes.SET_NOTIFICATION, 
      payload: { type, message } 
    });
    
    // Auto-clear notification after 5 seconds
    setTimeout(() => {
      dispatch({ type: ActionTypes.CLEAR_NOTIFICATION });
    }, 5000);
  };

  // Actions
  const addStudent = (student) => {
    const newStudent = {
      ...student,
      id: Date.now().toString()
    };
    dispatch({ type: ActionTypes.ADD_STUDENT, payload: newStudent });
    showNotification('success', 'Student added successfully');
    return newStudent;
  };

  const updateStudent = (student) => {
    dispatch({ type: ActionTypes.UPDATE_STUDENT, payload: student });
    showNotification('success', 'Student updated successfully');
  };

  const deleteStudent = (id) => {
    dispatch({ type: ActionTypes.DELETE_STUDENT, payload: id });
    showNotification('success', 'Student deleted successfully');
  };

  const setSelectedStudent = (student) => {
    dispatch({ type: ActionTypes.SET_SELECTED_STUDENT, payload: student });
  };

  const addTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString()
    };
    dispatch({ type: ActionTypes.ADD_TEMPLATE, payload: newTemplate });
    showNotification('success', 'Template added successfully');
    return newTemplate;
  };

  const updateTemplate = (template) => {
    dispatch({ type: ActionTypes.UPDATE_TEMPLATE, payload: template });
    showNotification('success', 'Template updated successfully');
  };

  const deleteTemplate = (id) => {
    dispatch({ type: ActionTypes.DELETE_TEMPLATE, payload: id });
    showNotification('success', 'Template deleted successfully');
  };

  const setSelectedTemplate = (template) => {
    dispatch({ type: ActionTypes.SET_SELECTED_TEMPLATE, payload: template });
  };

  // Value object to be provided to consumers
  const value = {
    students: state.students,
    templates: state.templates,
    selectedStudent: state.selectedStudent,
    selectedTemplate: state.selectedTemplate,
    notification: state.notification,
    addStudent,
    updateStudent,
    deleteStudent,
    setSelectedStudent,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setSelectedTemplate,
    showNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;