/**
 * Validation utilities for forms and inputs
 */

export interface ValidationRule {
  min?: number;
  max?: number;
  required?: boolean;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a number value against rules
 */
export const validateNumber = (
  value: number,
  rules: ValidationRule,
  fieldName: string = 'Value',
  language: 'de' | 'en' = 'de'
): ValidationResult => {
  // Check required
  if (rules.required && (value === null || value === undefined)) {
    return {
      isValid: false,
      error: language === 'de' ? `${fieldName} ist erforderlich` : `${fieldName} is required`,
    };
  }

  // Check for NaN
  if (isNaN(value)) {
    return {
      isValid: false,
      error: language === 'de' ? `${fieldName} muss eine Zahl sein` : `${fieldName} must be a number`,
    };
  }

  // Check min
  if (rules.min !== undefined && value < rules.min) {
    return {
      isValid: false,
      error: language === 'de'
        ? `${fieldName} muss mindestens ${rules.min} sein`
        : `${fieldName} must be at least ${rules.min}`,
    };
  }

  // Check max
  if (rules.max !== undefined && value > rules.max) {
    return {
      isValid: false,
      error: language === 'de'
        ? `${fieldName} darf höchstens ${rules.max} sein`
        : `${fieldName} must be at most ${rules.max}`,
    };
  }

  // Check custom validation
  if (rules.custom && !rules.custom(value)) {
    return {
      isValid: false,
      error: language === 'de' ? `${fieldName} ist ungültig` : `${fieldName} is invalid`,
    };
  }

  return { isValid: true };
};

/**
 * Clamp a number between min and max
 */
export const clampNumber = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * German pension contribution limits (2024)
 */
export const GERMAN_PENSION_LIMITS = {
  // Rürup-Rente (§10a EStG)
  RUERUP_MAX_ANNUAL: 27566, // Max deductible amount 2024
  RUERUP_MAX_MONTHLY: Math.floor(27566 / 12), // ~2,297 EUR/month
  RUERUP_DEDUCTIBLE_RATE: 0.96, // 96% deductible in 2024

  // Riester-Rente
  RIESTER_MIN_ANNUAL: 60, // Minimum contribution
  RIESTER_MIN_MONTHLY: 5, // ~5 EUR/month
  RIESTER_MAX_PERCENT_INCOME: 0.04, // 4% of gross income
  RIESTER_BASIC_ALLOWANCE: 175, // Basic state subsidy
  RIESTER_CHILD_ALLOWANCE_NEW: 300, // Per child born after 2008
  RIESTER_CHILD_ALLOWANCE_OLD: 185, // Per child born before 2008

  // Betriebliche Altersvorsorge
  OCCUPATIONAL_TAX_FREE_MONTHLY: 584, // Social security exempt 2024 (8% of BBG)
  OCCUPATIONAL_TAX_FREE_ANNUAL: 7008, // 584 * 12

  // General limits
  MAX_AGE: 75,
  MIN_RETIREMENT_AGE: 55,
  STANDARD_RETIREMENT_AGE: 67,
  MAX_MONTHLY_CONTRIBUTION: 5000, // Reasonable upper limit
  MAX_START_CAPITAL: 1000000, // 1M EUR reasonable upper limit
};

/**
 * Validate retirement age
 */
export const validateRetirementAge = (
  currentAge: number,
  retirementAge: number,
  language: 'de' | 'en' = 'de'
): ValidationResult => {
  if (retirementAge <= currentAge) {
    return {
      isValid: false,
      error:
        language === 'de'
          ? 'Renteneintrittsalter muss höher als das aktuelle Alter sein'
          : 'Retirement age must be greater than current age',
    };
  }

  if (retirementAge < GERMAN_PENSION_LIMITS.MIN_RETIREMENT_AGE) {
    return {
      isValid: false,
      error:
        language === 'de'
          ? `Renteneintrittsalter muss mindestens ${GERMAN_PENSION_LIMITS.MIN_RETIREMENT_AGE} Jahre sein`
          : `Retirement age must be at least ${GERMAN_PENSION_LIMITS.MIN_RETIREMENT_AGE}`,
    };
  }

  if (retirementAge > GERMAN_PENSION_LIMITS.MAX_AGE) {
    return {
      isValid: false,
      error:
        language === 'de'
          ? `Renteneintrittsalter darf höchstens ${GERMAN_PENSION_LIMITS.MAX_AGE} Jahre sein`
          : `Retirement age must be at most ${GERMAN_PENSION_LIMITS.MAX_AGE}`,
    };
  }

  return { isValid: true };
};

/**
 * Validate Rürup contribution
 */
export const validateRuerupContribution = (
  monthlyContribution: number,
  language: 'de' | 'en' = 'de'
): ValidationResult => {
  const annualContribution = monthlyContribution * 12;

  if (annualContribution > GERMAN_PENSION_LIMITS.RUERUP_MAX_ANNUAL) {
    return {
      isValid: false,
      error:
        language === 'de'
          ? `Rürup-Beitrag darf höchstens ${GERMAN_PENSION_LIMITS.RUERUP_MAX_MONTHLY}€/Monat sein (${GERMAN_PENSION_LIMITS.RUERUP_MAX_ANNUAL}€/Jahr)`
          : `Rürup contribution must be at most ${GERMAN_PENSION_LIMITS.RUERUP_MAX_MONTHLY}€/month (${GERMAN_PENSION_LIMITS.RUERUP_MAX_ANNUAL}€/year)`,
    };
  }

  return { isValid: true };
};

/**
 * Validate Riester contribution
 */
export const validateRiesterContribution = (
  monthlyContribution: number,
  language: 'de' | 'en' = 'de'
): ValidationResult => {
  const annualContribution = monthlyContribution * 12;

  if (annualContribution < GERMAN_PENSION_LIMITS.RIESTER_MIN_ANNUAL) {
    return {
      isValid: false,
      error:
        language === 'de'
          ? `Riester-Beitrag muss mindestens ${GERMAN_PENSION_LIMITS.RIESTER_MIN_ANNUAL}€/Jahr sein`
          : `Riester contribution must be at least ${GERMAN_PENSION_LIMITS.RIESTER_MIN_ANNUAL}€/year`,
    };
  }

  return { isValid: true };
};

/**
 * Validate occupational pension contribution
 */
export const validateOccupationalContribution = (
  monthlyContribution: number,
  language: 'de' | 'en' = 'de'
): ValidationResult => {
  if (monthlyContribution > GERMAN_PENSION_LIMITS.OCCUPATIONAL_TAX_FREE_MONTHLY) {
    return {
      isValid: false,
      error:
        language === 'de'
          ? `Hinweis: Beiträge über ${GERMAN_PENSION_LIMITS.OCCUPATIONAL_TAX_FREE_MONTHLY}€/Monat sind sozialabgabenpflichtig`
          : `Note: Contributions over ${GERMAN_PENSION_LIMITS.OCCUPATIONAL_TAX_FREE_MONTHLY}€/month are subject to social security`,
    };
  }

  return { isValid: true };
};

/**
 * Sanitize number input (remove negative, NaN, etc.)
 */
export const sanitizeNumberInput = (value: any): number => {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.max(0, num); // No negatives
};

/**
 * Format validation error message
 */
export const formatValidationError = (
  fieldName: string,
  error: string,
  language: 'de' | 'en' = 'de'
): string => {
  return `${fieldName}: ${error}`;
};

/**
 * Validate all calculator inputs
 */
export const validateCalculatorInputs = (
  inputs: {
    currentAge: number;
    retirementAge: number;
    monthlyContribution: number;
    startCapital: number;
    expectedReturn: number;
    inflationRate: number;
  },
  productType: 'private' | 'riester' | 'ruerup' | 'occupational',
  language: 'de' | 'en' = 'de'
): ValidationResult[] => {
  const errors: ValidationResult[] = [];

  // Validate current age
  const ageValidation = validateNumber(
    inputs.currentAge,
    { min: 18, max: GERMAN_PENSION_LIMITS.MAX_AGE, required: true },
    language === 'de' ? 'Aktuelles Alter' : 'Current Age',
    language
  );
  if (!ageValidation.isValid) errors.push(ageValidation);

  // Validate retirement age
  const retirementValidation = validateRetirementAge(
    inputs.currentAge,
    inputs.retirementAge,
    language
  );
  if (!retirementValidation.isValid) errors.push(retirementValidation);

  // Validate monthly contribution based on product type
  let contributionValidation: ValidationResult = { isValid: true };
  switch (productType) {
    case 'ruerup':
      contributionValidation = validateRuerupContribution(inputs.monthlyContribution, language);
      break;
    case 'riester':
      contributionValidation = validateRiesterContribution(inputs.monthlyContribution, language);
      break;
    case 'occupational':
      contributionValidation = validateOccupationalContribution(
        inputs.monthlyContribution,
        language
      );
      break;
    default:
      contributionValidation = validateNumber(
        inputs.monthlyContribution,
        { min: 0, max: GERMAN_PENSION_LIMITS.MAX_MONTHLY_CONTRIBUTION, required: true },
        language === 'de' ? 'Monatlicher Beitrag' : 'Monthly Contribution',
        language
      );
  }
  if (!contributionValidation.isValid) errors.push(contributionValidation);

  // Validate start capital
  const capitalValidation = validateNumber(
    inputs.startCapital,
    { min: 0, max: GERMAN_PENSION_LIMITS.MAX_START_CAPITAL, required: true },
    language === 'de' ? 'Startkapital' : 'Start Capital',
    language
  );
  if (!capitalValidation.isValid) errors.push(capitalValidation);

  // Validate expected return
  const returnValidation = validateNumber(
    inputs.expectedReturn,
    { min: 0, max: 15, required: true },
    language === 'de' ? 'Erwartete Rendite' : 'Expected Return',
    language
  );
  if (!returnValidation.isValid) errors.push(returnValidation);

  // Validate inflation rate
  const inflationValidation = validateNumber(
    inputs.inflationRate,
    { min: 0, max: 10, required: true },
    language === 'de' ? 'Inflationsrate' : 'Inflation Rate',
    language
  );
  if (!inflationValidation.isValid) errors.push(inflationValidation);

  return errors;
};
