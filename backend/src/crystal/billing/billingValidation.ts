// Define ValidationResult locally
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const validateCreateSubscription = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.planId || typeof data.planId !== 'string') {
    errors.push('Plan ID is required and must be a string');
  }

  if (data.paymentMethodId && typeof data.paymentMethodId !== 'string') {
    errors.push('Payment method ID must be a string');
  }

  if (data.trialDays !== undefined) {
    if (typeof data.trialDays !== 'number' || data.trialDays < 0 || data.trialDays > 90) {
      errors.push('Trial days must be a number between 0 and 90');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUpdateSubscription = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (data.planId && typeof data.planId !== 'string') {
    errors.push('Plan ID must be a string');
  }

  if (data.cancelAtPeriodEnd !== undefined && typeof data.cancelAtPeriodEnd !== 'boolean') {
    errors.push('Cancel at period end must be a boolean');
  }

  // At least one field must be provided
  if (!data.planId && data.cancelAtPeriodEnd === undefined) {
    errors.push('At least one field must be provided for update');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCreatePaymentMethod = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.type || typeof data.type !== 'string') {
    errors.push('Payment method type is required');
  } else {
    const validTypes = ['CARD', 'BANK_ACCOUNT', 'PAYPAL'];
    if (!validTypes.includes(data.type)) {
      errors.push('Payment method type must be one of: CARD, BANK_ACCOUNT, PAYPAL');
    }
  }

  if (!data.stripePaymentMethodId || typeof data.stripePaymentMethodId !== 'string') {
    errors.push('Stripe payment method ID is required and must be a string');
  }

  if (data.isDefault !== undefined && typeof data.isDefault !== 'boolean') {
    errors.push('Is default must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateInvoiceQuery = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (data.limit !== undefined) {
    if (typeof data.limit !== 'number' || data.limit < 1 || data.limit > 100) {
      errors.push('Limit must be a number between 1 and 100');
    }
  }

  if (data.offset !== undefined) {
    if (typeof data.offset !== 'number' || data.offset < 0) {
      errors.push('Offset must be a non-negative number');
    }
  }

  if (data.status && typeof data.status !== 'string') {
    errors.push('Status must be a string');
  } else if (data.status) {
    const validStatuses = ['DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE'];
    if (!validStatuses.includes(data.status)) {
      errors.push('Status must be one of: DRAFT, OPEN, PAID, VOID, UNCOLLECTIBLE');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUsageQuery = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (data.feature && typeof data.feature !== 'string') {
    errors.push('Feature must be a string');
  }

  if (data.period && typeof data.period !== 'string') {
    errors.push('Period must be a string');
  } else if (data.period) {
    // Validate YYYY-MM format
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(data.period)) {
      errors.push('Period must be in YYYY-MM format');
    }
  }

  if (data.startDate && typeof data.startDate !== 'string') {
    errors.push('Start date must be a string');
  } else if (data.startDate) {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('Start date must be a valid date');
    }
  }

  if (data.endDate && typeof data.endDate !== 'string') {
    errors.push('End date must be a string');
  } else if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('End date must be a valid date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStripeWebhook = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.id || typeof data.id !== 'string') {
    errors.push('Webhook ID is required and must be a string');
  }

  if (!data.type || typeof data.type !== 'string') {
    errors.push('Webhook type is required and must be a string');
  }

  if (!data.data || typeof data.data !== 'object') {
    errors.push('Webhook data is required and must be an object');
  }

  if (!data.data?.object) {
    errors.push('Webhook data must contain an object');
  }

  if (typeof data.created !== 'number') {
    errors.push('Webhook created timestamp is required and must be a number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
