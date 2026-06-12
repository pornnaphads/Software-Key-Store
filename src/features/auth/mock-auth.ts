export const MOCK_USERS_STORAGE_KEY = "mock_users";
export const MOCK_USER_COOKIE = "mock_user";
export const MOCK_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface MockUser {
  name: string;
  email: string;
  password: string;
}

interface Credentials {
  email: string;
  password: string;
}

type RegistrationResult =
  | { status: "success"; user: MockUser }
  | { status: "duplicate" }
  | { status: "unavailable" };

type AuthenticationResult =
  | { status: "success"; user: MockUser }
  | { status: "invalid" }
  | { status: "unavailable" };

interface CookieTarget {
  cookie: string;
}

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function browserDocument(): CookieTarget | null {
  try {
    return typeof document === "undefined" ? null : document;
  } catch {
    return null;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isMockUser(value: unknown): value is MockUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<MockUser>;
  return (
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.password === "string"
  );
}

function parseMockUsers(raw: string | null): MockUser[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isMockUser).map((user) => ({
      name: user.name.trim(),
      email: normalizeEmail(user.email),
      password: user.password,
    }));
  } catch {
    return [];
  }
}

export function loadMockUsers(
  storage: Storage | null = browserStorage(),
): MockUser[] {
  if (!storage) {
    return [];
  }

  try {
    return parseMockUsers(storage.getItem(MOCK_USERS_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function registerMockUser(
  input: MockUser,
  storage: Storage | null = browserStorage(),
): RegistrationResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  try {
    const users = parseMockUsers(storage.getItem(MOCK_USERS_STORAGE_KEY));
    const user = {
      name: input.name.trim(),
      email: normalizeEmail(input.email),
      password: input.password,
    };

    if (users.some((entry) => entry.email === user.email)) {
      return { status: "duplicate" };
    }

    storage.setItem(
      MOCK_USERS_STORAGE_KEY,
      JSON.stringify([...users, user]),
    );
    return { status: "success", user };
  } catch {
    return { status: "unavailable" };
  }
}

export function authenticateMockUser(
  credentials: Credentials,
  storage: Storage | null = browserStorage(),
): AuthenticationResult {
  if (!storage) {
    return { status: "unavailable" };
  }

  try {
    const email = normalizeEmail(credentials.email);
    const user = parseMockUsers(storage.getItem(MOCK_USERS_STORAGE_KEY)).find(
      (entry) =>
        entry.email === email && entry.password === credentials.password,
    );

    return user ? { status: "success", user } : { status: "invalid" };
  } catch {
    return { status: "unavailable" };
  }
}

export function createMockUserCookie(name: string): string {
  return [
    `${MOCK_USER_COOKIE}=${encodeURIComponent(name.trim())}`,
    "Path=/",
    `Max-Age=${MOCK_SESSION_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ].join("; ");
}

export function readMockUserCookie(cookieHeader: string): string | null {
  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${MOCK_USER_COOKIE}=`));

  if (!entry) {
    return null;
  }

  try {
    return decodeURIComponent(entry.slice(MOCK_USER_COOKIE.length + 1)) || null;
  } catch {
    return null;
  }
}

export function setMockUserSession(
  name: string,
  target: CookieTarget | null = browserDocument(),
): boolean {
  if (!target) {
    return false;
  }

  try {
    target.cookie = createMockUserCookie(name);
    return true;
  } catch {
    return false;
  }
}

export function clearMockUserSession(
  target: CookieTarget | null = browserDocument(),
): boolean {
  if (!target) {
    return false;
  }

  try {
    target.cookie = `${MOCK_USER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return true;
  } catch {
    return false;
  }
}
