import ApiAdapter from './storage.adapter.js';

class AuthService {
  constructor() {
    this.api = new ApiAdapter('users');
    this.sessionKey = 'loggedInUser';
  }

  async register(userData) {
    // Removed the query({email}) that caused 404
    // We now create directly – if email exists we'll handle the error below

    const validData = {
      ...userData,
      // WARNING: Password stored in plaintext – use secure hashing in production!
      createdAt: new Date().toISOString(),
    };

    try {
      const newUser = await this.api.create(validData);
      return newUser;
    } catch (err) {
      // MockAPI returns 500 or generic error when duplicate email is attempted
      // (it has no unique constraint, but sometimes rejects duplicates)
      if (err.message.includes('API Error')) {
        throw new Error(
          'Email already registered or server error. Try another email.',
        );
      }
      throw new Error('Registration failed: ' + err.message);
    }
  }

  async login(email, password) {
    try {
      const users = await this.api.query({ email: email });
      // WARNING: Plaintext password comparison – use hashing in production!
      const user = users.find((u) => u.password === password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      localStorage.setItem(this.sessionKey, JSON.stringify(user));
      return user;
    } catch (err) {
      throw new Error(err.message || 'Login failed');
    }
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    window.location.href = 'login.html';
  }

  getCurrentUser() {
    const str = localStorage.getItem(this.sessionKey);
    return str ? JSON.parse(str) : null;
  }

  ensureAuth() {
    if (!this.getCurrentUser()) window.location.href = 'login.html';
  }

  ensureGuest() {
    if (this.getCurrentUser()) window.location.href = 'index.html';
  }
}

export const authService = new AuthService();
