
export const DELIVERABLE_TYPES = [
  'Dashboards',
  'Charts/Graphs',
  'KPI Reporting',
  'Interactive Reports',
  'Embedded Analytics',
  'Infographics',
  'White-labeled Portals'
];

export class DeliverablesManager {
  constructor(deliverables = []) {
    this.deliverables = deliverables;
  }

  // Add a new deliverable
  addDeliverable(type, quantity = 1, widgets = 0) {
    if (this.hasDeliverable(type)) {
      throw new Error(`Deliverable ${type} already exists`);
    }

    this.deliverables.push({
      type,
      quantity: parseInt(quantity) || 1,
      widgets: parseInt(widgets) || 0
    });

    return this.deliverables;
  }

  // Remove a deliverable by type
  removeDeliverable(type) {
    this.deliverables = this.deliverables.filter(d => d.type !== type);
    return this.deliverables;
  }

  // Update deliverable details
  updateDeliverable(type, field, value) {
    const deliverable = this.deliverables.find(d => d.type === type);
    if (!deliverable) {
      throw new Error(`Deliverable ${type} not found`);
    }

    deliverable[field] = field === 'type' ? value : parseInt(value) || 0;
    return this.deliverables;
  }

  // Check if deliverable type exists
  hasDeliverable(type) {
    return this.deliverables.some(d => d.type === type);
  }

  // Get deliverable by type
  getDeliverable(type) {
    return this.deliverables.find(d => d.type === type) || null;
  }

  // Get total integrations (sum of quantities)
  getTotalIntegrations() {
    return this.deliverables.reduce((sum, d) => sum + (d.quantity || 0), 0);
  }

  // Get total widgets
  getTotalWidgets() {
    return this.deliverables.reduce((sum, d) => sum + (d.widgets || 0), 0);
  }

  // Get deliverables summary
  getSummary() {
    return {
      totalDeliverables: this.deliverables.length,
      totalIntegrations: this.getTotalIntegrations(),
      totalWidgets: this.getTotalWidgets(),
      deliverableTypes: this.deliverables.map(d => d.type)
    };
  }

  // Validate deliverables
  validate() {
    const errors = [];

    if (this.deliverables.length === 0) {
      errors.push('At least one deliverable must be selected');
    }

    this.deliverables.forEach((deliverable, index) => {
      if (!deliverable.type) {
        errors.push(`Deliverable ${index + 1}: Type is required`);
      }

      if (!deliverable.quantity || deliverable.quantity <= 0) {
        errors.push(`${deliverable.type}: Quantity must be greater than 0`);
      }

      if (deliverable.widgets < 0) {
        errors.push(`${deliverable.type}: Widgets cannot be negative`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export to API format
  toAPIFormat() {
    return this.deliverables.map(d => ({
      type: d.type,
      quantity: d.quantity,
      widgets: d.widgets
    }));
  }

  // Import from API format
  static fromAPIFormat(apiData) {
    return new DeliverablesManager(apiData || []);
  }

  // Get all deliverables
  getAll() {
    return [...this.deliverables];
  }

  // Clear all deliverables
  clear() {
    this.deliverables = [];
    return this.deliverables;
  }
}

// Hook for managing deliverables
import { useState, useCallback } from 'react';

export const useDeliverables = (initialDeliverables = []) => {
  const [manager] = useState(() => new DeliverablesManager(initialDeliverables));
  const [deliverables, setDeliverables] = useState(initialDeliverables);

  const updateDeliverables = useCallback(() => {
    setDeliverables([...manager.getAll()]);
  }, [manager]);

  const addDeliverable = useCallback((type, quantity = 1, widgets = 0) => {
    try {
      manager.addDeliverable(type, quantity, widgets);
      updateDeliverables();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [manager, updateDeliverables]);

  const removeDeliverable = useCallback((type) => {
    manager.removeDeliverable(type);
    updateDeliverables();
  }, [manager, updateDeliverables]);

  const updateDeliverable = useCallback((type, field, value) => {
    try {
      manager.updateDeliverable(type, field, value);
      updateDeliverables();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [manager, updateDeliverables]);

  const hasDeliverable = useCallback((type) => {
    return manager.hasDeliverable(type);
  }, [manager]);

  const getDeliverable = useCallback((type) => {
    return manager.getDeliverable(type);
  }, [manager]);

  const getSummary = useCallback(() => {
    return manager.getSummary();
  }, [manager]);

  const validate = useCallback(() => {
    return manager.validate();
  }, [manager]);

  const clear = useCallback(() => {
    manager.clear();
    updateDeliverables();
  }, [manager, updateDeliverables]);

  return {
    deliverables,
    addDeliverable,
    removeDeliverable,
    updateDeliverable,
    hasDeliverable,
    getDeliverable,
    getSummary,
    validate,
    clear
  };
};