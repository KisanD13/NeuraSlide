// Define ValidationResult locally since it's not exported from helper
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const validateDashboardRequest = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Validate date range if provided
  if (data.filters?.dateRange) {
    const { start, end } = data.filters.dateRange;

    if (!start || !end) {
      errors.push(
        "Both start and end dates are required for date range filter"
      );
    } else {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime())) {
        errors.push("Invalid start date format");
      }

      if (isNaN(endDate.getTime())) {
        errors.push("Invalid end date format");
      }

      if (startDate > endDate) {
        errors.push("Start date cannot be after end date");
      }

      // Limit date range to 90 days
      const daysDiff =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 90) {
        errors.push("Date range cannot exceed 90 days");
      }
    }
  }

  // Validate module filter
  if (data.filters?.module) {
    const validModules = [
      "conversations",
      "automations",
      "products",
      "ai",
      "campaigns",
    ];
    if (!validModules.includes(data.filters.module)) {
      errors.push(
        "Invalid module filter. Must be one of: conversations, automations, products, ai, campaigns"
      );
    }
  }

  // Validate status filter
  if (data.filters?.status) {
    if (typeof data.filters.status !== "string") {
      errors.push("Status filter must be a string");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
