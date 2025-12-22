import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../../api'; // استخدام api مباشرة أضمن
import { FaEdit, FaTrash, FaUser, FaImage, FaTag, FaCheckCircle, FaExclamationCircle, FaBan } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ProductListScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { t } = useSettings();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // دالة جلب كل المنتجات (للأدمن)
    const fetchProducts = async () => {
        try {
            // 👇 هنا الإصلاح: بنطلب /api/products/ عشان نجيب كل منتجات الموقع
            const { data } = await api.get('/api/products/');
            
            // التعامل مع البيانات سواء جاية في مصفوفة أو كائن
            setProducts(data.products || data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "Failed to fetch products");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            fetchProducts();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm(t('confirmDeleteProduct') || 'Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/api/products/delete/${id}/`);
                alert(t('productDeleted') || "Product Deleted!");
                fetchProducts(); 
            } catch (error) {
                alert(error.response?.data?.detail || "Error deleting product");
            }
        }
    };

    // دالة مساعدة لعرض حالة الموافقة بشكل شيك
    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded text-xs font-bold"><FaCheckCircle /> Approved</span>;
            case 'rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-100 dark:bg-red-500/20 px-2 py-1 rounded text-xs font-bold"><FaBan /> Rejected</span>;
            default: return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 px-2 py-1 rounded text-xs font-bold"><FaExclamationCircle /> Pending</span>;
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
            <Meta title={t('productList') || "PRODUCTS LIST"} />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase mb-4 md:mb-0">
                        {t('allProducts') || "ALL PRODUCTS (ADMIN)"}
                    </h1>
                    <button 
                        onClick={() => navigate('/seller/product/create')} // زرار لإنشاء منتج جديد
                        className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition shadow-lg"
                    >
                        + Create Product
                    </button>
                </div>

                {loading ? (
                    <div className="text-gray-600 dark:text-white text-center font-bold animate-pulse py-20">Loading Products...</div>
                ) : error ? (
                    <div className="text-red-500 text-center font-bold py-20 bg-white dark:bg-dark-accent rounded-xl border border-red-200">{error}</div>
                ) : (
                    <div className="bg-white dark:bg-dark-accent rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase text-xs">
                                    <th className="p-4 text-center">ID</th>
                                    <th className="p-4 text-center">{t('image') || "IMAGE"}</th>
                                    <th className="p-4">{t('name') || "NAME"}</th>
                                    <th className="p-4">{t('price') || "PRICE"}</th>
                                    <th className="p-4">{t('seller') || "SELLER"}</th>
                                    <th className="p-4 text-center">{t('status') || "STATUS"}</th>
                                    <th className="p-4 text-center">{t('actions') || "ACTIONS"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/10 text-sm text-gray-700 dark:text-gray-300">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                        <td className="p-4 font-bold text-center">#{product.id}</td>
                                        <td className="p-4">
                                            <div className="w-12 h-12 mx-auto rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                                                <img
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={product.name}>{product.name}</td>
                                        <td className="p-4 text-primary font-bold">${product.price}</td>
                                        <td className="p-4 flex items-center gap-2">
                                            <FaUser className="text-gray-400" size={12} />
                                            <span className="truncate max-w-[120px]">{product.user_name || product.user || 'Admin'}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {getStatusBadge(product.approval_status)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => navigate(`/admin/product/${product.id}/edit`)}
                                                    className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition"
                                                    title={t('edit')}
                                                >
                                                    <FaEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => deleteHandler(product.id)}
                                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition"
                                                    title={t('delete')}
                                                >
                                                    <FaTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && (
                            <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-bold">No products found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductListScreen;