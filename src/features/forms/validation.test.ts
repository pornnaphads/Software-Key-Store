import { describe, expect, it } from "vitest";

import {
  validateCheckoutContact,
  validateContact,
  validateLogin,
  validateRegistration,
} from "@/features/forms/validation";

describe("login validation", () => {
  it("requires email and password", () => {
    expect(validateLogin({ email: "", password: "" }).fields).toEqual({
      email: expect.any(String),
      password: expect.any(String),
    });
  });

  it("normalizes and validates email", () => {
    expect(
      validateLogin({ email: "  USER@Example.com ", password: "secret" }),
    ).toMatchObject({
      valid: true,
      values: { email: "user@example.com" },
    });
    expect(
      validateLogin({ email: "invalid", password: "secret" }).fields.email,
    ).toBeDefined();
  });
});

describe("registration validation", () => {
  it("requires all fields and accepted terms", () => {
    const result = validateRegistration({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    });

    expect(result.valid).toBe(false);
    expect(result.fields).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
      confirmPassword: expect.any(String),
      termsAccepted: expect.any(String),
    });
  });

  it("requires a six-character password and matching confirmation", () => {
    expect(
      validateRegistration({
        name: "Mint",
        email: "mint@example.com",
        password: "short",
        confirmPassword: "different",
        termsAccepted: true,
      }).fields,
    ).toMatchObject({
      password: expect.any(String),
      confirmPassword: expect.any(String),
    });
  });
});

describe("checkout validation", () => {
  it("requires customer names and a valid delivery email", () => {
    expect(
      validateCheckoutContact({
        firstName: " ",
        lastName: "",
        email: "invalid",
      }).fields,
    ).toMatchObject({
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
    });
  });
});

describe("contact validation", () => {
  it("rejects whitespace-only values and invalid email", () => {
    expect(
      validateContact({
        name: " ",
        email: "wrong",
        subject: " ",
        message: " ",
      }).fields,
    ).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      subject: expect.any(String),
      message: expect.any(String),
    });
  });
});
