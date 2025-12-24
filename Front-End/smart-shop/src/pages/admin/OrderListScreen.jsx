import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api';
import { FaTrash, FaCalendarAlt, FaUser, FaClipboardList, FaCheck, FaTimes } from 'react-icons/fa';
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
                await api.delete(ENDPOINTS.DELETE_ORDER(id));
                setOrders(orders.filter((order) => (order._id || order.id) !== id));
            } catch (error) {
                alert(t('errorDelete') || "Error deleting order");
            }
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
            <Meta title={t('orderList') || "Orders List"} />
            
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight mb-10">
                    <span className="p-3 bg-primary/10 text-primary rounded-2xl"><FaClipboardList /></span>
                    {t('orders') || "Orders"} <span className="text-sm opacity-50 font-medium">({orders.length})</span>
                </h1>

                {loading ? (
                    <div className="text-center py-20 font-bold animate-pulse text-primary">Loading Orders...</div>
                ) : (
                    <>
                        {/* Mobile View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {orders.map((order) => (
                                <div key={order._id || order.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900 dark:text-white">ID: {(order._id || order.id).toString().substring(0, 8)}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1"><FaUser size={10}/> {order.user && order.user.name}</span>
                                        </div>
                                        <span className="font-black text-primary text-lg">${order.totalPrice}</span>
                                    </div>
                                    
                                    <div className="flex gap-2 mb-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {order.isPaid ? <FaCheck/> : <FaTimes/>} {order.isPaid ? 'PAID' : 'NOT PAID'}
                                        </span>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.isDelivered ? <FaCheck/> : <FaTimes/>} {order.isDelivered ? 'SENT' : 'PENDING'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 dark:border-white/5 pt-3 mt-3">
                                        <span className="flex items-center gap-1"><FaCalendarAlt/> {order.createdAt?.substring(0, 10)}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => navigate(`/order/${order._id || order.id}`)} className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-700 dark:text-white font-bold hover:bg-gray-200">View</button>
                                            <button onClick={() => deleteHandler(order._id || order.id)} className="bg-red-50 dark:bg-red-900/20 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100"><FaTrash/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                                        <th className="p-6 pl-8">ID</th>
                                        <th className="p-6">User</th>
                                        <th className="p-6">Date</th>
                                        <th className="p-6">Total</th>
                                        <th className="p-6 text-center">Paid</th>
                                        <th className="p-6 text-center">Delivered</th>
                                        <th className="p-6 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {orders.map((order) => (
                                        <tr key={order._id || order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition duration-200">
                                            <td className="p-6 pl-8 font-bold text-gray-900 dark:text-white">#{(order._id || order.id).toString().substring(0, 8)}..</td>
                                            <td className="p-6">{order.user && order.user.name}</td>
                                            <td className="p-6 text-gray-500">{order.createdAt?.substring(0, 10)}</td>
                                            <td className="p-6 font-bold text-primary">${order.totalPrice}</td>
                                            <td className="p-6 text-center">
                                                {order.isPaid ? <FaCheck className="text-green-500 mx-auto"/> : <FaTimes className="text-red-500 mx-auto"/>}
                                            </td>
                                            <td className="p-6 text-center">
                                                {order.isDelivered ? <FaCheck className="text-green-500 mx-auto"/> : <FaTimes className="text-yellow-500 mx-auto"/>}
                                            </td>
                                            <td className="p-6 text-right pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => navigate(`/order/${order._id || order.id}`)} className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white px-4 py-2 rounded-xl font-bold text-xs uppercase transition">
                                                        Details
                                                    </button>
                                                    <button onClick={() => deleteHandler(order._id || order.id)} className="bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-xl transition">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderListScreen;