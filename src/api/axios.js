// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3001', // Replace with your backend URL
});

export default instance;