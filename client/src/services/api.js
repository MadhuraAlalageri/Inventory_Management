import axios from "axios";

const API = axios.create({
  baseURL: `http://${window.location.hostname}:5003/api`,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});

// Intercept requests to attach JWT token
API.interceptors.request.use((req) => {
  const userString = sessionStorage.getItem("user");
  if (userString) {
    const user = JSON.parse(userString);
    if (user.token) {
      req.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return req;
});

export default API;