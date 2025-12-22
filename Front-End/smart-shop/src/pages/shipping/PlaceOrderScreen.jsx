import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaCheckCircle, FaMapMarkerAlt, FaCreditCard, FaBoxOpen } from 'react-icons/fa';
// استدعاء getImageUrl
import api, { ENDPOINTS, getImageUrl } from '../../api';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const PlaceOrderScreen = () => {
  const { cartItems, shippingAddress, paymentMethod, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings();

  // حسابات الأسعار
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10; 
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2)); 
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    } else if (!paymentMethod) {
      navigate('/payment');
    }
  }, [shippingAddress, paymentMethod, navigate]);

  const placeOrderHandler = async () => {
    try {
      const orderData = {
        orderItems: cartItems,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        itemsPrice: itemsPrice,
        shippingPrice: shippingPrice,
        taxPrice: taxPrice,
        totalPrice: totalPrice,
      };

      // التعديل: إزالة الـ config اليدوي واستخدام ENDPOINTS
      const { data } = await api.post(ENDPOINTS.CREATE_ORDER, orderData);

      // تفريغ السلة بعد نجاح الطلب
      clearCart();
      
      // التوجيه لصفحة تفاصيل الطلب الجديد
      navigate(`/order/${data.id || data._id}`); 

    } catch (error) {
      alert(error.response?.data?.detail || t('errorPlacingOrder') || "Error placing order");
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={t('placeOrder') || "Place Order"} />
      <div className="max-w-7xl mx-auto">
        
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 text-xs md:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider max-w-lg mx-auto">
            <span className="text-primary">{t('signIn') || "Sign In"}</span>
            <span className="h-1 flex-1 bg-primary mx-2 rounded"></span>
            <span className="text-primary">{t('shipping') || "Shipping"}</span>
            <span className="h-1 flex-1 bg-primary mx-2 rounded"></span>
            <span className="text-primary">{t('payment') || "Payment"}</span>
            <span className="h-1 flex-1 bg-primary mx-2 rounded"></span>
            <span className="text-gray-900 dark:text-white">{t('placeOrder') || "Place Order"}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* تفاصيل الطلب */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* العنوان */}
                <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase">
                        <FaMapMarkerAlt className="text-primary"/> {t('shipping') || "SHIPPING"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        <strong className="text-gray-900 dark:text-white">{t('address') || "Address"}: </strong>
                        {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
                    </p>
                </div>

                {/* الدفع */}
                <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase">
                        <FaCreditCard className="text-primary"/> {t('paymentMethod') || "PAYMENT METHOD"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        <strong className="text-gray-900 dark:text-white">{t('method') || "Method"}: </strong>
                        {paymentMethod}
                    </p>
                </div>

                {/* المنتجات */}
                <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase">
                        <FaBoxOpen className="text-primary"/> {t('orderItems') || "ORDER ITEMS"}
                    </h2>
                    {cartItems.length === 0 ? <div className="text-gray-500 dark:text-white">{t('cartEmpty') || "Your cart is empty"}</div> : (
                        <div className="space-y-4">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-dark/50 p-3 rounded-xl border border-gray-100 dark:border-transparent transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* التعديل: استخدام getImageUrl */}
                                        <img 
                                            src={getImageUrl(item.image)} 
                                            alt={item.name} 
                                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-white/10" 
                                            onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                                        />
                                        <Link to={`/product/${item.product}`} className="text-gray-900 dark:text-white font-bold hover:text-primary transition line-clamp-1">{item.name}</Link>
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 text-sm font-bold whitespace-nowrap">
                                        {item.qty} x ${item.price} = <span className="text-gray-900 dark:text-white">${(item.qty * item.price).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ملخص السعر */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 sticky top-28 shadow-xl dark:shadow-none transition-colors duration-300">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-4 uppercase">
                        {t('orderSummary') || "ORDER SUMMARY"}
                    </h2>
                    
                    <div className="space-y-3 mb-6 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{t('items') || "Items"}</span><span className="text-gray-900 dark:text-white font-bold">${itemsPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{t('shippingFee') || "Shipping"}</span><span className="text-gray-900 dark:text-white font-bold">${shippingPrice}</span></div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{t('tax') || "Tax"}</span><span className="text-gray-900 dark:text-white font-bold">${taxPrice}</span></div>
                        <div className="flex justify-between text-gray-900 dark:text-white text-lg font-black border-t border-gray-200 dark:border-white/10 pt-3"><span>{t('total') || "Total"}</span><span className="text-primary">${totalPrice}</span></div>
                    </div>

                    <button 
                        onClick={placeOrderHandler}
                        disabled={cartItems.length === 0}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed uppercase"
                    >
                        {t('placeOrderBtn') || "PLACE ORDER"} <FaCheckCircle />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;