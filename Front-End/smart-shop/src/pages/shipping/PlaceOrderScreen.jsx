import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaCheckCircle, FaMapMarkerAlt, FaCreditCard, FaBoxOpen, FaArrowRight } from 'react-icons/fa';
import api, { ENDPOINTS, getImageUrl } from '../../api';
import Meta from '../../components/tapheader/Meta';
import CheckoutSteps from '../../components/checkout/CheckoutSteps';
import { useSettings } from '../../context/SettingsContext';

const PlaceOrderScreen = () => {
  const { cartItems, shippingAddress, paymentMethod, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings();

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

      const { data } = await api.post(ENDPOINTS.CREATE_ORDER, orderData);
      clearCart();
      navigate(`/order/${data.id || data._id}`); 

    } catch (error) {
      alert(error.response?.data?.detail || t('errorPlacingOrder') || "Error placing order");
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <Meta title={t('placeOrder') || "Place Order"} />
      
      <div className="max-w-7xl mx-auto mb-10">
         <CheckoutSteps step1 step2 step3 step4 />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Details Section */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Shipping Info Card */}
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-3 uppercase">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
                           <FaMapMarkerAlt />
                        </div>
                        {t('shipping') || "SHIPPING"}
                    </h2>
                    <div className="pl-13 text-gray-600 dark:text-gray-400 font-medium">
                        <p className="text-lg text-gray-900 dark:text-white font-bold mb-1">
                             {shippingAddress.address}
                        </p>
                        <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                        <p>{shippingAddress.country}</p>
                    </div>
                </div>

                {/* Payment Info Card */}
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-3 uppercase">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
                           <FaCreditCard />
                        </div>
                        {t('paymentMethod') || "PAYMENT"}
                    </h2>
                    <p className="text-gray-900 dark:text-white font-bold text-lg">
                        {paymentMethod}
                    </p>
                </div>

                {/* Items Card */}
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg">
                           <FaBoxOpen />
                        </div>
                        {t('orderItems') || "ORDER ITEMS"}
                    </h2>
                    
                    {cartItems.length === 0 ? <div className="text-center p-4">Cart is empty</div> : (
                        <div className="space-y-4">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 transition-transform hover:scale-[1.01]">
                                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                                        <img 
                                            src={getImageUrl(item.image)} 
                                            alt={item.name} 
                                            className="w-full h-full object-contain" 
                                            onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/product/${item.product}`} className="text-gray-900 dark:text-white font-bold hover:text-primary transition line-clamp-1 text-base">
                                            {item.name}
                                        </Link>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">
                                            Qty: {item.qty}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-900 dark:text-white font-black text-lg">
                                            ${(item.qty * item.price).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-400">${item.price} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Sticky Card */}
            <div className="lg:col-span-1">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 sticky top-24 shadow-2xl">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider border-b border-gray-100 dark:border-white/10 pb-4">
                        {t('orderSummary') || "Order Summary"}
                    </h2>
                    
                    <div className="space-y-4 mb-8 text-sm font-medium">
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>{t('items') || "Items"}</span>
                            <span className="text-gray-900 dark:text-white font-bold">${itemsPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>{t('shippingFee') || "Shipping"}</span>
                            <span className="text-gray-900 dark:text-white font-bold">${shippingPrice}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>{t('tax') || "Tax"}</span>
                            <span className="text-gray-900 dark:text-white font-bold">${taxPrice}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-300 dark:border-gray-600 mt-4">
                            <span className="text-gray-900 dark:text-white font-black text-lg">{t('total') || "Total"}</span>
                            <span className="text-primary font-black text-3xl">${totalPrice}</span>
                        </div>
                    </div>

                    <button 
                        onClick={placeOrderHandler}
                        disabled={cartItems.length === 0}
                        className="w-full bg-gradient-to-r from-primary to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 text-white font-black py-4 rounded-2xl flex justify-center items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
                    >
                        {t('placeOrderBtn') || "CONFIRM ORDER"} <FaCheckCircle />
                    </button>
                </div>
            </div>

      </div>
    </div>
  );
};

export default PlaceOrderScreen;