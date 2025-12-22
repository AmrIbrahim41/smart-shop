import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../../api';
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaTrash, FaTimes, FaBoxOpen, FaMagic, FaTag, FaDollarSign, FaLayerGroup, FaImage } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ProductEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const isAdmin = userInfo?.isAdmin;
    const goBackLink = isAdmin ? "/admin/productlist" : "/dashboard";

    // --- State Variables ---
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [image, setImage] = useState('');
    const [preview, setPreview] = useState('');
    const [subImages, setSubImages] = useState([]);
    const [subImagesPreview, setSubImagesPreview] = useState([]);
    const [oldImages, setOldImages] = useState([]);
    const [brand, setBrand] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [category, setCategory] = useState('');
    const [categoriesList, setCategoriesList] = useState([]);
    const [description, setDescription] = useState('');
    const [approvalStatus, setApprovalStatus] = useState('pending');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false); // Loading state for save button specifically

    // --- Fetch Data ---
    const fetchData = async () => {
        try {
            const { data: categories } = await apiService.getCategories();
            setCategoriesList(categories);

            if (id) {
                const { data } = await apiService.getProductDetails(id);
                setName(data.name);
                setPrice(data.price);
                setDiscountPrice(data.discount_price || 0);
                setImage(data.image);
                setPreview(getImageUrl(data.image));
                setOldImages(data.images || []);
                setBrand(data.brand);
                setCountInStock(data.countInStock);
                setCategory(data.category?.id || data.category || '');
                setDescription(data.description);
                setApprovalStatus(data.approval_status);
            }
        } catch (err) {
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // --- Handlers ---
    const uploadFileHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadSubImagesHandler = (e) => {
        const files = Array.from(e.target.files);
        setSubImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setSubImagesPreview(prev => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    const removeSubImage = (index) => {
        setSubImages(prev => prev.filter((_, i) => i !== index));
        setSubImagesPreview(prev => prev.filter((_, i) => i !== index));
    };

    const deleteOldImageHandler = async (imageId) => {
        if (window.confirm('Delete this image?')) {
            try {
                await apiService.deleteProductImage(imageId);
                setOldImages(prev => prev.filter(img => img.id !== imageId));
            } catch (error) {
                alert('Error deleting image');
            }
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setSaveLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('discount_price', discountPrice);
        formData.append('brand', brand);
        formData.append('countInStock', countInStock);
        formData.append('description', description);
        formData.append('category', category);

        if (isAdmin) formData.append('approval_status', approvalStatus);
        if (image instanceof File) formData.append('image', image);
        if (subImages.length > 0) {
            subImages.forEach((file) => formData.append('images', file));
        }

        try {
            let response;
            if (id) {
                response = await apiService.updateProduct(id, formData);
                // alert(t('productUpdated') || 'Updated Successfully!');
            } else {
                response = await apiService.createProduct(formData);
                // alert(t('productCreated') || 'Created Successfully!');
                navigate(goBackLink);
                return; // Exit to avoid trying to use 'response' for update logic on navigation
            }

            // Refresh Data in place (Smooth UX)
            const { data } = response;
            setImage(data.image);
            setPreview(getImageUrl(data.image));
            setOldImages(data.images || []);
            setSubImages([]);
            setSubImagesPreview([]);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            alert(error.response?.data?.detail || 'Error saving product');
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse">Loading Workspace...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center">
                <FaBoxOpen className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Something went wrong</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={() => navigate(goBackLink)} className="px-6 py-2 bg-primary text-white rounded-full hover:bg-orange-600 transition">Return Back</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-28 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out">
            <Meta title={id ? t('editProduct') : t('createProduct')} />

            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-6 mb-10 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        {id ? <FaMagic className="text-primary" /> : <FaBoxOpen className="text-primary" />}
                        {id ? (t('editProduct') || "Edit Product") : (t('createProduct') || "New Product")}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        {id ? "Refine your product details to perfection." : "Bring a new item to your collection."}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(goBackLink)}
                        className="px-6 py-3 rounded-2xl font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <FaArrowLeft /> {t('cancel') || "Cancel"}
                    </button>
                    {/* Sticky Save Button for Mobile */}
                    <button
                        onClick={submitHandler}
                        disabled={saveLoading}
                        className="px-8 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-primary to-orange-600 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saveLoading ? <span className="animate-pulse">Saving...</span> : <><FaSave /> {t('saveChanges') || "Save Changes"}</>}
                    </button>
                </div>
            </div>

            <form onSubmit={submitHandler} className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* === Left Column (Main Image & Gallery) === */}
                <div className="lg:col-span-4 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

                    {/* Main Image Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-white/20 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-orange-500"></div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><FaImage className="text-primary" /> {t('mainImage') || "Main Image"}</h3>

                        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-600 group-hover:border-primary transition-colors bg-gray-50 dark:bg-gray-900/50">
                            <img
                                src={preview || getImageUrl(image)}
                                alt="Main Preview"
                                className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => e.target.src = '/images/placeholder.png'}
                            />

                            {/* Overlay */}
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm">
                                <FaCloudUploadAlt className="text-white text-5xl mb-2 drop-shadow-md animate-bounce" />
                                <span className="text-white font-bold bg-black/50 px-4 py-1 rounded-full text-sm">Click to Change</span>
                                <input type="file" onChange={uploadFileHandler} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Gallery Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-white/20">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><FaLayerGroup className="text-primary" /> {t('gallery') || "Gallery"}</h3>

                        <div className="grid grid-cols-3 gap-2">
                            {/* Old Images */}
                            {oldImages.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 dark:border-gray-700">
                                    <img src={getImageUrl(img.image)} alt="Old" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => deleteOldImageHandler(img.id)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}

                            {/* New Previews */}
                            {subImagesPreview.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-primary/50">
                                    <img src={url} alt="New" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeSubImage(index)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}

                            {/* Add Button */}
                            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex flex-col items-center justify-center text-gray-400 hover:text-primary">
                                <FaCloudUploadAlt className="text-2xl mb-1" />
                                <span className="text-[10px] font-bold uppercase">Add</span>
                                <input type="file" multiple onChange={uploadSubImagesHandler} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* === Right Column (Form Details) === */}
                <div className="lg:col-span-8 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                    {/* General Info */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-white/20">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Product Information</h2>

                        <div className="grid gap-6">
                            {/* Name */}
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{t('productName') || "Product Name"}</label>
                                <div className="relative">
                                    <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-semibold"
                                        placeholder="e.g. Modern Leather Sofa"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Price & Discount Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{t('price') || "Price"}</label>
                                    <div className="relative">
                                        <FaDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="text-xs font-bold text-red-500/80 uppercase tracking-wider mb-2 block">{t('discountPrice') || "Sale Price"}</label>
                                    <div className="relative">
                                        <FaDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 group-focus-within:text-red-500 transition-colors" />
                                        <input
                                            type="number"
                                            value={discountPrice}
                                            onChange={(e) => setDiscountPrice(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all text-red-600 dark:text-red-400 font-bold placeholder-red-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{t('description') || "Description"}</label>
                                <textarea
                                    rows="4"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white resize-none"
                                    placeholder="Tell your customers about this product..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Categorization & Stock */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-white/20">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Inventory & Sorting</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{t('category') || "Category"}</label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-semibold cursor-pointer appearance-none"
                                        required
                                    >
                                        <option value="">Select...</option>
                                        {categoriesList.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{t('brand') || "Brand"}</label>
                                <input
                                    type="text"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-semibold"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{t('stock') || "Stock"}</label>
                                <input
                                    type="number"
                                    value={countInStock}
                                    onChange={(e) => setCountInStock(e.target.value)}
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-semibold"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </form>

            {/* CSS Animation Styles (Inline for simplicity) */}
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fadeInDown 0.6s ease-out forwards; }
                .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
            `}</style>
        </div>
    );
};

export default ProductEditScreen;