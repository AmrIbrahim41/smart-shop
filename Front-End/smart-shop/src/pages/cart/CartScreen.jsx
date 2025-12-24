import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaMinus, FaPlus, FaArrowRight, FaShoppingBag } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';
import { getImageUrl } from '../../api';

const CartScreen = () => {
  const { cartItems, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings();

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = subtotal * 0.14;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const checkoutHandler = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login?redirect=shipping');
    } else {
      navigate('/shipping');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-10 px-6 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center transition-colors duration-500">
        <Meta title={t('shoppingCart') || "Shopping Cart"} />
        <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-white/5 max-w-lg w-full">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 dark:text-gray-500 text-4xl">
                <FaShoppingBag />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{t('cartEmpty') || "Your Cart is Empty"}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/" className="inline-block w-full bg-primary hover:bg-orange-600 text-white py-4 rounded-2xl font-bold transition shadow-lg uppercase tracking-wide">
            {t('startShopping') || "START SHOPPING"}
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-3">
          <FaShoppingBag className="text-primary" /> {t('shoppingCart') || "Shopping Cart"}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                
                {/* Image */}
                <div className="w-full sm:w-32 h-32 bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left w-full">
                  <Link to={`/product/${item.id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary transition line-clamp-1 mb-1">
                    {item.name}
                  </Link>
                  <p className="text-primary font-black text-xl mb-4">${item.price}</p>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                      <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => addToCart(item, Math.max(1, item.qty - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-white hover:text-primary transition"
                        >
                            <FaMinus size={10} />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{item.qty}</span>
                        <button
                            onClick={() => {
                                if (item.qty < item.countInStock) addToCart(item, item.qty + 1);
                                else alert("Max stock reached");
                            }}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm transition ${item.qty >= item.countInStock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 dark:text-white hover:text-primary'}`}
                        >
                            <FaPlus size={10} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <FaTrash />
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary (Sticky) */}
          <div className="lg:w-[400px]">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 sticky top-24 shadow-2xl">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
                {t('orderSummary') || "Order Summary"}
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 dark:text-gray-400 font-medium">
                  <span>{t('subtotal') || "Subtotal"}</span>
                  <span className="text-gray-900 dark:text-white font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400 font-medium">
                  <span>{t('tax') || "Tax"}</span>
                  <span className="text-gray-900 dark:text-white font-bold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400 font-medium">
                  <span>{t('shippingFee') || "Shipping"}</span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    {shipping === 0 ? (t('free') || 'FREE') : `$${shipping}`}
                  </span>
                </div>
                
                <div className="border-t border-dashed border-gray-300 dark:border-gray-600 pt-4 mt-4">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-900 dark:text-white font-black text-lg">{t('total') || "TOTAL"}</span>
                        <span className="text-primary font-black text-3xl">${total.toFixed(2)}</span>
                     </div>
                </div>
              </div>

              <button
                onClick={checkoutHandler}
                className="w-full bg-gradient-to-r from-primary to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 text-white font-black py-4 rounded-2xl flex justify-center items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide"
              >
                {t('proceedCheckout') || "CHECKOUT"} <FaArrowRight />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartScreen;