/**
 * Password Validation Utilities
 * 
 * Provides comprehensive password validation that matches Supabase's requirements
 * and prevents the WeakPasswordError we encountered during testing.
 * 
 * Requirements:
 * - Minimum 8 characters (instead of 6)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not a common weak password
 */

// List of common weak passwords and patterns that should be rejected
const COMMON_WEAK_PASSWORDS = [
  'password', 'password123', '12345678', 'qwerty', 'abc123',
  'letmein', 'welcome', 'admin', 'password1', 'test', 'test123',
  'guest', 'user', 'root', 'default', '123456789', 'password!',
  'Password123', 'Welcome123', 'Admin123', 'testpassword123',
  'TestPassword123', 'TestPassword123!', 'test123!', 'Test123!',
  'Password123!', 'password123!', 'Welcome123!', 'welcome123!'
];

// Common weak password patterns that Supabase rejects
const WEAK_PATTERNS = [
  /^test.*123.*!?$/i,          // Test + numbers + optional exclamation
  /^password.*123.*!?$/i,      // Password + numbers + optional exclamation  
  /^welcome.*123.*!?$/i,       // Welcome + numbers + optional exclamation
  /^.*123.*!?$/,               // Ending with 123 + optional exclamation
  /^(test|password|welcome|admin|user|guest).*$/i, // Starting with common words
  /^.*[0-9]{3,}.*$/,           // 3+ consecutive numbers
  /^[a-zA-Z]*[0-9]*[!@#$%^&*]*$/, // Simple letter+number+symbol pattern
];

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  requirements: PasswordRequirement[];
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  message: string;
}

/**
 * Validates a password against all security requirements
 * 
 * @param password - The password to validate
 * @returns PasswordValidationResult with detailed feedback
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  // Define all password requirements
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
      met: false
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: false
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter (a-z)',
      test: (pwd) => /[a-z]/.test(pwd),
      met: false
    },
    {
      id: 'number',
      label: 'One number (0-9)',
      test: (pwd) => /\d/.test(pwd),
      met: false
    },
    {
      id: 'special',
      label: 'One special character (!@#$%^&*)',
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      met: false
    },
    {
      id: 'notCommon',
      label: 'Not a common weak password or pattern',
      test: (pwd) => {
        // Check exact matches against common weak passwords
        const isCommonPassword = COMMON_WEAK_PASSWORDS.includes(pwd.toLowerCase());
        if (isCommonPassword) return false;
        
        // Check against weak patterns
        const matchesWeakPattern = WEAK_PATTERNS.some(pattern => pattern.test(pwd));
        return !matchesWeakPattern;
      },
      met: false
    },
    {
      id: 'complexity',
      label: 'Avoid simple patterns (use random characters)',
      test: (pwd) => {
        // Ensure password has good entropy and isn't too predictable
        const hasVariedCharacters = pwd.length >= 10 || 
          (pwd.split('').filter((char, index) => pwd.indexOf(char) === index).length >= pwd.length * 0.7);
        
        // Avoid consecutive characters or simple patterns
        const noConsecutiveChars = !/(.)\1{2,}/.test(pwd); // No 3+ repeated chars
        const noSequentialChars = !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(pwd);
        
        return hasVariedCharacters && noConsecutiveChars && noSequentialChars;
      },
      met: false
    }
  ];

  // Test each requirement
  requirements.forEach(req => {
    req.met = req.test(password);
  });

  // Calculate score based on met requirements
  const metCount = requirements.filter(req => req.met).length;
  const score = Math.round((metCount / requirements.length) * 100);

  // Determine overall validity
  const isValid = metCount === requirements.length;

  // Determine strength level
  let strength: PasswordValidationResult['strength'];
  if (score === 100) {
    strength = 'strong';
  } else if (score >= 80) {
    strength = 'good';
  } else if (score >= 60) {
    strength = 'fair';
  } else if (score >= 40) {
    strength = 'weak';
  } else {
    strength = 'very-weak';
  }

  // Generate helpful message
  let message = '';
  if (isValid) {
    message = 'Password meets all security requirements';
  } else if (password.length === 0) {
    message = 'Password is required';
  } else {
    const unmetRequirements = requirements.filter(req => !req.met);
    if (unmetRequirements.length === 1) {
      message = `Missing: ${unmetRequirements[0].label}`;
    } else {
      message = `Missing ${unmetRequirements.length} requirements`;
    }
  }

  return {
    isValid,
    score,
    requirements,
    strength,
    message
  };
};

/**
 * Get a simple boolean validation result for forms
 * 
 * @param password - The password to validate
 * @returns boolean indicating if password is valid
 */
export const isPasswordValid = (password: string): boolean => {
  return validatePassword(password).isValid;
};

/**
 * Get password strength color for UI indicators
 * 
 * @param strength - The strength level from validation
 * @returns CSS color class or hex color
 */
export const getStrengthColor = (strength: PasswordValidationResult['strength']): string => {
  switch (strength) {
    case 'very-weak':
      return 'text-red-500';
    case 'weak':
      return 'text-orange-500';
    case 'fair':
      return 'text-yellow-500';
    case 'good':
      return 'text-blue-500';
    case 'strong':
      return 'text-green-500';
    default:
      return 'text-gray-400';
  }
};

/**
 * Get password strength label for display
 * 
 * @param strength - The strength level from validation
 * @returns Human-readable strength label
 */
export const getStrengthLabel = (strength: PasswordValidationResult['strength']): string => {
  switch (strength) {
    case 'very-weak':
      return 'Very Weak';
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'good':
      return 'Good';
    case 'strong':
      return 'Strong';
    default:
      return '';
  }
};