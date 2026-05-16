import axios from "axios";
import { Navigate } from "react-router-dom";

const instance = axios.create({
  baseURL: "/api/url",
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Interceptor checking token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Redirecting to login...");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Navigate("/login");
    }
    return Promise.reject(error);
  },
);
export default instance;
