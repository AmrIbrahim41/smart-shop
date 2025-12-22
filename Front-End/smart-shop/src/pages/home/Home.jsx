import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThLarge } from 'react-icons/fa';
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
        const { data } = await apiService.getCategories(); // استخدام الخدمة المركزية
        setCategories(data);
      } catch (error) {
        console.log("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // بناء رابط الاستعلام (Query String) بشكل يدوي لضمان الدقة
        const query = `?keyword=${keyword}&page=${pageNumber}&category=${categoryId}`;

        // نستخدم api المباشر هنا لأن getProducts في الخدمة لا تأخذ بارامترات حالياً
        const { data } = await api.get(`${ENDPOINTS.PRODUCTS}${query}`);

        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, pageNumber, categoryId]); // الفلترة هتشتغل أول ما أي قيمة تتغير

  const handleCategoryClick = (id) => {
    if (!id) {
      navigate('/');
    } else {
      navigate(`/?category=${id}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">

      {/* ديناميكية العنوان بناءً على البحث أو الفلترة */}
      {!keyword && !categoryId ? (
        <Meta title={t('welcomeTitle') || "Welcome to Smart Shop"} />
      ) : (
        <Meta title={t('productsTitle') || "Search Results"} />
      )}

      {/* إظهار الـ Carousel فقط في الصفحة الرئيسية العامة */}
      {!keyword && !categoryId && <ProductCarousel />}

      {/* زر الرجوع للكل في حالة البحث أو الفلترة */}
      {(keyword || categoryId) && (
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400 hover:text-primary font-bold transition"
        >
          &larr; {t('backToProducts') || "Back to All Products"}
        </button>
      )}

      {/* قسم الأقسام (Categories) */}
      <div className="mb-10">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FaThLarge className="text-primary" /> {t('browseCategories') || "Browse Categories"}
        </h2>

        <div className="flex flex-wrap gap-3">
          {/* زر "الكل" */}
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-6 py-2 rounded-full font-bold transition border ${categoryId === ''
              ? 'bg-primary border-primary text-white shadow-lg shadow-orange-500/30'
              : 'bg-white dark:bg-dark-accent border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:text-dark'
              }`}
          >
            {t('all') || "All"}
          </button>

          {/* قائمة الأقسام من الباك إند */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-6 py-2 rounded-full font-bold transition border ${String(categoryId) === String(cat.id)
                ? 'bg-primary border-primary text-white shadow-lg shadow-orange-500/30'
                : 'bg-white dark:bg-dark-accent border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:text-dark'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* عنوان المنتجات */}
      <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-8 flex items-center gap-2">
        <span className="bg-primary w-2 h-8 rounded-full block"></span>
        {keyword
          ? `${t('searchResults') || "Search Results for:"} "${keyword}"`
          : categoryId
            ? t('filteredProducts') || "Filtered Products"
            : t('latestProducts') || "LATEST PRODUCTS"}
      </h2>

      {loading ? (
        <div className="text-gray-500 dark:text-white text-center py-20 text-xl font-bold animate-pulse">
          {t('loading') || "Loading products..."}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-accent rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
            {t('noProducts') || "No products found."}
          </h3>
          <p className="text-gray-500">{t('tryAgain') || "Try clearing filters or searching for something else."}</p>
        </div>
      ) : (
        <>
          {/* شبكة المنتجات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id || product._id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* الترقيم (Pagination) */}
          <div className="mt-12 flex justify-center">
            <Paginate pages={pages} page={page} keyword={keyword ? keyword : ''} />
          </div>
        </>
      )}
    </div>
  );
};

export default HomeScreen;