// src/contexts/ApiContext.js
import React, { createContext, useContext } from 'react';
import axios from 'axios';

const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
  });

  return <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === null) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
