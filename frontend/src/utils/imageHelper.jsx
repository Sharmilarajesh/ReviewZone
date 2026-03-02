import { API_BASE_URL } from "../services/api";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  let base = API_BASE_URL;
  if (base.endsWith("/api")) {
    base = base.slice(0, -4);
  }

  return `${base}${path}`;
};

export default getImageUrl;
