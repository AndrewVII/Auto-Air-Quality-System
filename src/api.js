/* eslint-disable import/prefer-default-export */
import axios from 'axios';

export const getAQHIFromGovernment = async (location, limit = 100) => {
  const url = `https://api.weather.gc.ca/collections/aqhi-observations-realtime/items?limit=${limit}&startindex=0&location_name_en=${location}&f=json`;
  const data = await axios.get(url);
  return data.data;
};

export const login = async (username, password) => {
  const url = '/api/auth/login';

  const data = await axios.post(url, { params: { username, password } });
  return data.data;
};
