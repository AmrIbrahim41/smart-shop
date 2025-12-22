import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';

const SearchBox = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  // استخراج دالة الترجمة
  const { t } = useSettings();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword}&page=1`);
    } else {
      navigate('/');
    }
  };

  return (
    <form onSubmit={submitHandler} className="relative flex items-center w-full">
      <input
        type="text"
        name="q"
        onChange={(e) => setKeyword(e.target.value)}
        // استخدام الترجمة هنا
        placeholder={t('searchPlaceholder') || "Search products..."}
        className="w-full bg-white/10 hover:bg-white/20 border border-transparent focus:border-primary/50 text-white text-sm rounded-full py-2 pl-4 pr-10 outline-none transition duration-300 placeholder-gray-400 backdrop-blur-sm"
      />
      <button type="submit" className="absolute right-3 text-gray-400 hover:text-primary transition">
        <FaSearch />
      </button>
    </form>
  );
};

export default SearchBox;