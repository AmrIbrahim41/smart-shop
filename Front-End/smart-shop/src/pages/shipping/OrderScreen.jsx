import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../../api';
import { FaUser, FaShippingFast, FaBoxOpen, FaCheck, FaTimes, FaCalendarAlt, FaEnvelope } from 'react-icons/fa';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const OrderScreen = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useSettings();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(ENDPOINTS.ORDER_DETAILS(id));
      setOrder(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || t('errorLoadingOrder') || "Error loading order");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const successPaymentHandler = async (paymentResult) => {
    try {
      await api.put(ENDPOINTS.PAY_ORDER(id), paymentResult);
      alert(t('paymentSuccessful') || "Payment Successful! 🎉");
      fetchOrder(); 
    } catch (err) {
      alert(t('errorPayment') || "Error updating payment status");
    }
  };

  const deliverHandler = async () => {
    try {
        await api.put(ENDPOINTS.DELIVER_ORDER(id), {});
        alert(t('orderDelivered') || "Order Delivered! 🚚");
        fetchOrder();
    } catch (error) {
        alert(error.response?.data?.detail || t('errorDelivery') || "Error updating order to delivered");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold text-xl animate-pulse">Loading Order...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <Meta title={`${t('order') || 'Order'} #${order._id || order.id}`} />
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    {t('order') || "ORDER"} <span className="text-primary">#{order._id || order.id}</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-2 mt-1">
                    <FaCalendarAlt /> {order.createdAt?.substring(0, 10)}
                </p>
            </div>
            
            <div className="flex gap-2">
                 <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${order.isPaid ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
                    {order.isPaid ? 'PAID' : 'NOT PAID'}
                 </div>
                 <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${order.isDelivered ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'}`}>
                    {order.isDelivered ? 'DELIVERED' : 'PENDING'}
                 </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Info */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg"><FaShippingFast /></div>
                    {t('shipping') || "SHIPPING"}
                </h2>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-300 font-medium ml-2">
                    <p className="flex items-center gap-2"><FaUser className="text-gray-400 text-sm"/> {order.user?.name}</p>
                    <p className="flex items-center gap-2"><FaEnvelope className="text-gray-400 text-sm"/> <a href={`mailto:${order.user?.email}`} className="hover:text-primary underline">{order.user?.email}</a></p>
                    <p className="flex items-start gap-2">
                        <span className="mt-1"><FaShippingFast className="text-gray-400 text-sm"/></span> 
                        {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
                    </p>
                </div>
                
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 font-bold border ${order.isDelivered ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'}`}>
                    {order.isDelivered ? <FaCheck className="text-lg"/> : <FaCalendarAlt className="text-lg"/>}
                    {order.isDelivered ? `${t('deliveredOn') || "Delivered on"} ${order.deliveredAt?.substring(0, 10)}` : (t('notDelivered') || "Not Delivered Yet")}
                </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg"><FaUser /></div>
                    {t('payment') || "PAYMENT"}
                </h2>
                <p className="text-gray-900 dark:text-white font-bold mb-4 ml-2">
                    Method: <span className="text-primary">{order.paymentMethod}</span>
                </p>
                 <div className={`p-4 rounded-xl flex items-center gap-3 font-bold border ${order.isPaid ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                    {order.isPaid ? <FaCheck className="text-lg"/> : <FaTimes className="text-lg"/>}
                    {order.isPaid ? `${t('paidOn') || "Paid on"} ${order.paidAt?.substring(0, 10)}` : (t('notPaid') || "Not Paid Yet")}
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg"><FaBoxOpen /></div>
                    {t('orderItems') || "ITEMS"}
                </h2>
                <div className="space-y-4">
                    {order.orderItems?.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 transition hover:scale-[1.01]">
                            <img 
                                src={getImageUrl(item.image)} 
                                alt={item.name} 
                                className="w-14 h-14 rounded-xl object-contain bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600" 
                                onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                            />
                            <div className="flex-1 min-w-0">
                                <Link to={`/product/${item.product}`} className='text-gray-900 dark:text-white font-bold hover:text-primary transition line-clamp-1'>{item.name}</Link>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.qty} x ${item.price}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-900 dark:text-white font-black text-lg">${(item.qty * item.price).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 sticky top-24 shadow-2xl">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-white/10 pb-4 uppercase tracking-wider">
                    {t('orderSummary') || "Summary"}
                </h3>
                <div className="space-y-4 text-sm font-medium mb-8">
                    <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>{t('items') || "Items"}</span><span>${(order.totalPrice - order.taxPrice - order.shippingPrice).toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>{t('shippingFee') || "Shipping"}</span><span>${order.shippingPrice}</span></div>
                    <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>{t('tax') || "Tax"}</span><span>${order.taxPrice}</span></div>
                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-300 dark:border-gray-600 mt-4">
                        <span className="text-gray-900 dark:text-white font-black text-lg">{t('total') || "TOTAL"}</span>
                        <span className="text-primary font-black text-3xl">${order.totalPrice}</span>
                    </div>
                </div>
                
                {/* PayPal Buttons */}
                {!order.isPaid && (
                    <div className="z-0 relative">
                        <PayPalScriptProvider options={{ "client-id": "AUSM3-CzTVJEjqrXYXi9j3ct7D-kpJzzAU3q9qJ1AgpYBPyXs3uhV5ocIu_pIB-hciku3VGOE52ccmVD", currency: "USD" }}>
                            <PayPalButtons 
                                style={{ layout: "vertical", shape: "rect", borderRadius: 12 }}
                                createOrder={(data, actions) => {
                                    return actions.order.create({ purchase_units: [{ amount: { value: order.totalPrice.toString() } }] });
                                }}
                                onApprove={(data, actions) => {
                                    return actions.order.capture().then((details) => { successPaymentHandler(details); });
                                }}
                            />
                        </PayPalScriptProvider>
                    </div>
                )}

                {/* Admin Delivery Button */}
                {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                    <button 
                        onClick={deliverHandler}
                        className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 hover:text-white dark:hover:bg-white dark:hover:text-dark text-white font-bold py-4 rounded-2xl transition shadow-lg mt-4 flex justify-center items-center gap-2 uppercase tracking-wide"
                    >
                        {t('markAsDelivered') || "MARK AS DELIVERED"} 🚚
                    </button>
                )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderScreen;