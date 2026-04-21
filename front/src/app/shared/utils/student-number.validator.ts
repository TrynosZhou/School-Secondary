// src/app/utils/student-number.validator.ts

/**
 * Verifies a student number using the Luhn algorithm check digit.
 * The student number format is expected to be LYYMMNNNC (e.g., S24070014),
 * where the last digit is the check digit.
 *
 * @param studentNumber The complete student number string, including the check digit.
 * @returns True if the check digit is valid, false otherwise.
 */
export function verifyStudentNumber(studentNumber: string): boolean {
  // 1. Basic validation: Ensure the input is a non-empty string of the correct length.
  // Format is LYYMMNNNC, which is 9 characters long.
  if (
    !studentNumber ||
    typeof studentNumber !== 'string' ||
    studentNumber.length < 9
  ) {
    return false;
  }

  // 2. Separate the number into its parts.
  const rawStudentNumber = studentNumber.substring(0, studentNumber.length - 1);
  const originalCheckDigit = parseInt(
    studentNumber.charAt(studentNumber.length - 1),
    10
  );

  // Check if the original check digit is a valid number.
  if (isNaN(originalCheckDigit)) {
    return false;
  }

  // 3. Recalculate the check digit using the Luhn algorithm logic.
  let sum = 0;
  let isSecondDigit = false;

  // The numeric part for the calculation starts after the first character (the 'S').
  const numericPart = rawStudentNumber.substring(1);

  // Iterate through the numeric part from right to left.
  for (let i = numericPart.length - 1; i >= 0; i--) {
    let digit = parseInt(numericPart.charAt(i), 10);

    // If any character is not a digit, the number is invalid.
    if (isNaN(digit)) {
      return false;
    }

    if (isSecondDigit) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isSecondDigit = !isSecondDigit;
  }

  // 4. Compare the original check digit with the newly calculated one.
  const calculatedCheckDigit = (10 - (sum % 10)) % 10;

  return calculatedCheckDigit === originalCheckDigit;
}
