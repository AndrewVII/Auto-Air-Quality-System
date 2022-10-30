import axios from 'axios';

const performRequest = async (requestPromise) => {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    if (error.response.status === 400 && error.response.data) {
      return error.response.data;
    }
    if (error.response.status === 500) {
      return { error: error.response.statusText, message: error.response.data?.error };
    }
    if (error.response) {
      return error.response.data;
    }
    return { error: 'error' };
  }
};

export const getAQHIFromGovernment = async (location, limit = 100) => {
  const url = `https://api.weather.gc.ca/collections/aqhi-observations-realtime/items?limit=${limit}&startindex=0&location_name_en=${location}&f=json`;
  return performRequest(axios.get(url));
};

export const login = async (username, password) => {
  const url = '/api/auth/login';
  return performRequest(axios.post(url, { params: { username, password } }));
};

export const register = async (username, password) => {
  const url = '/api/auth/register';
  return performRequest(axios.post(url, { params: { username, password } }));
};

export const getUserFromSession = async () => {
  const url = '/api/user/from-session';
  return performRequest(axios.get(url));
};

export const updateUserPreferences = async (data) => {
  const url = '/api/user/update-settings';
  return performRequest(axios.post(url, { params: { data } }));
};
