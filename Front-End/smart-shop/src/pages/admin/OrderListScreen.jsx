import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api';
import { FaTimes, FaTrash, FaCheck, FaCalendarAlt, FaUser, FaBoxOpen } from 'react-icons/fa'; 
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useSettings();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.ORDERS_LIST);
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm(t('confirmDeleteOrder') || 'Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/orders/delete/${id}/`);
        setOrders(orders.filter((order) => (order._id || order.id) !== id));
        alert(t('orderDeleted') || "Order Deleted Successfully");
      } catch (error) {
        alert(error.response?.data?.detail || t('deleteOrderError') || "Error deleting order");
      }
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={t('orderList') || "ORDERS LIST"} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-6 md:mb-8 uppercase transition-colors flex items-center gap-2">
            <FaBoxOpen className="text-primary"/> {t('allOrders') || "ALL ORDERS"}
        </h1>

        {loading ? (
          <div className="text-gray-600 dark:text-white text-center font-bold animate-pulse py-20">{t('loadingOrders') || "Loading Orders..."}</div>
        ) : (
          <>
            {/* ========================================= */}
            {/* 1. عرض الموبايل (Cards) - يظهر فقط في الشاشات الصغيرة */}
            {/* ========================================= */}
            <div className="md:hidden space-y-4">
                {orders.map((order) => (
                    <div key={order._id || order.id} className="bg-white dark:bg-dark-accent p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                        {/* رأس الكارت */}
                        <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-white/5 pb-3">
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">ID</span>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">#{order._id || order.id}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{t('total') || "TOTAL"}</span>
                                <p className="text-lg font-black text-primary">${order.totalPrice}</p>
                            </div>
                        </div>

                        {/* التفاصيل */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <FaUser className="text-gray-400" /> 
                                <span className="font-bold">{order.user && order.user.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <FaCalendarAlt className="text-gray-400" />
                                <span>{order.createdAt?.substring(0, 10)}</span>
                            </div>
                        </div>

                        {/* الحالة (Paid / Delivered) */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className={`p-2 rounded-lg text-center border ${order.isPaid ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400'}`}>
                                <p className="text-[10px] font-bold uppercase mb-1">{t('paid') || "PAID"}</p>
                                {order.isPaid ? <FaCheck className="mx-auto" /> : <FaTimes className="mx-auto" />}
                            </div>
                            <div className={`p-2 rounded-lg text-center border ${order.isDelivered ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-400'}`}>
                                <p className="text-[10px] font-bold uppercase mb-1">{t('delivered') || "DELIVERED"}</p>
                                {order.isDelivered ? <FaCheck className="mx-auto" /> : <FaTimes className="mx-auto" />}
                            </div>
                        </div>

                        {/* الأزرار */}
                        <div className="flex gap-2">
                            <button 
                                onClick={() => navigate(`/order/${order._id || order.id}`)}
                                className="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white py-2 rounded-xl font-bold text-sm transition"
                            >
                                {t('details') || "DETAILS"}
                            </button>
                            <button 
                                onClick={() => deleteHandler(order._id || order.id)}
                                className="w-10 flex items-center justify-center bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ========================================= */}
            {/* 2. عرض الكمبيوتر (Table) - يختفي في الشاشات الصغيرة */}
            {/* ========================================= */}
            <div className="hidden md:block overflow-x-auto bg-white dark:bg-dark-accent rounded-xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-xl transition-colors">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs transition-colors">
                    <th className="p-4">ID</th>
                    <th className="p-4">{t('user') || "USER"}</th>
                    <th className="p-4">{t('date') || "DATE"}</th>
                    <th className="p-4">{t('total') || "TOTAL"}</th>
                    <th className="p-4 text-center">{t('paid') || "PAID"}</th>
                    <th className="p-4 text-center">{t('delivered') || "DELIVERED"}</th>
                    <th className="p-4 text-center">{t('actions') || "ACTIONS"}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    {orders.map((order) => (
                    <tr key={order._id || order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                        <td className="p-4 font-bold text-gray-900 dark:text-white">#{order._id || order.id}</td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">{order.user && order.user.name}</td>
                        <td className="p-4">{order.createdAt?.substring(0, 10)}</td>
                        <td className="p-4 text-primary font-bold">${order.totalPrice}</td>
                        
                        <td className="p-4 text-center">
                        {order.isPaid ? (
                            <span className="text-green-600 dark:text-green-400 font-bold">{order.paidAt?.substring(0, 10)}</span>
                        ) : (
                            <FaTimes className="text-red-500 mx-auto" />
                        )}
                        </td>

                        <td className="p-4 text-center">
                        {order.isDelivered ? (
                            <span className="text-green-600 dark:text-green-400 font-bold">{order.deliveredAt?.substring(0, 10)}</span>
                        ) : (
                            <FaTimes className="text-red-500 mx-auto" />
                        )}
                        </td>

                        <td className="p-4 flex items-center justify-center gap-3">
                        <button 
                            onClick={() => navigate(`/order/${order._id || order.id}`)}
                            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-white dark:hover:text-dark text-gray-800 dark:text-white px-3 py-1 rounded transition text-xs font-bold uppercase shadow-sm"
                        >
                            {t('details') || "DETAILS"}
                        </button>

                        <button 
                            onClick={() => deleteHandler(order._id || order.id)}
                            className="bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white p-2 rounded transition shadow-sm"
                            title={t('delete') || "Delete"}
                        >
                            <FaTrash />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {orders.length === 0 && (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-bold">{t('noOrdersFound') || "No orders found."}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderListScreen;