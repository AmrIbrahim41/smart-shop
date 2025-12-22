import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// استدعاء api عشان نكلم الباك إند مباشرة، واستدعاء دالة الصور
import api, { getImageUrl } from '../../api';
import { FaEdit, FaTrash, FaUser, FaImage, FaTag } from 'react-icons/fa';
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
            // 👇 التعديل: طلبنا /api/products/ عشان نجيب كل حاجة
            const { data } = await api.get('/api/products/');

            // التعامل مع البيانات سواء جاية في مصفوفة مباشرة أو داخل كائن
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
                // حذف المنتج
                await api.delete(`/api/products/delete/${id}/`);
                alert(t('productDeleted') || "Product Deleted!");
                // تحديث القائمة بعد الحذف
                fetchProducts();
            } catch (error) {
                alert(error.response?.data?.detail || t('deleteProductError') || "Error deleting product");
            }
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
            <Meta title={t('productList') || "PRODUCTS LIST"} />

            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8 uppercase transition-colors">
                    {t('allProducts') || "ALL PRODUCTS (ADMIN DASHBOARD)"}
                </h1>

                {loading ? (
                    <div className="text-gray-600 dark:text-white text-center font-bold animate-pulse py-20">
                        {t('loadingProducts') || "Loading Products..."}
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center font-bold py-20 bg-white dark:bg-dark-accent rounded-xl border border-red-200">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* ======================================================= */}
                        {/* 1. عرض البطاقات للموبايل (Mobile View - Cards)        */}
                        {/* ======================================================= */}
                        <div className="md:hidden space-y-4">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white dark:bg-dark-accent p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
                                    <div className="flex gap-4">
                                        {/* صورة المنتج */}
                                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 flex-shrink-0 flex items-center justify-center">
                                            {product.image ? (
                                                <img
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                />
                                            ) : (
                                                <FaImage className="text-gray-400 text-2xl" />
                                            )}
                                            <FaImage className="text-gray-400 text-2xl hidden" />
                                        </div>

                                        {/* تفاصيل المنتج */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{product.name}</h3>
                                            <p className="text-primary font-black text-lg">${product.price}</p>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {/* حالة الموافقة */}
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${product.approval_status === 'approved'
                                                        ? 'bg-green-100 text-green-600 dark:bg-green-500/20'
                                                        : product.approval_status === 'rejected'
                                                            ? 'bg-red-100 text-red-600 dark:bg-red-500/20'
                                                            : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20'
                                                    }`}>
                                                    {t(product.approval_status) || product.approval_status || 'pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* معلومات إضافية (البائع والقسم) */}
                                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                                            <FaUser size={10} /> {product.user_name || product.user || 'Admin'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                                            <FaTag size={10} /> {product.category_name || t('noCategory')}
                                        </div>
                                    </div>

                                    {/* أزرار التحكم */}
                                    <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100 dark:border-white/5">
                                        <button
                                            onClick={() => navigate(`/admin/product/${product.id}/edit`)} // لاحظ: استخدمنا مسار الأدمن للتعديل
                                            className="flex-1 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition"
                                        >
                                            <FaEdit /> {t('edit')}
                                        </button>
                                        <button
                                            onClick={() => deleteHandler(product.id)}
                                            className="w-12 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-2.5 rounded-xl flex items-center justify-center transition hover:bg-red-100 dark:hover:bg-red-900/20"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ======================================================= */}
                        {/* 2. عرض الجدول للشاشات الكبيرة (Desktop View - Table)  */}
                        {/* ======================================================= */}
                        <div className="hidden md:block overflow-x-auto bg-white dark:bg-dark-accent rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg transition-colors">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase text-xs">
                                        <th className="p-4 text-center">ID</th>
                                        <th className="p-4 text-center">{t('image') || "IMAGE"}</th>
                                        <th className="p-4">{t('name') || "NAME"}</th>
                                        <th className="p-4">{t('price') || "PRICE"}</th>
                                        <th className="p-4">{t('seller') || "SELLER"}</th>
                                        <th className="p-4 text-center">{t('status') || "STATUS"}</th>
                                        <th className="p-4">{t('category') || "CATEGORY"}</th>
                                        <th className="p-4 text-center">{t('actions') || "ACTIONS"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/10 text-sm text-gray-700 dark:text-gray-300">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                            <td className="p-4 font-bold text-center">#{product.id}</td>
                                            <td className="p-4">
                                                <div className="w-12 h-12 mx-auto rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                                    {product.image ? (
                                                        <img
                                                            src={getImageUrl(product.image)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                        />
                                                    ) : (
                                                        <FaImage className="text-gray-400" />
                                                    )}
                                                    <FaImage className="text-gray-400 hidden" />
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={product.name}>{product.name}</td>
                                            <td className="p-4 text-primary font-bold">${product.price}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-gray-400" size={12} />
                                                    <span className="truncate max-w-[120px]">{product.user_name || product.user || 'Admin'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase inline-block min-w-[80px] text-center ${product.approval_status === 'approved'
                                                        ? 'bg-green-100 text-green-600 dark:bg-green-500/20'
                                                        : product.approval_status === 'rejected'
                                                            ? 'bg-red-100 text-red-600 dark:bg-red-500/20'
                                                            : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20'
                                                    }`}>
                                                    {t(product.approval_status) || product.approval_status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300 font-bold whitespace-nowrap">
                                                    {product.category_name || t('noCategory')}
                                                </span>
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
                        </div>

                        {products.length === 0 && (
                            <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-dark-accent rounded-2xl border border-gray-200 dark:border-white/10 mt-4">
                                {t('noProductsFound') || "No products found."}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductListScreen;