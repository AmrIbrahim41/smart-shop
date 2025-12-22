import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import api, { ENDPOINTS } from '../../api'; // استدعاء API
import { getImageUrl } from '../../api'; // استدعاء دالة إصلاح الصور

const ProductCarousel = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                // جلب المنتجات الأعلى تقييماً
                const { data } = await api.get(ENDPOINTS.TOP_PRODUCTS);
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching top products", error);
                setLoading(false);
            }
        };

        fetchTopProducts();
    }, []);

    // التقليب الأوتوماتيكي (كل 5 ثواني)
    useEffect(() => {
        if (products.length === 0) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [currentIndex, products.length]);

    // دوال التقليب اليدوي
    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? products.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === products.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    // لو لسه بيحمل أو مفيش منتجات، السلايدر يختفي
    if (loading || products.length === 0) return null;

    return (
        <div className="relative w-full max-w-[1400px] mx-auto h-[300px] md:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-12 border border-gray-200 dark:border-white/10 group bg-gray-100 dark:bg-gray-800">
            
            {/* الخلفية والصورة */}
            <div 
                className="w-full h-full bg-center bg-cover transition-all duration-700 ease-in-out transform"
                style={{ 
                    // 👇 هنا التعديل الجوهري: استخدام getImageUrl
                    backgroundImage: `url(${getImageUrl(products[currentIndex].image)})` 
                }}
            >
                {/* طبقة تظليل عشان النص يبان */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            </div>

            {/* النصوص والمعلومات */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                <Link to={`/product/${products[currentIndex]._id || products[currentIndex].id}`} className="block group-hover:-translate-y-2 transition-transform duration-300">
                    <h2 className="text-3xl md:text-5xl font-black mb-3 drop-shadow-lg uppercase tracking-wider">
                        {products[currentIndex].name}
                    </h2>
                    
                    <div className="flex items-center gap-4">
                        <span className="bg-primary text-white text-lg md:text-xl font-bold px-4 py-1 rounded-full shadow-lg">
                            ${products[currentIndex].price}
                        </span>
                        <div className="flex items-center text-yellow-400 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                            <span className="font-bold mr-1">{products[currentIndex].rating}</span> <FaStar />
                        </div>
                    </div>
                    
                    <p className="mt-4 text-gray-300 line-clamp-2 max-w-2xl hidden md:block text-sm md:text-base opacity-90">
                        {products[currentIndex].description}
                    </p>
                </Link>
            </div>

            {/* أسهم التحكم (تظهر لما تقف بالماوس) */}
            <div className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 left-4 z-10">
                <button onClick={prevSlide} className="bg-black/40 hover:bg-primary text-white p-3 rounded-full backdrop-blur-md transition-all">
                    <FaChevronLeft size={24} />
                </button>
            </div>
            <div className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 right-4 z-10">
                <button onClick={nextSlide} className="bg-black/40 hover:bg-primary text-white p-3 rounded-full backdrop-blur-md transition-all">
                    <FaChevronRight size={24} />
                </button>
            </div>

            {/* النقاط السفلية (Indicators) */}
            <div className="absolute bottom-6 right-6 flex gap-2">
                {products.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                            index === currentIndex ? 'bg-primary w-8' : 'bg-white/50 w-2 hover:bg-white'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductCarousel;