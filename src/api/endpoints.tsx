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

export const create_new_mapping = async (
  username: String,
  mappingData: {
    name: string;
    description: string;
    mappings: object;
    isActive: boolean;
  }
) => {
  const response = await api.post(
    `users/${username}/mappings/new`,
    mappingData
  );
  return response.data;
};

export const delete_mapping = async (username: string, mappingId: string) => {
  const response = await api.post(`users/${username}/mappings/delete`, {
    mapping_id: mappingId,
  });
  return response.data;
};

export const set_active_mapping = async (
  username: string,
  mappingId: string
) => {
  const response = await api.post(`users/${username}/mappings/set_active`, {
    mapping_id: mappingId,
  });
  return response.data;
};
