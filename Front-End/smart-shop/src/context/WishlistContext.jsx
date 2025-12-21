import React, { createContext, useContext, useEffect, useReducer } from "react";
import api from "../api";

const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case "WISHLIST_SET_ITEMS":
      return {
        ...state,
        wishlistItems: action.payload,
      };
    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, {
    wishlistItems: [],
  });

  const userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;

  // 1. جلب المفضلة من الداتابيز
  const fetchWishlist = async () => {
    if (!userInfo) return;

    try {
      const { data } = await api.get('wishlist/');
      
      // تنسيق البيانات لتناسب الفرونت
      const formattedWishlist = data.map(item => ({
        id: item.product, // بنخلي الـ id هو id المنتج عشان التوافق
        name: item.product_details.name,
        image: item.product_details.image,
        price: item.product_details.price,
        discount_price: item.product_details.discount_price,
        countInStock: item.product_details.countInStock,
      }));

      dispatch({ type: "WISHLIST_SET_ITEMS", payload: formattedWishlist });
    } catch (error) {
      console.log("Error fetching wishlist");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // 2. Toggle (إضافة/حذف) باستخدام الـ API
  const toggleWishlist = async (product) => {
    if (!userInfo) {
        alert("Please login to use wishlist");
        return;
    }

    try {
      // الـ Backend بيرد علينا يقولنا هو ضاف ولا مسح
      const { data } = await api.post('wishlist/toggle/', {
        product_id: product.id || product._id
      });

      if (data.status === 'added') {
        alert("Added to Wishlist ❤️");
      } else {
        alert("Removed from Wishlist 💔");
      }

      // تحديث القائمة
      fetchWishlist();

    } catch (error) {
      alert("Error updating wishlist");
    }
  };

  // التحقق هل المنتج في المفضلة (محلياً بناءً على اللي جبناه من الداتابيز)
  const isInWishlist = (id) => {
    return state.wishlistItems.some((p) => p.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: state.wishlistItems,
        toggleWishlist,
        isInWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};