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
  LOGIN: "users/login/",
  REGISTER: "users/register/",
  REFRESH: "users/token/refresh/",
  UPDATE_PROFILE: "users/profile/update/",
  //   Users & Orders
  ORDERS_LIST: "orders/",
  USERS_LIST: "users/",
  DELIVER_ORDER: "orders/",
  UPDATE_PROFILE: "users/profile/update/", 

  // Products
  PRODUCTS: "products/",
  MY_ORDERS: "orders/myorders/",
  CREATE_REVIEW: "products/",
  TOP_PRODUCTS: "products/top/",
  MY_PRODUCTS: "my_products/",


  CREATE_PRODUCT: "create/",
  DELETE_PRODUCT: "delete/",

  CREATE_ORDER: "orders/add/",
  ORDER_DETAILS: "orders/",
  PAY_ORDER: "orders/",
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
