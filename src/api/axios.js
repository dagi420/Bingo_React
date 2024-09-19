import axios from 'axios';

// Create an instance of axios
const instance = axios.create({
  baseURL: 'http://localhost:3001', // Replace with your backend URL
});

// Add a request interceptor to include the JWT token in the Authorization header
instance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Retrieved token:', token); // Debugging log

    // If a token is present, set it in the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Do something with the error before it is sent
    return Promise.reject(error);
  }
);

export default instance;
