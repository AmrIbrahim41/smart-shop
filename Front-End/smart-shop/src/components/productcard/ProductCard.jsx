import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaEye, FaTag } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';
// استدعاء الدالة المركزية للصور
import { getImageUrl } from '../../api';

const ProductCard = ({ product }) => {
  const { t } = useSettings();

  // حساب نسبة الخصم لو فيه سعر خصم
  const discountPercentage = product.discount_price > 0 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="group relative bg-white dark:bg-dark-accent rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
      
      {/* شارة الخصم (Badge) */}
      {product.discount_price > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg animate-bounce">
          {discountPercentage}% {t('off') || 'OFF'}
        </div>
      )}

      {/* صورة المنتج */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-white/5">
        <Link to={`/product/${product.id || product._id}`}>
          <img
            /* التعديل هنا: استخدام getImageUrl لضمان عمل الصورة أونلاين */
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { e.target.src = '/images/placeholder.png'; }}
          />
        </Link>

        {/* أزرار سريعة تظهر عند التحويم (Hover) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Link 
            to={`/product/${product.id || product._id}`}
            className="p-3 bg-white text-dark rounded-full hover:bg-primary hover:text-white transition-colors duration-300 shadow-xl"
          >
            <FaEye size={18} />
          </Link>
        </div>
      </div>

      {/* تفاصيل المنتج */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
            <FaTag size={8} /> {product.category_name || t('general')}
          </span>
          <div className="flex items-center text-yellow-400 text-[10px]">
            <FaStar />
            <span className="ms-1 text-gray-500 dark:text-gray-400">{product.rating || '0.0'}</span>
          </div>
        </div>

        <Link to={`/product/${product.id || product._id}`}>
          <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* السعر */}
        <div className="flex items-center gap-2">
          {product.discount_price > 0 ? (
            <>
              <span className="text-lg font-black text-primary">${product.discount_price}</span>
              <span className="text-xs text-gray-400 line-through">${product.price}</span>
            </>
          ) : (
            <span className="text-lg font-black text-primary">${product.price}</span>
          )}
        </div>

        {/* زر الإضافة للسلة */}
        <button 
          className="w-full mt-4 bg-gray-50 dark:bg-white/5 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 border border-gray-100 dark:border-white/10"
        >
          <FaShoppingCart /> {t('addToCart') || 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;