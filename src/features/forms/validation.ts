import type { FieldErrors, ValidationResult } from "@/types/commerce";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginValues {
  email: string;
  password: string;
}

interface RegistrationValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

interface CheckoutContactValues {
  firstName: string;
  lastName: string;
  email: string;
}

interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function result<T extends object>(
  values: T,
  fields: FieldErrors<T>,
): ValidationResult<T> {
  return {
    valid: Object.keys(fields).length === 0,
    values,
    fields,
  };
}

function validateEmail(email: string): string | undefined {
  if (!email) {
    return "กรุณากรอกอีเมล";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "รูปแบบอีเมลไม่ถูกต้อง";
  }

  return undefined;
}

export function validateLogin(
  input: LoginValues,
): ValidationResult<LoginValues> {
  const values = {
    email: normalizeEmail(input.email),
    password: input.password,
  };
  const fields: FieldErrors<LoginValues> = {};
  const emailError = validateEmail(values.email);

  if (emailError) {
    fields.email = emailError;
  }
  if (!values.password) {
    fields.password = "กรุณากรอกรหัสผ่าน";
  }

  return result(values, fields);
}

export function validateRegistration(
  input: RegistrationValues,
): ValidationResult<RegistrationValues> {
  const values = {
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    password: input.password,
    confirmPassword: input.confirmPassword,
    termsAccepted: input.termsAccepted,
  };
  const fields: FieldErrors<RegistrationValues> = {};
  const emailError = validateEmail(values.email);

  if (!values.name) {
    fields.name = "กรุณากรอกชื่อ-นามสกุล";
  }
  if (emailError) {
    fields.email = emailError;
  }
  if (!values.password) {
    fields.password = "กรุณากรอกรหัสผ่าน";
  } else if (values.password.length < 6) {
    fields.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  }
  if (!values.confirmPassword) {
    fields.confirmPassword = "กรุณายืนยันรหัสผ่าน";
  } else if (values.password !== values.confirmPassword) {
    fields.confirmPassword = "รหัสผ่านและการยืนยันไม่ตรงกัน";
  }
  if (!values.termsAccepted) {
    fields.termsAccepted = "กรุณายอมรับข้อกำหนดและเงื่อนไข";
  }

  return result(values, fields);
}

export function validateCheckoutContact(
  input: CheckoutContactValues,
): ValidationResult<CheckoutContactValues> {
  const values = {
    firstName: input.firstName.trim() || "Guest",
    lastName: input.lastName.trim() || "User",
    email: normalizeEmail(input.email) || "guest@example.com",
  };
  const fields: FieldErrors<CheckoutContactValues> = {};
  return result(values, fields);
}

export function validateContact(
  input: ContactValues,
): ValidationResult<ContactValues> {
  const values = {
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    subject: input.subject.trim(),
    message: input.message.trim(),
  };
  const fields: FieldErrors<ContactValues> = {};
  const emailError = validateEmail(values.email);

  if (!values.name) {
    fields.name = "กรุณากรอกชื่อ";
  }
  if (emailError) {
    fields.email = emailError;
  }
  if (!values.subject) {
    fields.subject = "กรุณาระบุหัวข้อ";
  }
  if (!values.message) {
    fields.message = "กรุณากรอกข้อความ";
  }

  return result(values, fields);
}
