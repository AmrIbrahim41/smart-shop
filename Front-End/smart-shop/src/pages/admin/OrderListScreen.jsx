import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../../api';
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
                const { data } = await apiService.getOrders();
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
                await apiService.deleteOrder(id);
                setOrders(orders.filter((order) => (order._id || order.id) !== id));
                alert(t('orderDeleted') || "Order Deleted Successfully");
            } catch (error) {
                alert(error.response?.data?.detail || t('deleteOrderError') || "Error deleting order");
            }
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
            <Meta title={t('orderList') || "ORDER LIST"} />

            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8 uppercase transition-colors">
                    <FaBoxOpen className="inline-block mb-1 me-2" /> {t('allOrders') || "ALL ORDERS"}
                </h1>

                {loading ? (
                    <div className="text-gray-600 dark:text-white text-center font-bold animate-pulse py-20">
                        {t('loadingOrders') || "Loading Orders..."}
                    </div>
                ) : (
                    <>
                        {/* 1. عرض البطاقات للموبايل (Cards View) */}
                        <div className="md:hidden space-y-4">
                            {orders.map((order) => (
                                <div key={order._id || order.id} className="bg-white dark:bg-dark-accent p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">ID</span>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">#{order._id || order.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{t('total') || "TOTAL"}</span>
                                            <p className="text-lg font-black text-primary">${order.totalPrice}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <FaUser className="text-gray-400" />
                                            <span className="font-bold">{order.user && (order.user.name || order.user.username)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <FaCalendarAlt className="text-gray-400" />
                                            <span>{order.createdAt?.substring(0, 10)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className={`p-2 rounded-lg text-center border ${order.isPaid ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10'}`}>
                                            <p className="text-[10px] font-bold uppercase mb-1">{t('paid') || "PAID"}</p>
                                            {order.isPaid ? <FaCheck className="mx-auto" /> : <FaTimes className="mx-auto" />}
                                        </div>
                                        <div className={`p-2 rounded-lg text-center border ${order.isDelivered ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10' : 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-500/10'}`}>
                                            <p className="text-[10px] font-bold uppercase mb-1">{t('delivered') || "DELIVERED"}</p>
                                            {order.isDelivered ? <FaCheck className="mx-auto" /> : <FaTimes className="mx-auto" />}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/order/${order._id || order.id}`)}
                                            className="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-900 dark:text-white py-2 rounded-xl font-bold text-sm transition"
                                        >
                                            {t('details') || "DETAILS"}
                                        </button>
                                        <button
                                            onClick={() => deleteHandler(order._id || order.id)}
                                            className="w-12 flex items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. عرض الجدول للشاشات الكبيرة (Table View) */}
                        <div className="hidden md:block overflow-x-auto bg-white dark:bg-dark-accent rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase text-xs">
                                        <th className="p-4">ID</th>
                                        <th className="p-4">{t('user') || "USER"}</th>
                                        <th className="p-4">{t('date') || "DATE"}</th>
                                        <th className="p-4">{t('total') || "TOTAL"}</th>
                                        <th className="p-4 text-center">{t('paid') || "PAID"}</th>
                                        <th className="p-4 text-center">{t('delivered') || "DELIVERED"}</th>
                                        <th className="p-4 text-center">{t('actions') || "ACTIONS"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm text-gray-700 dark:text-gray-300">
                                    {orders.map((order) => (
                                        <tr key={order._id || order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">#{order._id || order.id}</td>
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                {order.user && (order.user.name || order.user.username)}
                                            </td>
                                            <td className="p-4">{order.createdAt?.substring(0, 10)}</td>
                                            <td className="p-4 text-primary font-bold">${order.totalPrice}</td>
                                            <td className="p-4 text-center">
                                                {order.isPaid ? (
                                                    <span className="text-green-600 dark:text-green-400 font-bold italic">
                                                        {order.paidAt?.substring(0, 10)}
                                                    </span>
                                                ) : (
                                                    <FaTimes className="text-red-500 mx-auto" />
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {order.isDelivered ? (
                                                    <span className="text-green-600 dark:text-green-400 font-bold italic">
                                                        {order.deliveredAt?.substring(0, 10)}
                                                    </span>
                                                ) : (
                                                    <FaTimes className="text-red-500 mx-auto" />
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => navigate(`/order/${order._id || order.id}`)}
                                                        className="bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 px-3 py-1 rounded transition text-xs font-bold uppercase shadow-sm"
                                                    >
                                                        {t('details') || "DETAILS"}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteHandler(order._id || order.id)}
                                                        className="bg-red-100 text-red-600 dark:bg-red-500/10 hover:bg-red-500 hover:text-white p-2 rounded transition shadow-sm"
                                                        title={t('delete') || "Delete"}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {orders.length === 0 && (
                            <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-dark-accent rounded-2xl border border-gray-200 dark:border-white/10 mt-4">
                                {t('noOrdersFound') || "No orders found."}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderListScreen;