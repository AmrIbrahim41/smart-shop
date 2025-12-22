import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../../api';
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaTrash, FaTimes, FaBoxOpen, FaMagic, FaTag, FaDollarSign, FaLayerGroup, FaImage, FaCheckCircle, FaExclamationCircle, FaBan } from 'react-icons/fa';
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
    const [saveLoading, setSaveLoading] = useState(false);

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
                const catId = data.category?.id || data.category || '';
                setCategory(String(catId));
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
        if (e) e.preventDefault();
        setSaveLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('discount_price', discountPrice);
        formData.append('brand', brand);
        formData.append('countInStock', countInStock);
        formData.append('description', description);
        formData.append('category', category);

        if (isAdmin) {
            formData.append('approval_status', approvalStatus);
        }

        if (image instanceof File) formData.append('image', image);
        if (subImages.length > 0) {
            subImages.forEach((file) => formData.append('images', file));
        }

        try {
            let response;
            if (id) {
                response = await apiService.updateProduct(id, formData);
            } else {
                response = await apiService.createProduct(formData);
                navigate(goBackLink);
                return;
            }

            const { data } = response;
            setImage(data.image);
            setPreview(getImageUrl(data.image));
            setOldImages(data.images || []);
            setSubImages([]);
            setSubImagesPreview([]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alert(t('saveSuccess') || "Saved successfully!");

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

    return (
        <div className="min-h-screen pt-24 pb-10 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
            <Meta title={id ? t('editProduct') : t('createProduct')} />

            {/* Header Section - المتجاوب */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-center sm:text-left">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-3">
                        {id ? <FaMagic className="text-primary" size={24} /> : <FaBoxOpen className="text-primary" size={24} />}
                        {id ? (t('editProduct') || "Edit Product") : (t('createProduct') || "New Product")}
                    </h1>
                    <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 mt-1">
                        {id ? "Refine your product details." : "Add a new item to your shop."}
                    </p>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <button
                        onClick={() => navigate(goBackLink)}
                        className="flex-1 sm:flex-none px-4 md:px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm md:text-base transition-all"
                    >
                        {t('cancel') || "Cancel"}
                    </button>
                    <button
                        onClick={submitHandler}
                        disabled={saveLoading}
                        className="flex-1 sm:flex-none px-6 md:px-8 py-3 rounded-xl font-bold text-white bg-primary shadow-lg text-sm md:text-base transition-all disabled:opacity-50"
                    >
                        {saveLoading ? "..." : t('saveChanges') || "Save"}
                    </button>
                </div>
            </div>

            <form onSubmit={submitHandler} className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                {/* Left Column - الصور */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Main Image */}
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/10">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><FaImage className="text-primary" /> {t('mainImage')}</h3>
                        <div className="relative aspect-square w-full max-w-[300px] mx-auto lg:max-w-none rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <img
                                src={preview || getImageUrl(image)}
                                alt="Main Preview"
                                className="w-full h-full object-contain p-2"
                                onError={(e) => e.target.src = '/images/placeholder.png'}
                            />
                            <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                                <FaCloudUploadAlt className="text-white text-3xl mb-1" />
                                <span className="text-white text-xs font-bold">Change Image</span>
                                <input type="file" onChange={uploadFileHandler} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Gallery - شبكة متجاوبة */}
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/10">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><FaLayerGroup className="text-primary" /> {t('gallery')}</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-2">
                            {oldImages.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                    <img src={getImageUrl(img.image)} alt="Old" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => deleteOldImageHandler(img.id)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary">
                                <FaCloudUploadAlt size={20} />
                                <input type="file" multiple onChange={uploadSubImagesHandler} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column - البيانات */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Admin Status Card */}
                    {isAdmin && (
                        <div className="bg-gray-900 dark:bg-white/5 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-white">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">Admin Status</h2>
                            <div className="flex flex-wrap gap-3">
                                {['approved', 'pending', 'rejected'].map(status => (
                                    <label key={status} className={`flex-1 min-w-[100px] cursor-pointer flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 transition-all text-xs font-bold uppercase ${approvalStatus === status ? 'bg-primary/20 border-primary text-primary' : 'border-white/10 text-gray-400'}`}>
                                        <input type="radio" value={status} checked={approvalStatus === status} onChange={(e) => setApprovalStatus(e.target.value)} className="hidden" />
                                        {status}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/10">
                        <div className="grid gap-5">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('productName')}</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-primary dark:text-white" required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('price')}</label>
                                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 block">{t('discountPrice')}</label>
                                    <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="w-full px-4 py-3 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl outline-none text-red-600" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('description')}</label>
                                <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/10">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('category')}</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white appearance-none" required>
                                    <option value="">Select...</option>
                                    {categoriesList.map((cat) => (
                                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('brand')}</label>
                                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('stock')}</label>
                                <input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" required />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductEditScreen;