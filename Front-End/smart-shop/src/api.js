import axios from "axios";

const BASE_URL = "https://Amr41.pythonanywhere.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
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
    // تنظيف روابط الـ localhost القديمة
    let cleanPath = imgPath.replace(/http:\/\/127\.0\.0\.1:8000/g, "");
    // التأكد من عدم تكرار السيرفر لو المسار كامل
    if (cleanPath.startsWith("http")) return cleanPath;
    // التأكد من وجود / واحدة فقط بين الدومين والمسار
    return `${BASE_URL}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
  }
  return imgPath;
};

export const ENDPOINTS = {
  // Store
  PRODUCTS: "api/products/",
  PRODUCT_DETAILS: (id) => `api/products/${id}/`,
  CREATE_PRODUCT: "api/products/create/", // 👈 تأكد من المسار حسب الباك إند
  UPDATE_PRODUCT: (id) => `api/products/update/${id}/`,
  DELETE_PRODUCT: (id) => `api/products/delete/${id}/`,
  DELETE_GALLERY_IMAGE: (id) => `api/products/delete-image/${id}/`,
  CATEGORIES: "api/categories/",
  MY_PRODUCTS: "api/products/myproducts/", // 👈 ضيفنا دي عشان MyProducts.jsx

  // Users
  LOGIN: "api/users/login/",
  REGISTER: "api/users/register/",
  PROFILE_UPDATE: "api/users/profile/update/",
  SELLER_ORDERS: "api/users/seller/orders/",
  MY_ORDERS: "api/orders/myorders/", // 👈 ضيفنا دي عشان ProfileScreen

  // Cart & Wishlist
  CART: "api/cart/",
  WISHLIST: "api/wishlist/",

  // Orders
  ORDERS_LIST: "api/orders/",
  CREATE_ORDER: "api/orders/add/", // 👈 دي اللي كانت ناقصة لـ PlaceOrder
  ORDER_DETAILS: (id) => `api/orders/${id}/`, // 👈 دي لصفحة تفاصيل الطلب
  DELETE_ORDER: (id) => `api/orders/delete/${id}/`,
  PAY_ORDER: (id) => `api/orders/${id}/pay/`,
  DELIVER_ORDER: (id) => `api/orders/${id}/deliver/`,
  TOP_PRODUCTS: "api/products/top/",
};

export const apiService = {
  // المنتجات
  getProducts: () => api.get(ENDPOINTS.PRODUCTS),
  getProductDetails: (id) => api.get(ENDPOINTS.PRODUCT_DETAILS(id)),
  updateProduct: (id, formData) =>
    api.put(ENDPOINTS.UPDATE_PRODUCT(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProduct: (id) => api.delete(ENDPOINTS.DELETE_PRODUCT(id)),
  deleteProductImage: (id) => api.delete(ENDPOINTS.DELETE_GALLERY_IMAGE(id)),
  getCategories: () => api.get(ENDPOINTS.CATEGORIES),

  // السلة والأمنيات (لحل الـ 404 في الكونسول)
  getCart: () => api.get(ENDPOINTS.CART),
  getWishlist: () => api.get(ENDPOINTS.WISHLIST),

  getOrders: () => api.get(ENDPOINTS.ORDERS_LIST),
  deleteOrder: (id) => api.delete(ENDPOINTS.DELETE_ORDER(id)),
};

export const links = {
  facebook: "https://www.facebook.com/YourPage",
  instagram: "https://www.instagram.com/YourProfile",
  whtasapp: "https://wa.me/YourNumber",
};

export default api;
