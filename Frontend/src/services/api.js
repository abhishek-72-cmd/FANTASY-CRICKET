// src/api.js

import axios from "axios";

// src/config.js


export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});