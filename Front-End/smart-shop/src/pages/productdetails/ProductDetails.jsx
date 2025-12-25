import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { apiService, getImageUrl } from '../../api';
import { FaShoppingCart, FaArrowLeft, FaHeart, FaRegHeart, FaPlus, FaMinus, FaStar, FaEdit, FaUserCircle, FaFire } from 'react-icons/fa'; 
import { useCart } from '../../context/CartContext';
import Rating from '../../components/rating/Rating';
import Meta from '../../components/tapheader/Meta';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { t } = useSettings();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [displayImage, setDisplayImage] = useState('');

    // متغير لتخزين المنتجات المقترحة
    const [relatedProducts, setRelatedProducts] = useState([]);

    // States for Reviews
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchProduct = async () => {
        try {
            setLoading(true);

            // 1. جلب تفاصيل المنتج الحالي
            const { data: currentProduct } = await apiService.getProductDetails(id);
            setProduct(currentProduct);
            setDisplayImage(currentProduct.image);

            // 2. جلب المنتجات للمقترحات
            const response = await apiService.getProducts();

            // 👇 التصحيح: استخراج المصفوفة بناءً على كود views.py
            // الباك إند عندك بيرجع: { products: [...], page: 1, ... }
            let productsList = [];
            if (response.data.products && Array.isArray(response.data.products)) {
                productsList = response.data.products;
            } else if (Array.isArray(response.data)) {
                productsList = response.data;
            }

            // 3. تصفية المنتجات (Filter)
            if (currentProduct.category && productsList.length > 0) {
                const related = productsList.filter((p) => {
                    // مقارنة الكاتيغوري واستبعاد المنتج الحالي
                    // استخدمنا p.id لأن الباك إند بيبعت id مش _id
                    return String(p.category) === String(currentProduct.category) &&
                        String(p.id) !== String(currentProduct.id);
                });

                setRelatedProducts(related.slice(0, 4));
            }

            setLoading(false);

        } catch (error) {
            console.error("Error inside fetchProduct:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    // Quantity Handlers
    const increaseQty = () => {
        if (qty < product.countInStock) setQty(qty + 1);
        else alert("Max limit reached");
    };

    const decreaseQty = () => {
        if (qty > 1) setQty(qty - 1);
    };

    // Add to Cart
    const addToCartHandler = () => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        if (product.countInStock > 0) {
            addToCart(product, qty);
        }
    };

    // --- Review Logic ---
    const userReview = product?.reviews.find(r => r.user === userInfo?.id);

    const editReviewHandler = () => {
        if (userReview) {
            setRating(userReview.rating);
            setComment(userReview.comment);
            setIsEditing(true);
        }
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (!rating || !comment) {
            alert("Please select a rating and write a comment");
            return;
        }
        try {
            setReviewLoading(true);
            if (isEditing) {
                await api.put(`api/products/${id}/reviews/update/`, { rating, comment });
                alert('Review Updated Successfully! ✅');
            } else {
                await api.post(`api/products/${id}/reviews/create/`, { rating, comment });
                alert('Review Submitted! Thank you.');
            }
            setRating(0);
            setComment('');
            setIsEditing(false);
            fetchProduct();
        } catch (error) {
            alert(error.response?.data?.detail || 'Error submitting review');
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20 text-gray-500 font-bold animate-pulse">{t('loading') || "Loading..."}</div>;
    if (!product) return <div className="min-h-screen pt-20 flex items-center justify-center text-red-500 font-bold">Product Not Found</div>;

    const isWishlisted = isInWishlist(product.id);
    const allImages = [product.image, ...(product.images ? product.images.map(img => img.image) : [])];

    return (
        <div className="min-h-screen pt-20 md:pt-28 pb-32 md:pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
            <Meta title={product.name} description={product.description} />

            <div className="max-w-7xl mx-auto">

                {/* Breadcrumb */}
                <Link to="/" className="hidden md:inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold mb-8 transition-colors bg-white dark:bg-white/5 px-4 py-2 rounded-xl shadow-sm">
                    <FaArrowLeft /> {t('backToProducts') || "Back to Store"}
                </Link>

                {/* --- Product Main Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 mb-20">
                    {/* Left Column: Images */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="relative bg-white dark:bg-dark-accent rounded-[2rem] p-4 md:p-8 border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-center h-[320px] md:h-[550px] overflow-hidden group">
                            <img
                                src={getImageUrl(displayImage)}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain drop-shadow-lg transition duration-500 md:group-hover:scale-105"
                                onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                            />
                            <button
                                onClick={() => toggleWishlist(product)}
                                className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 dark:text-white transition-all shadow-sm hover:scale-110 z-10"
                            >
                                {isWishlisted ? <FaHeart className="text-red-500 text-lg md:text-xl animate-bounce" /> : <FaRegHeart className="text-lg md:text-xl" />}
                            </button>
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 px-1 custom-scrollbar">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setDisplayImage(img)}
                                        className={`w-16 h-16 md:w-24 md:h-24 rounded-xl border-2 flex-shrink-0 transition-all overflow-hidden bg-white dark:bg-dark-accent ${displayImage === img ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={getImageUrl(img)} alt={`thumb-${index}`} className="w-full h-full object-contain p-1" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-5 space-y-4 md:space-y-8">
                        <div>
                            <div className="flex justify-between items-start gap-4">
                                <h1 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                                    {product.name}
                                </h1>
                                <div className="md:hidden flex items-center gap-1 text-yellow-400 text-xs font-bold bg-white dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                                    <FaStar /> {product.rating}
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-4 mb-6">
                                <Rating value={product.rating} text={`${product.numReviews} ${t('reviews') || "Reviews"}`} />
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${product.countInStock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                    {product.countInStock > 0 ? (t('inStock') || "In Stock") : (t('outOfStock') || "Sold Out")}
                                </span>
                            </div>

                            <div className="flex items-baseline gap-3 mb-4 md:mb-6 mt-2">
                                {product.discount_price > 0 ? (
                                    <>
                                        <span className="text-3xl md:text-5xl font-black text-primary">${product.discount_price}</span>
                                        <span className="text-lg md:text-2xl text-gray-400 line-through decoration-2">${product.price}</span>
                                    </>
                                ) : (
                                    <span className="text-3xl md:text-5xl font-black text-primary">${product.price}</span>
                                )}
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-lg">
                                {product.description}
                            </p>
                        </div>

                        {/* Desktop Actions Card */}
                        <div className="hidden md:block bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg">
                            {product.countInStock > 0 && (
                                <div className="flex items-center justify-between mb-6">
                                    <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('quantity') || "Quantity"}</span>
                                    <div className="flex items-center gap-4 bg-gray-100 dark:bg-dark rounded-2xl p-2 border border-gray-200 dark:border-white/10">
                                        <button onClick={decreaseQty} disabled={qty === 1} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/10 shadow-sm hover:text-primary disabled:opacity-50 transition">
                                            <FaMinus size={12} />
                                        </button>
                                        <span className="w-8 text-center font-black text-lg text-gray-900 dark:text-white">{qty}</span>
                                        <button onClick={increaseQty} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/10 shadow-sm hover:text-primary transition">
                                            <FaPlus size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={addToCartHandler}
                                disabled={product.countInStock === 0}
                                className="w-full bg-primary hover:bg-orange-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex justify-center items-center gap-3 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed text-lg uppercase tracking-wide transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <FaShoppingCart />
                                {product.countInStock > 0 ? (t('addToCart') || 'Add to Cart') : (t('outOfStock') || 'Sold Out')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Reviews Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 border-t border-gray-200 dark:border-white/10 pt-12 mb-20">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-wide flex items-center gap-2">
                            <FaStar className="text-yellow-400" /> {t('customerReviews') || "Reviews"}
                        </h3>
                        {product.reviews.length === 0 ? (
                            <div className="p-8 bg-gray-50 dark:bg-dark-accent rounded-3xl text-center text-gray-500 font-medium">No reviews yet. Be the first!</div>
                        ) : (
                            <div className="space-y-6">
                                {product.reviews.map((review) => (
                                    <div key={review._id || review.id} className="bg-white dark:bg-dark-accent p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-primary font-bold">
                                                    <FaUserCircle size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{review.user_name || review.name}</h4>
                                                    <Rating value={review.rating} />
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 font-bold">{review.createdAt.substring(0, 10)}</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-wide">
                            {isEditing ? 'Edit Your Review' : (t('writeReview') || "Write a Review")}
                        </h3>
                        {userInfo ? (
                            (userReview && !isEditing) ? (
                                <div className="bg-primary/5 border border-primary/20 dark:border-primary/10 p-8 rounded-[2.5rem] text-center">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                        <FaCheckCircle className="text-green-500" />
                                    </div>
                                    <h3 className="text-gray-900 dark:text-white font-bold text-xl mb-2">You've reviewed this product</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Thanks for sharing your experience!</p>
                                    <button onClick={editReviewHandler} className="inline-flex items-center gap-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 px-6 py-3 rounded-xl font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition shadow-sm">
                                        <FaEdit /> Edit My Review
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submitReviewHandler} className="bg-white dark:bg-dark-accent p-6 md:p-8 rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-white/5">
                                    <div className="mb-6">
                                        <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-2">Rating</label>
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button type="button" key={star} onClick={() => setRating(star)} className={`text-2xl transition-transform hover:scale-125 ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
                                                    <FaStar />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-2">Comment</label>
                                        <textarea rows="4" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-colors" placeholder="Share your experience..."></textarea>
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="submit" disabled={reviewLoading} className="flex-1 bg-primary hover:bg-orange-600 text-white font-black py-4 rounded-xl transition shadow-lg disabled:opacity-70">
                                            {reviewLoading ? 'Submitting...' : (isEditing ? 'UPDATE REVIEW' : 'SUBMIT REVIEW')}
                                        </button>
                                        {isEditing && <button type="button" onClick={() => { setIsEditing(false); setRating(0); setComment(''); }} className="px-6 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>}
                                    </div>
                                </form>
                            )
                        ) : (
                            <div className="p-8 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-500/20 rounded-3xl text-center">
                                <p className="text-yellow-800 dark:text-yellow-500 font-bold mb-4">Please login to write a review</p>
                                <Link to="/login" className="inline-block bg-yellow-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-yellow-600 transition shadow-md">Login Now</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ✨ NEW SECTION: RELATED PRODUCTS ✨ */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 border-t border-gray-200 dark:border-white/10 pt-16">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                                    {t('relatedProducts') || "You May Also Like"}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                                    Discover more items from the same category
                                </p>
                            </div>
                            {/* Decorative Icon */}
                            <div className="hidden md:block text-primary/20 dark:text-primary/10">
                                <FaFire size={50} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            {relatedProducts.map((item) => (
                                <div
                                    // 👇 التصحيح هنا: استخدمنا item.id
                                    key={item.id}
                                    onClick={() => navigate(`/product/${item.id}`)}
                                    className="group cursor-pointer bg-white dark:bg-dark-accent rounded-[2rem] p-4 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
                                >
                                    {/* Hover Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 rounded-[2rem]"></div>

                                    {/* Image */}
                                    <div className="h-40 md:h-56 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl mb-4 overflow-hidden relative">
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {item.discount_price > 0 && (
                                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-20">
                                                SALE
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1 relative z-20">
                                        <h3 className="text-gray-900 dark:text-white font-bold text-sm md:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                            {item.name}
                                        </h3>

                                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                            <FaStar /> <span className="text-gray-400 font-semibold">{item.rating}</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex flex-col">
                                                {item.discount_price > 0 ? (
                                                    <>
                                                        <span className="text-gray-400 line-through text-xs">${item.price}</span>
                                                        <span className="text-primary font-black text-lg md:text-xl">${item.discount_price}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-primary font-black text-lg md:text-xl">${item.price}</span>
                                                )}
                                            </div>
                                            <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                                <FaShoppingCart size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Sticky Mobile Footer Action Bar */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-white/10 p-3 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] flex gap-3 items-center safe-area-bottom">
                {product.countInStock > 0 && (
                    <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl px-2 py-2 h-12 border border-gray-200 dark:border-white/5">
                        <button onClick={decreaseQty} className="px-3 text-gray-600 dark:text-gray-300 active:scale-90 transition"><FaMinus size={10} /></button>
                        <span className="font-black text-gray-900 dark:text-white px-1 text-sm">{qty}</span>
                        <button onClick={increaseQty} className="px-3 text-gray-600 dark:text-gray-300 active:scale-90 transition"><FaPlus size={10} /></button>
                    </div>
                )}
                <button
                    onClick={addToCartHandler}
                    disabled={product.countInStock === 0}
                    className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition disabled:bg-gray-400"
                >
                    <FaShoppingCart />
                    {product.countInStock > 0 ? (t('addToCart') || 'Add to Cart') : 'Sold Out'}
                </button>
            </div>

        </div>
    );
};

const FaCheckCircle = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628 0z"></path>
    </svg>
);

export default ProductDetails;