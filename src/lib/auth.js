/**
 * Browser-only auth using localStorage.
 * Passwords are stored unhashed — acceptable for this prototype only.
 * In production, use a real backend with proper hashing (bcrypt, etc.).
 */

const USERS_KEY = "intellect_users";
const SESSION_KEY = "intellect_session";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ username: user.username, email: user.email })
  );
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session && session.username && session.email) return session;
    return null;
  } catch {
    return null;
  }
}

export function register(username, email, password, confirmPassword) {
  const errors = {};

  if (!username || !username.trim()) errors.username = "Username is required.";
  if (!email || !email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Invalid email format.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters.";
  if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, errors: { email: "An account with this email already exists." } };
  }

  const newUser = { username: username.trim(), email: email.trim().toLowerCase(), password };
  users.push(newUser);
  saveUsers(users);
  setSession(newUser);
  return { ok: true, user: { username: newUser.username, email: newUser.email } };
}

export function login(email, password) {
  const errors = {};

  if (!email || !email.trim()) errors.email = "Email is required.";
  if (!password) errors.password = "Password is required.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return { ok: false, errors: { general: "Invalid email or password." } };
  }

  setSession(user);
  return { ok: true, user: { username: user.username, email: user.email } };
}

export function logout() {
  clearSession();
}
