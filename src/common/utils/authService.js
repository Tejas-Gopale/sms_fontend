// src/services/authService.js

import axios from 'axios';
import { storeAuthData, clearAuthData, getRefreshToken, updateTokens } from '../utils/tokenStorage';

const BASE_URL = 'http://localhost:8085/api/v1';

/**
 * Login with email and password
 * Stores tokens and user data on success
 */
export const login = async (email, password) => {
  const { data } = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  storeAuthData(data);
  return data;
};

/**
 * Manually refresh the access token using the stored refresh token
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
  updateTokens(data);
  return data;
};

/**
 * Logout: clears local storage and optionally notifies backend
 */
export const logout = () => {
  clearAuthData();
};
