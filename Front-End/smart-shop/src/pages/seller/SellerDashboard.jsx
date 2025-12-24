import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../../api';
import { FaPlus, FaEdit, FaTrash, FaEye, FaImage, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'; 
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
        await api.delete(`/api/products/delete/${id}/`);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert("Error deleting product");
      }
    }
  };

  const getStatusBadge = (status) => {
      switch(status) {
          case 'approved': return <span className="flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider"><FaCheckCircle/> Approved</span>;
          case 'rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-100 dark:bg-red-500/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider"><FaTimesCircle/> Rejected</span>;
          default: return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider"><FaClock/> Pending</span>;
      }
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <Meta title={t('sellerDashboard') || "Seller Dashboard"} />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {t('myProducts') || "My Products"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your catalog and stock</p>
            </div>
            {/* 🔥 إصلاح 2: استخدام الرابط المطلق */}
            <button 
                onClick={() => navigate('/seller/products/add')}
                className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/30 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
                <FaPlus /> {t('createProduct') || "Add New Product"}
            </button>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-20 text-primary font-bold animate-pulse">Loading...</div>
        ) : error ? (
            <div className="text-center text-red-500 font-bold py-10">{error}</div>
        ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-dashed border-gray-300 dark:border-gray-700">
                <FaImage className="text-6xl text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products yet</h3>
                <button onClick={() => navigate('/seller/products/add')} className="text-primary font-bold hover:underline">Start Selling</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 group">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-700 mb-4 border border-gray-100 dark:border-white/5">
                             <img 
                                src={getImageUrl(product.image)} 
                                alt={product.name} 
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                             />
                             <div className="absolute top-2 right-2">
                                 {getStatusBadge(product.approval_status)}
                             </div>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2 flex-1">{product.name}</h3>
                            <span className="font-black text-primary">${product.price}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
                            <span>Stock: <b className={product.countInStock > 0 ? 'text-green-500' : 'text-red-500'}>{product.countInStock}</b></span>
                            <span>{product.brand}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                             <button onClick={() => navigate(`/product/${product.id}`)} className="py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex justify-center"><FaEye/></button>
                             <button onClick={() => navigate(`/seller/product/${product.id}/edit`)} className="py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex justify-center"><FaEdit/></button>
                             <button onClick={() => deleteHandler(product.id)} className="py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition flex justify-center"><FaTrash/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;