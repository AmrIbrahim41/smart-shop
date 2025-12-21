import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api';
import { FaUser, FaShippingFast } from 'react-icons/fa';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext'; // 1. Import Hook

const OrderScreen = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { t } = useSettings(); // 2. Use Hook

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`${ENDPOINTS.ORDER_DETAILS}${id}/`);
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
      await api.put(`${ENDPOINTS.PAY_ORDER}${id}/pay/`, paymentResult);
      alert(t('paymentSuccessful') || "Payment Successful! 🎉");
      fetchOrder(); 
    } catch (err) {
      alert(t('errorPayment') || "Error updating payment status");
    }
  };

  const deliverHandler = async () => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`, 
            },
        };
        
        await api.put(`orders/${id}/deliver/`, {}, config);
        
        alert(t('orderDelivered') || "Order Delivered! 🚚");
        fetchOrder();
    } catch (error) {
        console.error(error);
        alert(error.response?.data?.detail || t('errorDelivery') || "Error updating order to delivered");
    }
  };

  if (loading) return <div className="text-gray-600 dark:text-white text-center pt-32 font-bold animate-pulse">{t('loading') || "Loading..."}</div>;
  if (error) return <div className="text-red-500 text-center pt-32 font-bold">{error}</div>;

  return (
    <div className="min-h-screen pt-28 pb-10 px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={`${t('order') || 'Order'} #${order._id || order.id}`} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase transition-colors">
            {t('order') || "ORDER"}: <span className="text-primary">#{order._id || order.id}</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          
          {/* التفاصيل (يسار) */}
          <div className="flex-1 space-y-6">
            
            {/* Shipping Info */}
            <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase">
                    <FaShippingFast className="text-primary"/> {t('shipping') || "SHIPPING"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                    <strong className="text-gray-900 dark:text-white">{t('name') || "Name"}: </strong> {order.user?.name}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    <strong className="text-gray-900 dark:text-white">{t('email') || "Email"}: </strong> 
                    <a href={`mailto:${order.user?.email}`} className='text-blue-600 dark:text-primary hover:underline'>{order.user?.email}</a>
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    <strong className="text-gray-900 dark:text-white">{t('address') || "Address"}: </strong> 
                    {order.shippingAddress?.address}, {order.shippingAddress?.city}
                </p>
                {order.isDelivered ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-500/20 dark:border-none dark:text-green-400 p-3 rounded-xl text-center font-bold">
                        {t('deliveredOn') || "Delivered on"} {order.deliveredAt?.substring(0, 10)}
                    </div>
                ) : (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 dark:bg-yellow-500/20 dark:border-none dark:text-yellow-400 p-3 rounded-xl text-center font-bold">
                        {t('notDelivered') || "Not Delivered Yet"}
                    </div>
                )}
            </div>

            {/* Payment Info */}
            <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase">
                    <FaUser className="text-primary"/> {t('payment') || "PAYMENT"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    <strong className="text-gray-900 dark:text-white">{t('method') || "Method"}: </strong> {order.paymentMethod}
                </p>
                {order.isPaid ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-500/20 dark:border-none dark:text-green-400 p-3 rounded-xl text-center font-bold">
                        {t('paidOn') || "Paid on"} {order.paidAt?.substring(0, 10)}
                    </div>
                ) : (
                    <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-500/20 dark:border-none dark:text-red-400 p-3 rounded-xl text-center font-bold">
                        {t('notPaid') || "Not Paid"}
                    </div>
                )}
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase">{t('orderItems') || "ORDER ITEMS"}</h2>
                {order.orderItems?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 border-b border-gray-200 dark:border-white/5 pb-4 last:border-0 mb-4 last:mb-0">
                        <img src={`http://127.0.0.1:8000${item.image}`} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-white/10" />
                        <div className="flex-1 text-gray-900 dark:text-white font-bold">
                            <Link to={`/product/${item.product}`} className='hover:text-primary transition line-clamp-1'>{item.name}</Link>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                            {item.qty} x ${item.price} = <span className="text-gray-900 dark:text-white font-bold">${(item.qty * item.price).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* ملخص الحساب (يمين) */}
          <div className="lg:w-[350px]">
            <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 sticky top-28 shadow-xl dark:shadow-none transition-colors duration-300">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-4 uppercase">
                    {t('orderSummary') || "ORDER SUMMARY"}
                </h3>
                <div className="space-y-3 text-sm mb-6 text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between"><span>{t('items') || "Items"}</span><span>${(order.totalPrice - order.taxPrice - order.shippingPrice).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>{t('shippingFee') || "Shipping"}</span><span>${order.shippingPrice}</span></div>
                    <div className="flex justify-between"><span>{t('tax') || "Tax"}</span><span>${order.taxPrice}</span></div>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-white/10 pt-4 mb-6 transition-colors">
                    <span className="text-gray-900 dark:text-white font-black text-lg">{t('total') || "TOTAL"}</span>
                    <span className="text-primary font-black text-2xl">${order.totalPrice}</span>
                </div>
                
                {/* زرار PayPal */}
                {!order.isPaid && (
                    <PayPalScriptProvider options={{ 
                        "client-id": "AUSM3-CzTVJEjqrXYXi9j3ct7D-kpJzzAU3q9qJ1AgpYBPyXs3uhV5ocIu_pIB-hciku3VGOE52ccmVD",
                        currency: "USD" 
                    }}>
                        <PayPalButtons 
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    purchase_units: [{ 
                                        amount: { 
                                            value: order.totalPrice.toString() 
                                        } 
                                    }],
                                });
                            }}
                            onApprove={(data, actions) => {
                                return actions.order.capture().then((details) => {
                                    successPaymentHandler(details);
                                });
                            }}
                            onError={(err) => {
                                console.error("PayPal Error:", err);
                                alert("PayPal Error. Check console.");
                            }}
                        />
                    </PayPalScriptProvider>
                )}

                {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                    <button 
                        onClick={deliverHandler}
                        className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 hover:text-white dark:hover:bg-white dark:hover:text-dark text-white font-bold py-4 rounded-xl transition shadow-lg mt-4 flex justify-center items-center gap-2 uppercase"
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