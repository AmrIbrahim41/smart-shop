import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// تعديل: استيراد getImageUrl
import api, { ENDPOINTS, getImageUrl } from '../../api';
import { FaPlus, FaEdit, FaTrash, FaEye, FaImage } from 'react-icons/fa'; 
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { t } = useSettings();

  const fetchMyProducts = async () => {
    try {
      // استخدام api للحصول على المنتجات الخاصة بالبائع
      const response = await api.get(ENDPOINTS.MY_PRODUCTS);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError(t('errorLoadingProducts') || "Failed to load products.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm(t('confirmDelete') || 'Are you sure?')) {
      try {
        // استخدام المسار النسبي للحذف
        await api.delete(`/api/products/delete/${id}/`);
        fetchMyProducts(); // تحديث القائمة بعد الحذف
      } catch (err) {
        alert(t('deleteError') || 'Error deleting product');
      }
    }
  };

  const createProductHandler = async () => {
    try {
        // إنشاء منتج جديد فارغ ثم التوجيه للتعديل
        const response = await api.post('/api/products/create/', {});
        navigate(`/product/${response.data.id}/edit`, { state: { isNew: true } });
    } catch (err) {
        alert(t('createError') || 'Error creating product');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') {
        return <span className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-200 dark:border-green-500/30">{t('approved') || "APPROVED"}</span>;
    } else if (status === 'rejected') {
        return <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-200 dark:border-red-500/30">{t('rejected') || "REJECTED"}</span>;
    } else {
        return <span className="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-500/30">{t('pending') || "PENDING"}</span>;
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={t('sellerDashboard') || "Seller Dashboard"} />
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-xl transition-colors">
            <div className="mb-4 md:mb-0 text-center md:text-left">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase">{t('sellerDashboard') || "SELLER DASHBOARD"}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('manageInventory') || "Manage your store inventory"}</p>
            </div>
            <button 
                onClick={createProductHandler} 
                className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg"
            >
                <FaPlus /> {t('createProduct') || "Create Product"}
            </button>
        </div>

        {loading ? (
           <div className="text-center py-20 text-gray-600 dark:text-white font-bold animate-pulse">{t('loading') || "Loading..."}</div>
        ) : error ? (
           <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-500/10 dark:text-red-500 p-4 rounded-xl text-center font-bold">{error}</div>
        ) : (
          <div className="bg-white dark:bg-dark-accent rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-lg dark:shadow-2xl transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-white/10 transition-colors">
                    <th className="p-5 font-semibold">{t('product') || "Product"}</th>
                    <th className="p-5 font-semibold">{t('price') || "Price"}</th>
                    <th className="p-5 font-semibold text-center">{t('status') || "Status"}</th>
                    <th className="p-5 font-semibold text-center">{t('actions') || "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5 transition-colors">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                      
                      {/* product name & image */}
                      <td className="p-5 text-gray-900 dark:text-white font-bold flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0 flex items-center justify-center">
                            {/* تعديل: استخدام getImageUrl */}
                            {product.image ? (
                                <img 
                                    src={getImageUrl(product.image)} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                                />
                            ) : (
                                <FaImage className="text-gray-400" />
                            )}
                            {/* أيقونة احتياطية تظهر في حالة خطأ الصورة */}
                            <FaImage className="text-gray-400 hidden" />
                        </div>
                        <div>
                            <div className="text-sm line-clamp-1">{product.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">ID: {product.id}</div>
                        </div>
                      </td>

                      <td className="p-5 text-primary font-bold">${product.price}</td>
                      
                      {/* statues*/}
                      <td className="p-5 text-center">
                        {getStatusBadge(product.approval_status)}
                      </td>

                      {/*buttons */}
                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-2">
                            {/* view */}
                            <button 
                                onClick={() => navigate(`/product/${product.id}`)}
                                className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-dark dark:hover:text-white transition shadow-sm"
                                title={t('view') || "View"}
                            >
                                <FaEye />
                            </button>

                            <button 
                                onClick={() => navigate(`/seller/product/${product.id}/edit`)} // تعديل: المسار الصحيح لتعديل التاجر
                                className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition shadow-sm"
                                title={t('edit') || "Edit"}
                            >
                                <FaEdit />
                            </button>
                            
                            <button 
                                onClick={() => deleteHandler(product.id)}
                                className="p-2 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm"
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
              {products.length === 0 && (
                  <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-bold">{t('noProductsFound') || "No products found."}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;