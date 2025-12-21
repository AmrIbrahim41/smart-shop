import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api';
import { FaStar } from 'react-icons/fa';

const ProductCarousel = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
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

    // المنطق الخاص بالتقليب الأوتوماتيكي (Auto Slide)
    useEffect(() => {
        if (products.length === 0) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex === products.length - 1 ? 0 : prevIndex + 1));
        }, 5000); // كل 5 ثواني

        return () => clearInterval(interval);
    }, [products.length]);

    if (loading) return null; // أو ممكن تحط لودينج صغير
    if (products.length === 0) return null; // لو مفيش منتجات بتقييم عالي مخفيش السلايدر

    return (
        <div className="relative w-full h-[300px] md:h-[400px] bg-dark-accent rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10 group">
            
            {/* الصورة والخلفية */}
            <div 
                className="w-full h-full bg-center bg-cover transition-all duration-700 ease-in-out transform"
                style={{ backgroundImage: `url(http://127.0.0.1:8000${products[currentIndex].image})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent"></div>
            </div>

            {/* محتوى النص */}
            <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3 lg:w-1/2">
                <Link to={`/product/${products[currentIndex].id}`} className="block group-hover:-translate-y-2 transition duration-300">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">
                        {products[currentIndex].name}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl text-primary font-bold">${products[currentIndex].price}</span>
                        <div className="flex items-center text-yellow-400 gap-1 text-sm bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                            <span className="font-bold">{products[currentIndex].rating}</span> <FaStar />
                        </div>
                    </div>
                </Link>
            </div>

            {/* مؤشرات التنقل (النقاط اللي تحت) */}
            <div className="absolute bottom-6 right-8 flex gap-2">
                {products.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentIndex ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white'
                        }`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default ProductCarousel;