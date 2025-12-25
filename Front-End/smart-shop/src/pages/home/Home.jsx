import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Paginate from '../../components/paginate/Paginate';
import ProductCarousel from '../../components/slider/ProductCarousel';
import Meta from '../../components/tapheader/Meta';
import ProductCard from '../../components/productcard/ProductCard';
import { useSettings } from '../../context/SettingsContext';
import api, { ENDPOINTS } from '../../api';
import { FaFilter, FaFire } from 'react-icons/fa';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSettings();

  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const pageNumber = searchParams.get('page') || 1;

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // شلنا الـ categoryId من هنا لأنه خلاص مبقاش مستخدم في الصفحة دي
      const query = `?keyword=${keyword}&page=${pageNumber}`;
      const { data } = await api.get(`${ENDPOINTS.PRODUCTS}${query}`);
      setProducts(data.products);
      setPage(data.page);
      setPages(data.pages);
      setLoading(false);
    } catch (error) { 
        setLoading(false);
    }
  }, [keyword, pageNumber]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const isMainHome = useMemo(() => !keyword && String(pageNumber) === '1', [keyword, pageNumber]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Meta title={keyword ? `${keyword} - Search Results` : "Home | SmartShop"} />

      {/* Hero Slider */}
      {isMainHome && (
        <div className="pt-20 md:pt-24 px-4 max-w-[1400px] mx-auto mb-6">
            <ProductCarousel />
        </div>
      )}

      {/* Main Container */}
      <div className={`max-w-[1400px] mx-auto px-4 pb-24 ${!isMainHome ? 'pt-24' : ''}`}>
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-2 uppercase">
                    {keyword ? `Results for "${keyword}"` : (
                        <>
                            {t('latestProducts') || "LATEST PRODUCTS"}
                            <FaFire className="text-orange-500 animate-pulse text-2xl" />
                        </>
                    )}
                </h1>
                <p className="text-gray-400 text-sm mt-1 font-medium">{loading ? 'Updating...' : `${products.length} Items Available`}</p>
            </div>
            
            {/* ❌ تم حذف قسم التصنيفات (Categories) من هنا بناءً على طلبك ❌ */}

        </div>

        {/* Grid Section */}
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[4/5] bg-gray-200 dark:bg-gray-800 rounded-[2rem] animate-pulse"></div>
                ))}
            </div>
        ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {products.map((product) => (
                    <ProductCard key={product.id || product._id} product={product} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <FaFilter size={30}/>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No products found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
                <button onClick={() => navigate('/')} className="mt-6 text-primary font-bold underline">
                    View All Products
                </button>
            </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
            <div className="mt-16 flex justify-center pb-10">
                <Paginate pages={pages} page={page} keyword={keyword ? keyword : ''} />
            </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;