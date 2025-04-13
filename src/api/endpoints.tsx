import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const get_user_mappings = async (username: String) => {
  const response = await api.get(`users/${username}/mappings`);
  return response.data;
};
