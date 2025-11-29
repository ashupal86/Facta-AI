import axios from 'axios';
import { apiEndUrl } from './urls';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

export default axiosInstance;
