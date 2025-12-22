import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaMinus, FaPlus, FaArrowRight } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';
// استدعاء دالة جلب الصور المركزية
import { getImageUrl } from '../../api';

const CartScreen = () => {
  const { cartItems, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings();

  // حسابات الأسعار
  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = subtotal * 0.14;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const checkoutHandler = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      // توجيه المستخدم لتسجيل الدخول ثم العودة لصفحة الشحن
      navigate('/login?redirect=shipping');
    } else {
      navigate('/shipping');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-10 px-6 bg-gray-50 dark:bg-dark flex flex-col items-center justify-center text-center transition-colors duration-300">
        <Meta title={t('shoppingCart') || "Shopping Cart"} />
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{t('cartEmpty') || "Your Cart is Empty"}</h2>
        <Link to="/" className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition mt-4 shadow-lg uppercase">
          {t('startShopping') || "START SHOPPING"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-10 px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 uppercase transition-colors">
          {t('shoppingCart') || "SHOPPING CART"}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* قائمة المنتجات في السلة */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-dark-accent p-4 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center gap-4 shadow-sm dark:shadow-none transition-colors duration-300">
                <div className="w-24 h-24 bg-gray-100 dark:bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-none flex items-center justify-center">
                  {/* التعديل هنا: استخدام getImageUrl بدلاً من الرابط المحلي */}
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                    onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                  />
                </div>

                <div className="flex-1">
                  <Link to={`/product/${item.id}`} className="text-gray-900 dark:text-white font-bold text-lg hover:text-primary transition line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="text-primary font-bold mt-1">${item.price}</p>
                </div>

                {/* التحكم في الكمية */}
                <div className="flex items-center bg-gray-100 dark:bg-dark rounded-lg border border-gray-200 dark:border-white/10 transition-colors">
                  <button
                    onClick={() => addToCart(item, Math.max(1, item.qty - 1))}
                    className="p-3 text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-white transition"
                  >
                    <FaMinus size={10} />
                  </button>
                  <span className="w-8 text-center text-gray-900 dark:text-white font-bold text-sm">{item.qty}</span>
                  <button
                    onClick={() => addToCart(item, item.qty + 1)}
                    className="p-3 text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-white transition"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>

                {/* زر الحذف من السلة */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* ملخص الطلب (الفاتورة) */}
          <div className="lg:w-[350px]">
            <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 sticky top-28 shadow-xl dark:shadow-none transition-colors duration-300">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-4 uppercase">
                {t('orderSummary') || "ORDER SUMMARY"}
              </h3>

              <div className="space-y-3 text-sm mb-6 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>{t('subtotal') || "Subtotal"}</span>
                  <span className="text-gray-900 dark:text-white font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tax') || "Tax"}</span>
                  <span className="text-gray-900 dark:text-white font-bold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('shippingFee') || "Shipping"}</span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    {shipping === 0 ? (t('free') || 'FREE') : `$${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-200 dark:border-white/10 pt-4 mb-6 transition-colors">
                <span className="text-gray-900 dark:text-white font-black text-lg">{t('total') || "TOTAL"}</span>
                <span className="text-primary font-black text-2xl">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={checkoutHandler}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition shadow-lg uppercase active:scale-95"
              >
                {t('proceedCheckout') || "PROCEED TO CHECKOUT"} <FaArrowRight />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartScreen;