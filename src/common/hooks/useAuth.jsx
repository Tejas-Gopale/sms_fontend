// src/common/hooks/useAuth.jsx
//
// ✅ FCM is now initialised here — inside AuthProvider — so it fires
//    automatically for EVERY role (Super Admin, School Admin, Teacher,
//    Parent, Student) as soon as the user logs in, with no extra code
//    needed in any Dashboard or page component.
//
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAuthenticated, getUserData, clearAuthData } from '../utils/tokenStorage';
import { login as loginService, logout as logoutService } from '../services/authService';
import { useFCM } from './useFCM';

const AuthContext = createContext(null);

// ── Inner component so we can call useFCM (a hook) inside the Provider ──────
function AuthProviderInner({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session from localStorage on mount ─────────────────────────────
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUserData());
    }
    setLoading(false);
  }, []);

  // ── Listen for forced logout (e.g. 401 from axios interceptor) ────────────
  useEffect(() => {
    const handleForceLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // ── 🔔 FCM: auto-init on login, auto-reset on logout ─────────────────────
  //    useFCM watches `user`: when user becomes non-null (login) it registers
  //    the FCM token; when user becomes null (logout) it resets.
  useFCM(user);

  const login = useCallback(async (email, password) => {
    const data = await loginService(email, password);
    setUser(getUserData()); // ← this triggers useFCM
    return data;
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null); // ← this triggers useFCM to reset
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Public exports ────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => (
  <AuthProviderInner>{children}</AuthProviderInner>
);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
// // src/hooks/useAuth.jsx

// import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { isAuthenticated, getUserData, clearAuthData } from '../utils/tokenStorage';
// import { login as loginService, logout as logoutService } from '../services/authService';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
   
//   // Restore session from localStorage on mount
//   useEffect(() => {
//     if (isAuthenticated()) {
//       setUser(getUserData());
//     }
//     setLoading(false);
//   }, []);

//   // Listen for forced logout events (e.g., from axios interceptor on 401)
//   useEffect(() => {
//     const handleForceLogout = () => {
//       setUser(null);
//     };
//     window.addEventListener('auth:logout', handleForceLogout);
//     return () => window.removeEventListener('auth:logout', handleForceLogout);
//   }, []);

//   const login = useCallback(async (email, password) => {
//     const data = await loginService(email, password);
//     setUser(getUserData());
//     return data;
//   }, []);

//   const logout = useCallback(() => {
//     logoutService();
//     setUser(null);
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
//   return ctx;
// };
