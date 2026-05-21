// src/utils/auth.js

// Get admin token
export const getAdminToken = () => localStorage.getItem('adminToken');

// Decode token and get role
export const getUserRoleFromToken = () => {
  const token = getAdminToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));  // Decoding JWT
    return payload.role || null;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

// Return true only if role is admin
export const isAdminUser = () => {
  return getUserRoleFromToken() === 'admin';
};
