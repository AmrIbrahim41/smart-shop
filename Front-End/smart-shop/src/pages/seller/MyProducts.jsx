import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// تعديل: استدعاء getImageUrl من ملف الـ API
import api, { ENDPOINTS, getImageUrl } from '../../api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useSettings();

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        // استخدام api بدلاً من axios المباشر لضمان إضافة التوكن
        const { data } = await api.get(ENDPOINTS.MY_PRODUCTS);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDelete') || "Are you sure you want to delete this product?")) {
      try {
        // الحذف باستخدام api instance
        await api.delete(`${ENDPOINTS.PRODUCTS}${id}/`);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert(t('deleteError') || "Error deleting product");
      }
    }
  };

  if (loading) return <div className="text-center text-gray-600 dark:text-white p-10 animate-pulse">{t('loading') || "Loading..."}</div>;

  return (
    <div>
      <Meta title={t('myProducts') || "My Products"} />
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            {t('myProducts') || "My Products"}
        </h2>
        <Link to="/seller/products/add" className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition shadow-md">
            <FaPlus /> {t('addNew') || "Add New"}
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10 bg-white dark:bg-dark-accent rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
            <p>{t('noProductsAdded') || "You haven't added any products yet."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-dark-accent rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors">
          <table className="w-full text-left text-gray-500 dark:text-gray-400 text-sm">
            <thead className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 uppercase font-bold transition-colors">
              <tr>
                <th className="p-4">{t('product') || "Product"}</th>
                <th className="p-4">{t('price') || "Price"}</th>
                <th className="p-4">{t('stock') || "Stock"}</th>
                <th className="p-4">{t('status') || "Status"}</th>
                <th className="p-4">{t('actions') || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5 transition-colors">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img 
                        // تعديل: استخدام getImageUrl لضمان ظهور الصورة
                        src={getImageUrl(product.main_image || product.image)} 
                        alt={product.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-white/10" 
                        onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                    />
                    <span className="font-bold text-gray-900 dark:text-white">{product.name}</span>
                  </td>
                  <td className="p-4 font-bold text-primary">${product.price}</td>
                  <td className="p-4 text-gray-900 dark:text-white">{product.countInStock || product.stock}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        product.approval_status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-500' : 
                        product.approval_status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-500' : 
                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500'
                    }`}>
                        {t(product.approval_status) || product.approval_status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-3 text-lg">
                    <Link to={`/seller/product/${product.id}/edit`} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition">
                        <FaEdit />
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition">
                        <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyProducts;