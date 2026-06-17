/**
 * KawasanSehat — Authentication Module
 * ======================================
 * Handles login, logout, session management, password hashing,
 * and password changes — all stored in localStorage.
 * No backend / database required.
 */

const Auth = (function () {
  // ---- Constants ----
  const STORAGE_KEY_USERS  = 'kawasansehat_users';
  const STORAGE_KEY_SESSION = 'kawasansehat_session';
  const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  // ---- Simple hash function (not cryptographic, but prevents plaintext) ----
  function _hash(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'h' + Math.abs(hash).toString(16);
  }

  // ---- Generate random session token ----
  function _generateToken() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var token = '';
    for (var i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token + '_' + Date.now();
  }

  // ---- Get users from localStorage ----
  function _getUsers() {
    try {
      var data = localStorage.getItem(STORAGE_KEY_USERS);
      if (data) return JSON.parse(data);
    } catch (e) { /* ignore */ }
    return null;
  }

  // ---- Save users to localStorage ----
  function _saveUsers(users) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }

  // ---- Initialize default admin account if none exists ----
  function _initDefaultAdmin() {
    var users = _getUsers();
    if (!users) {
      users = {};
      // Default: admin / kawasansehat2025
      users['admin'] = {
        passwordHash: _hash('kawasansehat2025'),
        displayName: 'Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      _saveUsers(users);
    }
  }

  // =============================================
  // PUBLIC API
  // =============================================

  /**
   * Hash a string (exposed for password change forms)
   */
  function hash(str) {
    return _hash(str);
  }

  /**
   * Attempt login. Returns { success: boolean, message: string }
   */
  function login(username, password) {
    _initDefaultAdmin();

    var users = _getUsers();
    if (!users) {
      return { success: false, message: 'Tidak ada data pengguna.' };
    }

    var normalizedUser = username.trim().toLowerCase();
    var user = users[normalizedUser];

    if (!user) {
      return { success: false, message: 'Username atau password tidak valid.' };
    }

    if (user.passwordHash !== _hash(password)) {
      return { success: false, message: 'Username atau password tidak valid.' };
    }

    // Create session
    var session = {
      username: normalizedUser,
      displayName: user.displayName || normalizedUser,
      role: user.role || 'admin',
      token: _generateToken(),
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + SESSION_DURATION_MS
    };

    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    return { success: true, message: 'Login berhasil.' };
  }

  /**
   * Logout — clear session
   */
  function logout() {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }

  /**
   * Check if user is logged in with valid session.
   * Returns session object if valid, null otherwise.
   */
  function getSession() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_SESSION);
      if (!raw) return null;

      var session = JSON.parse(raw);
      if (!session.token || !session.username) return null;

      // Check expiration
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(STORAGE_KEY_SESSION);
        return null;
      }

      return session;
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY_SESSION);
      return null;
    }
  }

  /**
   * Check if user is authenticated (simple boolean)
   */
  function isAuthenticated() {
    return getSession() !== null;
  }

  /**
   * Get current username from session
   */
  function getCurrentUsername() {
    var session = getSession();
    return session ? session.username : null;
  }

  /**
   * Change password for a user.
   * Returns { success: boolean, message: string }
   */
  function changePassword(username, currentPassword, newPassword) {
    var users = _getUsers();
    if (!users) {
      return { success: false, message: 'Tidak ada data pengguna.' };
    }

    var normalizedUser = username.trim().toLowerCase();
    var user = users[normalizedUser];

    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Verify current password
    if (user.passwordHash !== _hash(currentPassword)) {
      return { success: false, message: 'Password saat ini salah.' };
    }

    // Validate new password
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Password baru minimal 4 karakter.' };
    }

    // Update password
    user.passwordHash = _hash(newPassword);
    _saveUsers(users);

    return { success: true, message: 'Password berhasil diubah.' };
  }

  /**
   * Get user info (without password hash)
   */
  function getUserInfo(username) {
    var users = _getUsers();
    if (!users) return null;

    var normalizedUser = username.trim().toLowerCase();
    var user = users[normalizedUser];
    if (!user) return null;

    return {
      username: normalizedUser,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  // ---- Initialize on load ----
  _initDefaultAdmin();

  // ---- Public API ----
  return {
    hash: hash,
    login: login,
    logout: logout,
    getSession: getSession,
    isAuthenticated: isAuthenticated,
    getCurrentUsername: getCurrentUsername,
    changePassword: changePassword,
    getUserInfo: getUserInfo
  };
})();
