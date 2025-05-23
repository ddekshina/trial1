// hooks/useFormValidation.js
import { useState, useCallback } from 'react';

const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);

  // Validation rules
  const validationRules = {
    pricingAnalystName: {
      required: true,
      pattern: /^pricing/i,
      message: 'Pricing analyst name must start with "pricing"'
    },
    clientName: {
      required: true,
      message: 'Client name is required'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phoneNumber: {
      required: true,
      message: 'Phone number is required'
    },
    projectTitle: {
      required: true,
      message: 'Project title is required'
    },
    projectDescription: {
      required: true,
      minLength: 10,
      message: 'Project description must be at least 10 characters'
    },
    businessObjective: {
      required: true,
      minLength: 10,
      message: 'Business objective must be at least 10 characters'
    },
    companySize: {
      required: true,
      min: 1,
      message: 'Company size must be greater than 0'
    },
    annualRevenue: {
      required: true,
      min: 0,
      message: 'Annual revenue must be a positive number'
    },
    budgetRange: {
      required: true,
      min: 0,
      message: 'Budget range must be a positive number'
    },
    startDate: {
      required: true,
      message: 'Start date is required'
    },
    endDate: {
      required: true,
      message: 'End date is required'
    },
    country: {
      required: true,
      message: 'Country is required'
    },
    city: {
      required: true,
      message: 'City is required'
    }
  };

  // Validate individual field
  const validateField = useCallback((fieldName, value) => {
    const rule = validationRules[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || `${fieldName} is required`;
    }

    // Pattern validation
    if (rule.pattern && value && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} format is invalid`;
    }

    // Minimum length validation
    if (rule.minLength && value && value.length < rule.minLength) {
      return rule.message || `${fieldName} must be at least ${rule.minLength} characters`;
    }

    // Minimum value validation
    if (rule.min !== undefined && value && parseFloat(value) < rule.min) {
      return rule.message || `${fieldName} must be at least ${rule.min}`;
    }

    return null;
  }, []);

  // Validate entire form
  const validateForm = useCallback((formData) => {
    const newErrors = {};
    let formIsValid = true;

    // Validate each field
    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    // Custom validations
    
    // Date validation: end date should be after start date
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
        formIsValid = false;
      }
    }

    // At least one deliverable should be selected
    if (!formData.expectedDeliverables || formData.expectedDeliverables.length === 0) {
      newErrors.expectedDeliverables = 'At least one deliverable must be selected';
      formIsValid = false;
    }

    // Validate deliverable quantities
    if (formData.expectedDeliverables && formData.expectedDeliverables.length > 0) {
      const invalidDeliverables = formData.expectedDeliverables.some(
        d => !d.quantity || d.quantity <= 0
      );
      if (invalidDeliverables) {
        newErrors.expectedDeliverables = 'All selected deliverables must have a quantity greater than 0';
        formIsValid = false;
      }
    }

    // API test kit link validation when API is available
    if (formData.apiAvailable && formData.apiTestKitLink) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(formData.apiTestKitLink)) {
        newErrors.apiTestKitLink = 'Please enter a valid URL starting with http:// or https://';
        formIsValid = false;
      }
    }

    // Google Spreadsheet URL validation
    if (formData.googleSpreadsheet) {
      const googleSheetsPattern = /^https:\/\/docs\.google\.com\/spreadsheets\//;
      if (!googleSheetsPattern.test(formData.googleSpreadsheet)) {
        newErrors.googleSpreadsheet = 'Please enter a valid Google Sheets URL';
        formIsValid = false;
      }
    }

    setErrors(newErrors);
    setIsValid(formIsValid);
    
    return { isValid: formIsValid, errors: newErrors };
  }, [validateField]);

  // Clear specific field error
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearFieldError,
    clearErrors
  };
};

export default useFormValidation;