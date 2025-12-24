import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThLarge, FaSearch, FaFilter } from 'react-icons/fa';
import Paginate from '../../components/paginate/Paginate';
import ProductCarousel from '../../components/slider/ProductCarousel';
import Meta from '../../components/tapheader/Meta';
import ProductCard from '../../components/productcard/ProductCard';
import { useSettings } from '../../context/SettingsContext';
import api, { ENDPOINTS, apiService } from '../../api';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSettings();

  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const pageNumber = searchParams.get('page') || 1;
  const categoryId = searchParams.get('category') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiService.getCategories();
        setCategories(data);
      } catch (error) { console.log(error); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = `?keyword=${keyword}&page=${pageNumber}&category=${categoryId}`;
        const { data } = await api.get(`${ENDPOINTS.PRODUCTS}${query}`);
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    fetchProducts();
  }, [keyword, pageNumber, categoryId]);

  const handleCategoryClick = (id) => {
    navigate(!id ? '/' : `/?category=${id}`);
  };

  return (
    // تم تقليل الـ Padding العلوي للموبايل (pt-20) وزيادته للكمبيوتر
    <div className="min-h-screen pt-20 md:pt-24 pb-16 px-2 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={keyword ? "Search Results" : "Home | SmartShop"} />

      {/* Slider: مخفي في البحث، وظاهر في الرئيسية */}
      {!keyword && !categoryId && (
        <div className="mb-6 md:mb-10">
           <ProductCarousel />
        </div>
      )}

      {/* Filter & Categories Bar (Sticky) */}
      <div className="sticky top-[60px] md:top-[80px] z-30 mb-6 -mx-2 md:mx-0 px-2 md:px-0">
        <div className="bg-white/90 dark:bg-dark-accent/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5 py-3 shadow-sm md:rounded-2xl md:border md:px-4">
            
            {/* Categories Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                    onClick={() => handleCategoryClick('')}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all border ${
                        categoryId === ''
                        ? 'bg-primary border-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-300'
                    }`}
                >
                    {t('all') || "All"}
                </button>

                {categories.map((cat) => (
                    <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all border ${
                        String(categoryId) === String(cat.id)
                        ? 'bg-primary border-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-300'
                    }`}
                    >
                    {cat.name}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Products Grid */}
      {/* تعديل مهم: grid-cols-2 للموبايل مع gap-2 لتقليل الحجم */}
      <div className="mb-4">
        <h2 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white mb-4 px-1 flex items-center gap-2">
            {keyword ? `Search: "${keyword}"` : (t('latestProducts') || "Latest Drops")}
        </h2>

        {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 dark:bg-white/5 h-48 md:h-80 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No products found.</div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {products.map((product) => (
                <div key={product.id || product._id} className="h-full">
                    {/* يمكنك تمرير prop لتصغير الكارت لو لزم الأمر، لكن الـ Grid هو المتحكم الأساسي */}
                    <ProductCard product={product} />
                </div>
                ))}
            </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center pb-20 md:pb-0">
        <Paginate pages={pages} page={page} keyword={keyword ? keyword : ''} />
      </div>
    </div>
  );
};

export default HomeScreen;