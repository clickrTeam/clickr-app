import axios from "axios";

const BASE_URL = "https://clickr-backend-production.up.railway.app/api/";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
// Interceptor that will atempt to revalidate a user if they fail to login.
// Uses the refresh token to do that, otherwise if no token nothing happens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original_request = error.config;

    if (error.response?.status === 401 && !original_request._retry) {
      original_request._retry = true;

      try {
        await refresh_token();
        return api(original_request);
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const get_user_mappings = async (username: string) => {
  const response = await api.get(`users/${username}/mappings`);
  return response.data;
};

export const get_specific_mapping = async (mappingId: string) => {
  const response = await api.get(`users/mappings/${mappingId}`);
  return response.data;
};

export const create_new_mapping = async (
  username: string,
  mappingData: {
    name: string;
    description: string;
    mappings: object;
    isActive: boolean;
    is_public: boolean;
    num_likes: number;
    num_downloads: number;
    tags: string[];
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

export const refresh_token = async () => {
  const response = await api.post("token/refresh/");
  return response.data;
};

export const get_auth = async () => {
  const response = await api.get("authenticated/");
  return response.data;
};

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post("token/", { username, password });
    return response.data;
  } catch (error) {
    throw new Error("Login Failed");
  }
};
export const get_community_mappings = async () => {
  const response = await api.get(`community/`);
  return response.data;
};

export const register = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await api.post("register/", {
    username: username,
    email: email,
    password: password,
  });
  return response.data;
};

export const joinWaitlist = async (email: string) => {
  const response = await api.post("waitlist/", {
    email: email,
  });
  return response.data;
};
