import { createContext, useContext, useEffect, useReducer } from "react";
import api, { ENDPOINTS } from "../api"; // تأكد إن api مستورد

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "CART_SET_ITEMS": // 👈 حالة جديدة: لما البيانات تيجي من الباك إند
      return {
        ...state,
        cartItems: action.payload,
      };

    case "CART_SAVE_SHIPPING_ADDRESS":
      return {
        ...state,
        shippingAddress: action.payload,
      };

    case "CART_SAVE_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethod: action.payload,
      };
      
    case "CART_CLEAR_LOCALS": // لتنظيف العناوين عند الخروج
        return {
            ...state,
            cartItems: [],
            shippingAddress: {},
            paymentMethod: 'PayPal'
        }

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: [], // 👈 بنبدأ فاضي، وهنحمل من الداتابيز
    shippingAddress: localStorage.getItem("shippingAddress")
      ? JSON.parse(localStorage.getItem("shippingAddress"))
      : {},
    paymentMethod: localStorage.getItem("paymentMethod")
      ? JSON.parse(localStorage.getItem("paymentMethod"))
      : 'PayPal',
  });

  const userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;

  // 1. دالة لجلب السلة من الداتابيز
  const fetchCart = async () => {
    if (!userInfo) return; // لو مش مسجل، مش هنجيب حاجة (ممكن تعمل لوجيك للزائر هنا)

    try {
      const { data } = await api.get('cart/'); // 👈 الرابط اللي عملناه في الباك إند
      
      // لازم نحول شكل البيانات اللي جاي من الباك إند للشكل اللي الفرونت متعود عليه
      const formattedCart = data.map(item => ({
        product: item.product, // ID المنتج
        name: item.product_details.name,
        image: item.product_details.image,
        price: item.product_details.discount_price > 0 ? item.product_details.discount_price : item.product_details.price,
        countInStock: item.product_details.countInStock,
        qty: item.qty,
        id: item.product // بنستخدم الـ product id كمعرف
      }));

      dispatch({ type: "CART_SET_ITEMS", payload: formattedCart });
    } catch (error) {
      console.log("Error fetching cart", error);
    }
  };

  // تحميل السلة أول ما الموقع يفتح
  useEffect(() => {
    fetchCart();
  }, []);

  // 2. إضافة منتج (API)
  const addToCart = async (product, qty) => {
    if (!userInfo) {
        alert("Please login to add items to cart");
        return;
    }

    try {
      await api.post('cart/add/', {
        product_id: product.id || product._id,
        qty: qty
      });
      // بعد الإضافة، نحدث السلة
      fetchCart();
    } catch (error) {
      alert("Error adding item");
    }
  };

  // 3. حذف منتج (API)
  const removeFromCart = async (id) => {
    try {
      await api.delete(`cart/remove/${id}/`);
      fetchCart(); // تحديث
    } catch (error) {
      console.log("Error removing item");
    }
  };

  // 4. مسح السلة بالكامل (API)
  const clearCart = async () => {
    try {
        await api.delete('cart/clear/');
        dispatch({ type: "CART_CLEAR_LOCALS" }); // نمسح الحالة المحلية كمان
        fetchCart();
    } catch (error) {
        console.log(error);
    }
  };

  const saveShippingAddress = (data) => {
    dispatch({ type: "CART_SAVE_SHIPPING_ADDRESS", payload: data });
    localStorage.setItem("shippingAddress", JSON.stringify(data));
  };

  const savePaymentMethod = (data) => {
    dispatch({ type: "CART_SAVE_PAYMENT_METHOD", payload: data });
    localStorage.setItem("paymentMethod", JSON.stringify(data));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: state.cartItems,
        shippingAddress: state.shippingAddress,
        paymentMethod: state.paymentMethod,
        addToCart,
        removeFromCart,
        clearCart,
        saveShippingAddress,
        savePaymentMethod,
        fetchCart // بنصدرها عشان لو حبينا نناديها من برة
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};