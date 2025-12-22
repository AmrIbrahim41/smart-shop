import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaEye, FaTag, FaExclamationTriangle } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';
import { getImageUrl } from '../../api';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { t } = useSettings();
  const { addToCart } = useCart();

  const isOutOfStock = product.countInStock === 0;

  const discountPercentage = product.discount_price > 0
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const addToCartHandler = (e) => {
    e.preventDefault();
    if (isOutOfStock) return; // منع الإضافة لو الكمية صفر
    addToCart(product, 1);
  };

  return (
    <div className="group relative bg-white dark:bg-dark-accent rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">

      {/* شارة الخصم أو نفاذ الكمية */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.discount_price > 0 && !isOutOfStock && (
          <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg animate-pulse">
            {discountPercentage}% {t('off') || 'OFF'}
          </div>
        )}
        {isOutOfStock && (
          <div className="bg-gray-800 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
            <FaExclamationTriangle className="text-yellow-400" /> {t('outOfStock') || 'SOLD OUT'}
          </div>
        )}
      </div>

      {/* صورة المنتج مع أنميشن Zoom */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-white/5">
        <Link to={`/product/${product.id || product._id}`}>
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
            onError={(e) => { e.target.src = '/images/placeholder.png'; }}
          />
        </Link>

        {/* Overlay الأزرار */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
          <Link
            to={`/product/${product.id || product._id}`}
            className="p-4 bg-white text-dark rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-xl transform translate-y-4 group-hover:translate-y-0"
          >
            <FaEye size={20} />
          </Link>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <FaTag size={8} /> {product.category_name || t('general')}
          </span>
          <div className="flex items-center text-yellow-400 text-[10px] font-bold">
            <FaStar />
            <span className="ms-1 text-gray-500">{product.rating || '0.0'}</span>
          </div>
        </div>

        <Link to={`/product/${product.id || product._id}`}>
          <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-4">
          {product.discount_price > 0 ? (
            <>
              <span className="text-xl font-black text-primary">${product.discount_price}</span>
              <span className="text-xs text-gray-400 line-through">${product.price}</span>
            </>
          ) : (
            <span className="text-xl font-black text-primary">${product.price}</span>
          )}
        </div>

        {/* زر الإضافة للسلة - يتغير شكله عند نفاذ الكمية */}
        <button
          onClick={addToCartHandler}
          disabled={isOutOfStock}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-95 ${isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
              : 'bg-dark dark:bg-white text-white dark:text-dark hover:bg-primary dark:hover:bg-primary hover:text-white'
            }`}
        >
          {isOutOfStock ? (
            <>{t('outOfStock') || 'Sold Out'}</>
          ) : (
            <><FaShoppingCart /> {t('addToCart') || 'Add to Cart'}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;