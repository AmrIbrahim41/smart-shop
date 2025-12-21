import React from 'react';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext'; // 👈 1. استدعاء الإعدادات

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const { addToCart } = useCart();
  
  // 👇 2. استدعاء دالة الترجمة
  const { t } = useSettings();

  // جلب بيانات المستخدم (للتأكد من تسجيل الدخول)
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 👇 3. التحقق: لو مش مسجل، روح لصفحة الدخول فوراً
    if (!userInfo) {
        navigate('/login');
        return; // وقف التنفيذ هنا
    }

    // لو مسجل، كمل عادي
    if (product.countInStock > 0) {
      addToCart(product, 1);
      alert(`${t('addToCartSuccess') || "Added 1 item to cart!"} 🛒`);
    } else {
      alert(t('outOfStockMsg') || "Sorry, this item is out of stock");
    }
  };

  // حساب نسبة الخصم
  const discountPercentage = product.discount_price && product.discount_price > 0
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    // 👇 4. دعم الوضع النهاري والليلي (bg-white dark:bg-dark-accent)
    <div className="product-card bg-white dark:bg-dark-accent rounded-3xl p-4 border border-gray-200 dark:border-white/5 relative group transition-all hover:border-primary/50 shadow-lg dark:shadow-none h-full flex flex-col">

      {discountPercentage > 0 && (
        <div className="absolute top-6 left-6 z-10 bg-red-500 text-white text-[12px] font-bold px-2 py-1 rounded shadow-lg animate-pulse">
          -{discountPercentage}% SALE
        </div>
      )}

      {/* Wishlist Button - (اختياري: ممكن تخفيه لغير المسجلين بـ userInfo && ...) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!userInfo) {
             navigate('/login');
             return;
          }
          toggleWishlist(product);
        }}
        className="absolute top-6 right-6 z-20 transition transform active:scale-90"
      >
        {isWishlisted ? (
          <FaHeart className="text-xl text-primary drop-shadow-md" />
        ) : (
          <FaRegHeart className="text-xl text-gray-400 hover:text-red-500 dark:hover:text-white" />
        )}
      </button>

      {/* Image Area */}
      <div className="h-64 rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-dark relative flex items-center justify-center transition-colors duration-300">
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={`http://127.0.0.1:8000${product.image}`}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-500 mix-blend-multiply dark:mix-blend-normal"
          />
        </Link>
      </div>

      {/* Info Area */}
      <div className="mt-auto">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold mb-1 text-gray-900 dark:text-white hover:text-primary transition truncate text-lg">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center space-x-3 mb-4">
          {product.discount_price && product.discount_price > 0 ? (
            <>
              <span className="text-primary font-black text-xl">${product.discount_price}</span>
              <span className="text-gray-400 dark:text-gray-500 line-through text-sm">${product.price}</span>
            </>
          ) : (
            <span className="text-primary font-black text-xl">${product.price}</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.countInStock === 0}
          className="w-full bg-dark dark:bg-white text-white dark:text-dark font-bold py-3 rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md uppercase"
        >
          <FaShoppingCart /> {product.countInStock > 0 ? (t('addToCart') || 'ADD TO CART') : (t('outOfStock') || 'SOLD OUT')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;