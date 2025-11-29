const isDev = import.meta.env.MODE === "development";

export const API_URL = isDev
  ? import.meta.env.VITE_LOCAL_API
  : import.meta.env.VITE_PROD_API;

export const SOCKET_URL = isDev
  ? import.meta.env.VITE_LOCAL_SOCKET
  : import.meta.env.VITE_PROD_SOCKET;

export const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
