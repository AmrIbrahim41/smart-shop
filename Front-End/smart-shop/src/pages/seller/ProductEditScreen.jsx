import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../../api';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';
import {
    FaArrowLeft, FaSave, FaCloudUploadAlt, FaTrash, FaTimes, FaBoxOpen,
    FaMagic, FaTag, FaDollarSign, FaLayerGroup, FaImage, FaCheckCircle,
    FaClock, FaBan, FaPlus, FaTags
} from 'react-icons/fa';

const ProductEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    const isAdmin = userInfo?.isAdmin;
    const goBackLink = isAdmin ? "/admin/productlist" : "/seller/products";

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

    // Category should be initialized as empty string
    const [category, setCategory] = useState('');
    const [categoriesList, setCategoriesList] = useState([]);

    const [description, setDescription] = useState('');
    const [approvalStatus, setApprovalStatus] = useState('pending');

    // Tags State
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const [loading, setLoading] = useState(!!id); // Load only if ID exists
    const [saveLoading, setSaveLoading] = useState(false);

    // --- Logic Functions ---
    const fetchData = async () => {
        try {
            // 1. جلب الأقسام
            const { data: categories } = await apiService.getCategories();
            setCategoriesList(categories);

            // 2. إذا كنا في وضع التعديل، جلب بيانات المنتج
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

                // التعامل الآمن مع القسم
                const catId = data.category?.id || data.category || '';
                setCategory(String(catId));

                setDescription(data.description);
                setApprovalStatus(data.approval_status);

                // التعامل الآمن مع التاجز
                if (Array.isArray(data.tags)) {
                    setTags(data.tags);
                } else {
                    setTags([]);
                }
            }
        } catch (err) {
            console.error("Failed to load data", err);
            // اختياري: إظهار رسالة خطأ
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
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
        if (files.length > 5) { // UX: منع اختيار عدد كبير جداً مرة واحدة
            alert("You can only upload up to 5 images at a time.");
            return;
        }
        if (files.length > 0) {
            setSubImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setSubImagesPreview(prev => [...prev, ...newPreviews]);
        }
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

    // --- Tag Functions ---
    const handleAddTag = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // منع إرسال الفورم عند الضغط على Enter
            const val = tagInput.trim();
            if (val && !tags.includes(val)) {
                setTags(prevTags => [...prevTags, val]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(prevTags => prevTags.filter(t => t !== tagToRemove));
    };

    // --- Submit Handler (The Critical Part) ---
    const submitHandler = async (e) => {
        if (e) e.preventDefault();
        setSaveLoading(true);

        // Validation Check
        if (!name || Number(price) <= 0 || !category || !description) {
            alert(t('fillAllFields') || "Please fill all required fields correctly.");
            setSaveLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('discount_price', discountPrice);
        formData.append('brand', brand);
        formData.append('countInStock', countInStock);
        formData.append('description', description);
        formData.append('category', category);

        // ✅ إرسال التاجز بشكل صحيح كـ JSON String
        formData.append('tags', JSON.stringify(tags));

        if (isAdmin) {
            formData.append('approval_status', approvalStatus);
        }

        // إرسال الصورة فقط إذا كانت ملفاً جديداً (وليست رابط نصي قديم)
        if (image instanceof File) {
            formData.append('image', image);
        }

        // الصور الفرعية
        if (subImages.length > 0) {
            subImages.forEach((file) => formData.append('images', file));
        }

        try {
            if (id) {
                // Update Existing Product
                await apiService.updateProduct(id, formData);
                alert(t('saveSuccess') || "Updated successfully!");
            } else {
                // Create New Product
                await apiService.createProduct(formData);
                alert(t('createSuccess') || "Created successfully!");
            }
            navigate(goBackLink);
        } catch (error) {
            console.error("Save Error:", error);
            const msg = error.response?.data?.detail || 'Error saving product';
            alert(msg);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-28 flex justify-center text-primary font-bold animate-pulse">
            Loading Data...
        </div>
    );

    return (
        <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
            <Meta title={id ? (t('editProduct') || "Edit Product") : (t('createProduct') || "Create Product")} />

            <form onSubmit={submitHandler} className="max-w-7xl mx-auto" encType="multipart/form-data">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-24 z-30 bg-gray-50/90 dark:bg-dark/90 backdrop-blur-md py-4 rounded-2xl md:px-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button type="button" onClick={() => navigate(goBackLink)} className="group flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:text-primary transition">
                            <span className="bg-white dark:bg-white/10 p-2 rounded-full group-hover:shadow-md transition"><FaArrowLeft /></span>
                            {t('back') || "Back"}
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {id ? (t('editProduct') || "Edit Product") : (t('createProduct') || "New Product")}
                        </h1>
                    </div>

                    <button type="submit" disabled={saveLoading} className="w-full md:w-auto bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 flex justify-center items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {saveLoading ? (t('processing') || 'Saving...') : <><FaSave /> {t('saveChanges') || "Save Changes"}</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. General Info */}
                        <div className="bg-white dark:bg-dark-accent p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase relative z-10">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg"><FaBoxOpen /></span>
                                {t('basicInfo') || "General Info"}
                            </h2>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 block mb-2">{t('productName') || "Name"}</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 font-bold text-lg text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
                                        placeholder="Product Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 block mb-2">{t('description')}</label>
                                    <textarea
                                        rows="6"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary outline-none transition-colors resize-none"
                                        placeholder="Description..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tags Section (Fixed Design) */}
                        <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase">
                                <span className="bg-pink-100 text-pink-600 p-2 rounded-lg"><FaTags /></span>
                                Tags
                            </h2>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        className="flex-1 bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 font-bold text-gray-900 dark:text-white focus:border-primary outline-none"
                                        placeholder="Type tag & press Enter..."
                                    />
                                    {/* زر إضافة يدوي للمستخدمين الذين لا يستخدمون الكيبورد */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                                setTags([...tags, tagInput.trim()]);
                                                setTagInput('');
                                            }
                                        }}
                                        className="bg-primary text-white px-4 rounded-xl font-bold hover:bg-orange-600 transition"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 dark:bg-dark/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                    {tags.map((tag, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-white dark:bg-dark-accent text-primary px-3 py-1 rounded-lg border border-primary/20 shadow-sm animate-fadeIn">
                                            <span className="text-sm font-bold">#{tag}</span>
                                            <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {tags.length === 0 && <span className="text-gray-400 text-sm italic m-auto">No tags added yet.</span>}
                                </div>
                            </div>
                        </div>

                        {/* 3. Media Section */}
                        <div className="bg-white dark:bg-dark-accent p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase flex items-center gap-2">
                                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg"><FaImage /></span>
                                {t('media') || "Media"}
                            </h2>

                            {/* Main Image */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Main Image</label>
                                <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition relative overflow-hidden group ${preview ? 'border-primary' : 'border-gray-300 dark:border-gray-600 hover:border-primary'}`}>
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <FaCloudUploadAlt className="text-4xl mb-2" />
                                            <span className="text-sm font-bold">Click to Upload</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" onChange={uploadFileHandler} accept="image/*" />
                                </label>
                            </div>

                            
                            {/* Sub Images - Gallery */}
                            <div className="mt-6">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex justify-between">
                                    Gallery Images
                                    <span className="text-primary text-[10px] normal-case">Supported: JPG, PNG</span>
                                </label>

                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {/* الصور القديمة */}
                                    {oldImages.map(img => (
                                        <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition">
                                            <img src={getImageUrl(img.image)} alt="gallery" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button type="button" onClick={() => deleteOldImageHandler(img.id)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transform hover:scale-110 transition">
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* الصور الجديدة (Preview) */}
                                    {subImagesPreview.map((src, idx) => (
                                        <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-primary/40 shadow-sm">
                                            <img src={src} alt="new" className="w-full h-full object-cover" />
                                            <span className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1 rounded">New</span>
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button type="button" onClick={() => removeSubImage(idx)} className="bg-white text-red-500 p-1.5 rounded-full hover:bg-gray-100 shadow-lg transform hover:scale-110 transition">
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* زر الإضافة */}
                                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 text-gray-400 hover:text-primary transition-all duration-300 group">
                                        <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-full mb-2 group-hover:scale-110 transition">
                                            <FaPlus size={18} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wide">Add Image</span>
                                        <input type="file" multiple className="hidden" onChange={uploadSubImagesHandler} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status (Admin Only) */}
                        {isAdmin && (
                            <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
                                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase flex items-center gap-2">
                                    <span className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg"><FaMagic /></span> Status
                                </h2>
                                <div className="space-y-2">
                                    {['approved', 'pending', 'rejected'].map(st => (
                                        <label key={st} className={`flex items-center p-3 rounded-xl border cursor-pointer transition ${approvalStatus === st ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-gray-50 dark:bg-dark'}`}>
                                            <input type="radio" name="status" value={st} checked={approvalStatus === st} onChange={(e) => setApprovalStatus(e.target.value)} className="hidden" />
                                            <span className="font-bold uppercase text-xs ml-2">{st}</span>
                                            {approvalStatus === st && <FaCheckCircle className="ml-auto" />}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Organization */}
                        <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase flex items-center gap-2">
                                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 p-2 rounded-lg"><FaLayerGroup /></span> Org
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">{t('category')}</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 font-bold text-gray-900 dark:text-white outline-none"
                                        required
                                    >
                                        <option value="">Select...</option>
                                        {categoriesList.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">{t('brand')}</label>
                                    <input
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 font-bold text-gray-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase flex items-center gap-2">
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 p-2 rounded-lg"><FaDollarSign /></span> Pricing
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">{t('price')}</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 font-bold text-gray-900 dark:text-white outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Stock</label>
                                    <input
                                        type="number"
                                        value={countInStock}
                                        onChange={(e) => setCountInStock(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 font-bold text-gray-900 dark:text-white outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductEditScreen;