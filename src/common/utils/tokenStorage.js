const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";
const USER_DATA = "userData";

export const storeAuthData = (data) => {
  
  localStorage.setItem(ACCESS_TOKEN, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN, data.refreshToken);
  localStorage.setItem("schoolId", data.schoolId); 
  localStorage.setItem("userId", data.userId);
  console.log("Storing Auth Data:", {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  
  const user = {
    email: data.email,
    fullName: data.fullName,
    roles: data.roles,
    schoolId: data.schoolId?.id,
    userId: data.userId
  };

  localStorage.setItem(USER_DATA, JSON.stringify(user));
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN);

export const getUserData = () => {
  const user = localStorage.getItem(USER_DATA);
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!localStorage.getItem(ACCESS_TOKEN);

export const updateTokens = (data) => {
  localStorage.setItem(ACCESS_TOKEN, data.accessToken);
  if (data.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN, data.refreshToken);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem(USER_DATA);
};

/* JWT Expiry checker */
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};