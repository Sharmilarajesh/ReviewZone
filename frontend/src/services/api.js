import axios from "axios";

// central URL for backend APIs; use Vite environment variable for flexibility
// create a file "frontend/.env" with VITE_API_URL=http://localhost:5000/api (development)
// and overrode in production if needed
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

console.log("API Base URL:", API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  console.log("API Request:", req.method, req.url); // Debug
  return req;
});

// Auth APIs
export const login = (formData) => API.post("/auth/login", formData);
export const register = (formData) => API.post("/auth/register", formData);
export const getProfile = () => API.get("/auth/me");

// Product APIs
export const getProducts = () => API.get("/products");
export const getProduct = (id) => API.get(`/products/${id}`);
export const addProduct = (formData) =>
  API.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateProduct = (id, formData) =>
  API.put(`/products/${id}`, formData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// Review APIs
export const getProductReviews = (productId) =>
  API.get(`/reviews/product/${productId}`);
export const addReview = (formData) =>
  API.post("/reviews", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateReview = (id, formData) =>
  API.put(`/reviews/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
export const getMyReviews = () => API.get("/reviews/my-reviews");

export default API;
