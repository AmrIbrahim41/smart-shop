import axios from "axios";

const BASE_URL = "https://Amr41.pythonanywhere.com/";
// 👇 التعديل هنا: شيلنا الهيدر الثابت عشان يسمح برفع الملفات
const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getImageUrl = (imgPath) => {
  if (!imgPath) return "";
  if (typeof imgPath === "string") {
    let cleanPath = imgPath.replace(/http:\/\/127\.0\.0\.1:8000/g, "");
    if (cleanPath.startsWith("http")) return cleanPath;
    return `${BASE_URL}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
  }
  return imgPath;
};

export const ENDPOINTS = {
  PRODUCTS: "api/products/",
  PRODUCT_DETAILS: (id) => `api/products/${id}/`,
  CREATE_PRODUCT: "api/products/create/", 
  UPDATE_PRODUCT: (id) => `api/products/update/${id}/`,
  DELETE_PRODUCT: (id) => `api/products/delete/${id}/`,
  DELETE_GALLERY_IMAGE: (id) => `api/products/delete-image/${id}/`,
  CATEGORIES: "api/categories/",
  MY_PRODUCTS: "api/products/myproducts/",
  LOGIN: "api/users/login/",
  REGISTER: "api/users/register/",
  PROFILE_UPDATE: "api/users/profile/update/",
  SELLER_ORDERS: "api/users/seller/orders/",
  MY_ORDERS: "api/orders/myorders/",
  CART: "api/cart/",
  WISHLIST: "api/wishlist/",
  ORDERS_LIST: "api/orders/",
  CREATE_ORDER: "api/orders/add/",
  ORDER_DETAILS: (id) => `api/orders/${id}/`,
  DELETE_ORDER: (id) => `api/orders/delete/${id}/`,
  PAY_ORDER: (id) => `api/orders/${id}/pay/`,
  DELIVER_ORDER: (id) => `api/orders/${id}/deliver/`,
  TOP_PRODUCTS: "api/products/top/",

  DASHBOARD_STATS: 'api/dashboard/stats/',
  
  // Categories Management
  CREATE_CATEGORY: 'api/categories/create/',
  UPDATE_CATEGORY: (id) => `api/categories/update/${id}/`,
  DELETE_CATEGORY: (id) => `api/categories/delete/${id}/`,

  TAGS: "api/tags/",
  CREATE_TAG: "api/tags/create/",
  UPDATE_TAG: (id) => `api/tags/update/${id}/`,
  DELETE_TAG: (id) => `api/tags/delete/${id}/`,


};

export const apiService = {
  getProducts: () => api.get(ENDPOINTS.PRODUCTS),
  getProductDetails: (id) => api.get(ENDPOINTS.PRODUCT_DETAILS(id)),
  // 👇 التعديل هنا: شيلنا الهيدر اليدوي، Axios هيحطه صح لوحده
  updateProduct: (id, formData) => api.put(ENDPOINTS.UPDATE_PRODUCT(id), formData),
  createProduct: (formData) => api.post(ENDPOINTS.CREATE_PRODUCT, formData), // ضفت دي عشان الإنشاء
  deleteProduct: (id) => api.delete(ENDPOINTS.DELETE_PRODUCT(id)),
  deleteProductImage: (id) => api.delete(ENDPOINTS.DELETE_GALLERY_IMAGE(id)),
  getCategories: () => api.get(ENDPOINTS.CATEGORIES),
  getCart: () => api.get(ENDPOINTS.CART),
  getWishlist: () => api.get(ENDPOINTS.WISHLIST),
  getOrders: () => api.get(ENDPOINTS.ORDERS_LIST),
  deleteOrder: (id) => api.delete(ENDPOINTS.DELETE_ORDER(id)),


  getDashboardStats: () => api.get(ENDPOINTS.DASHBOARD_STATS),
  createCategory: (data) => api.post(ENDPOINTS.CREATE_CATEGORY, data),
  updateCategory: (id, data) => api.put(ENDPOINTS.UPDATE_CATEGORY(id), data),
  deleteCategory: (id) => api.delete(ENDPOINTS.DELETE_CATEGORY(id)),

  getTags: () => api.get(ENDPOINTS.TAGS),
  createTag: (data) => api.post(ENDPOINTS.CREATE_TAG, data),
  updateTag: (id, data) => api.put(ENDPOINTS.UPDATE_TAG(id), data),
  deleteTag: (id) => api.delete(ENDPOINTS.DELETE_TAG(id)),
};

export const links = {
  facebook: "https://www.facebook.com/YourPage",
  instagram: "https://www.instagram.com/YourProfile",
  whtasapp: "https://wa.me/YourNumber",
};

export default api;