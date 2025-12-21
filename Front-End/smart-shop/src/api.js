import axios from "axios";

const BASE_URL = "https://Amr41.pythonanywhere.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 👇 1. Interceptor عشان التوكن يتبعت أوتوماتيك مع كل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const ENDPOINTS = {
  // Auth
  LOGIN: "api/users/login/",
  REGISTER: "api/users/register/",
  REFRESH: "api/users/token/refresh/",
  UPDATE_PROFILE: "api/users/profile/update/",
  // أضف هذا السطر أو عدله داخل ENDPOINTS
  UPDATE_PRODUCT: "api/products/update/",

  // Products
  PRODUCTS: "api/products/",
  MY_PRODUCTS: "api/my_products/",
  TOP_PRODUCTS: "api/products/top/",
  CREATE_PRODUCT: "api/create/", // ده رابط الرفع اللي هيتصلح
  DELETE_PRODUCT: "api/delete/",

  // Orders
  ORDERS_LIST: "api/orders/",
  MY_ORDERS: "api/orders/myorders/",
  CREATE_ORDER: "api/orders/add/",
  ORDER_DETAILS: "api/orders/",

  // Cart & Wishlist (دول اللي طالعين أحمر في الصورة عندك)
  CART: "api/cart/",
  WISHLIST: "api/wishlist/",
};

// دالة مساعدة (ممكن تحتاجها في الـ Login)
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const links = {
  facebook: "https://www.facebook.com/YourPage",
  instagram: "https://www.instagram.com/YourProfile",
  whtasapp: "https://wa.me/YourNumber",
};

export default api;
