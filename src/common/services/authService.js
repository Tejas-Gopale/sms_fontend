import axios from "axios";
import { storeAuthData, clearAuthData } from "../utils/tokenStorage";

const BASE_URL = "http://localhost:8085/api/v1";

export const login = async (email, password) => {

  const { data } = await axios.post(`${BASE_URL}/auth/login`, {
    email,
    password
  });

  storeAuthData(data);
  return data;
};

export const logout = () => {
  clearAuthData();
};
