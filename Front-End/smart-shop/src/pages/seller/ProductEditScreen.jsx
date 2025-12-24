import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../../api';
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaTrash, FaTimes, FaBoxOpen, FaMagic, FaTag, FaDollarSign, FaLayerGroup, FaImage, FaCheckCircle, FaExclamationCircle, FaBan, FaPlus, FaClock } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ProductEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
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
    const [category, setCategory] = useState('');
    const [categoriesList, setCategoriesList] = useState([]);
    const [description, setDescription] = useState('');
    const [approvalStatus, setApprovalStatus] = useState('pending');

    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

    // --- Logic Functions ---
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
            console.error("Failed to load data");
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

    const submitHandler = async (e) => {
        if (e) e.preventDefault();
        setSaveLoading(true);

        // 🔥🔥🔥 Validation Logic (التحقق من البيانات) 🔥🔥🔥
        
        // 1. التحقق من الحقول الإجبارية
        if (!name || !price || !category || !description || countInStock === '') {
            alert(t('fillAllFields') || "Please fill all required fields (Name, Price, Category, Description, Stock).");
            setSaveLoading(false);
            return;
        }

        // 2. التحقق من منطقية الأرقام (السعر والكمية لازم يكونوا موجبين)
        if (Number(price) <= 0) {
            alert("Price must be greater than 0.");
            setSaveLoading(false);
            return;
        }
        if (Number(countInStock) < 0) {
            alert("Stock cannot be negative.");
            setSaveLoading(false);
            return;
        }

        // 3. 🔥 التحقق الجوهري: سعر الخصم مقابل السعر الأصلي
        const numPrice = Number(price);
        const numDiscount = Number(discountPrice);

        if (numDiscount > 0) {
            if (numDiscount >= numPrice) {
                alert(t('invalidDiscount') || "Logical Error: Discount price cannot be higher than or equal to the original price!");
                setSaveLoading(false);
                return;
            }
        }

        // --- End Validation ---

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

        if (image instanceof File) {
            formData.append('image', image);
        }

        if (subImages.length > 0) {
            subImages.forEach((file) => formData.append('images', file));
        }

        try {
            if (id) {
                await apiService.updateProduct(id, formData);
                alert(t('saveSuccess') || "Updated successfully!");
            } else {
                await apiService.createProduct(formData);
                alert(t('createSuccess') || "Created successfully!");
            }
            
            navigate(goBackLink);

        } catch (error) {
            alert(error.response?.data?.detail || 'Error saving product');
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-28 flex justify-center text-primary font-bold animate-pulse">
            Loading...
        </div>
    );

    return (
        <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
            <Meta title={id ? t('editProduct') : t('createProduct')} />

            <form onSubmit={submitHandler} className="max-w-7xl mx-auto">
                
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
                    
                    <button type="submit" disabled={saveLoading} className="w-full md:w-auto bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 flex justify-center items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase disabled:bg-gray-400">
                        {saveLoading ? (t('processing') || 'Saving...') : <><FaSave /> {t('saveChanges') || "Save Changes"}</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- Left Column (Main Content: Info + Media) --- */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. General Information */}
                        <div className="bg-white dark:bg-dark-accent p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <FaBoxOpen size={100} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase relative z-10">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg"><FaBoxOpen /></span>
                                {t('basicInfo') || "General Info"}
                            </h2>
                            
                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">{t('productName') || "Product Name"}</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 font-bold text-lg text-gray-900 dark:text-white focus:border-primary outline-none transition-colors shadow-inner" 
                                        placeholder="e.g. Super Bass Headphones" 
                                        required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">{t('description') || "Description"}</label>
                                    <textarea 
                                        rows="6" 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary outline-none transition-colors resize-none shadow-inner leading-relaxed" 
                                        placeholder="Detailed description of the product..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* 2. Media Gallery */}
                        <div className="bg-white dark:bg-dark-accent p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase flex items-center gap-2">
                                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg"><FaImage /></span>
                                {t('media') || "Media & Gallery"}
                            </h2>
                            
                            {/* Main Image Dropzone */}
                            <div className="mb-8">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase ml-1">Main Cover Image</p>
                                <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition relative overflow-hidden group ${preview ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                    {preview ? (
                                        <div className="relative w-full h-full p-4">
                                            <img src={preview} alt="Preview" className="w-full h-full object-contain drop-shadow-md" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white font-bold flex items-center gap-2"><FaCloudUploadAlt /> Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                                            <div className="bg-gray-100 dark:bg-white/10 p-4 rounded-full mb-3 text-primary">
                                                <FaCloudUploadAlt className="text-3xl" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Click to upload main image</p>
                                            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" onChange={uploadFileHandler} />
                                </label>
                            </div>

                            {/* Gallery Grid */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase ml-1">Additional Images</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {oldImages.map(img => (
                                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 group bg-gray-50 dark:bg-dark shadow-sm">
                                            <img src={getImageUrl(img.image)} alt="sub" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <button type="button" onClick={() => deleteOldImageHandler(img.id)} className="absolute top-1 right-1 bg-white dark:bg-gray-800 text-red-500 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><FaTrash size={12}/></button>
                                        </div>
                                    ))}
                                    {subImagesPreview.map((src, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-primary/50 group bg-gray-50 dark:bg-dark shadow-sm">
                                            <img src={src} alt="new-sub" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">New</div>
                                            <button type="button" onClick={() => removeSubImage(idx)} className="absolute top-1 right-1 bg-white dark:bg-gray-800 text-red-500 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><FaTimes size={12}/></button>
                                        </div>
                                    ))}
                                    
                                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary hover:text-primary text-gray-400 transition bg-gray-50 dark:bg-transparent hover:bg-primary/5">
                                        <FaPlus size={20} />
                                        <span className="text-[10px] font-bold mt-1 uppercase">Add</span>
                                        <input type="file" multiple className="hidden" onChange={uploadSubImagesHandler} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column (Settings: Status, Pricing, Org) --- */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {isAdmin && (
                            <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase flex items-center gap-2">
                                    <span className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 p-2 rounded-lg"><FaMagic /></span>
                                    {t('status') || "Product Status"}
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {['approved', 'pending', 'rejected'].map(status => (
                                        <label key={status} className={`relative flex items-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${approvalStatus === status ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-gray-50 dark:bg-dark border-gray-100 dark:border-white/5 text-gray-500'}`}>
                                            <input type="radio" name="status" value={status} checked={approvalStatus === status} onChange={(e) => setApprovalStatus(e.target.value)} className="hidden" />
                                            <div className="flex items-center gap-2 w-full">
                                                {status === 'approved' && <FaCheckCircle />}
                                                {status === 'pending' && <FaClock />}
                                                {status === 'rejected' && <FaBan />}
                                                <span className="font-bold uppercase text-xs">{status}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase">
                                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-lg"><FaLayerGroup /></span>
                                {t('organization') || "Organization"}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">{t('category')}</label>
                                    <div className="relative">
                                        <select 
                                            value={category} 
                                            onChange={(e) => setCategory(e.target.value)} 
                                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 font-bold text-gray-900 dark:text-white focus:border-primary outline-none transition-colors cursor-pointer appearance-none"
                                            required
                                        >
                                            <option value="" className="dark:bg-dark">Select Category...</option>
                                            {categoriesList && categoriesList.map(cat => (
                                                <option key={cat.id} value={String(cat.id)} className="dark:bg-dark">{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><FaLayerGroup size={12}/></div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">{t('brand')}</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={brand} 
                                            onChange={(e) => setBrand(e.target.value)} 
                                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 pl-9 font-bold text-gray-900 dark:text-white focus:border-primary outline-none transition-colors" 
                                            placeholder="e.g. Sony" 
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><FaTag size={12}/></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase">
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg"><FaDollarSign /></span>
                                {t('pricing') || "Pricing & Stock"}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">{t('price')}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input 
                                            type="number" 
                                            value={price} 
                                            onChange={(e) => setPrice(e.target.value)} 
                                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 pl-8 font-bold text-gray-900 dark:text-white focus:border-primary outline-none transition-colors" 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">{t('discountPrice')} <span className="text-[9px] opacity-50">(Optional)</span></label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input 
                                            type="number" 
                                            value={discountPrice} 
                                            onChange={(e) => setDiscountPrice(e.target.value)} 
                                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 pl-8 font-bold text-gray-900 dark:text-white focus:border-primary outline-none transition-colors" 
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">{t('stock')}</label>
                                    <input 
                                        type="number" 
                                        value={countInStock} 
                                        onChange={(e) => setCountInStock(e.target.value)} 
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 font-bold text-gray-900 dark:text-white focus:border-primary outline-none transition-colors" 
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