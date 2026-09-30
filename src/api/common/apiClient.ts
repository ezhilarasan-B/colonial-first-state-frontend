/**
 * Centralized Axios API Client
 * Configures the base URL, default headers, interceptors,
 * and seamlessly switches between Mock API adapter and real .NET 8 backend.
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS, USE_MOCK_API } from '../../constants';
import { setupAuthInterceptors } from './authInterceptor';
import { mockAxiosAdapter } from '../staff/staffMockApi';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  adapter: USE_MOCK_API ? mockAxiosAdapter : undefined,
});

setupAuthInterceptors(apiClient);
