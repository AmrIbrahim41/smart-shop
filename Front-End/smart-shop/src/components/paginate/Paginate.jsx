import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Paginate = ({ pages, page, keyword = '', isAdmin = false }) => {
  // دالة لاستخراج متغيرات البحث من الرابط
  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  // التأكد من وجود كلمة البحث سواء من الرابط أو من البروبس
  const currentKeyword = query.get('keyword') || keyword;

  return (
    pages > 1 && (
      <div className="flex justify-center mt-10 gap-2">
        {[...Array(pages).keys()].map((x) => (
          <Link
            key={x + 1}
            // لو أدمن بنوجهه لرابط مختلف (اختياري)، لو مستخدم عادي بنوجهه للرئيسية مع رقم الصفحة
            to={!isAdmin
              ? `/?keyword=${currentKeyword}&page=${x + 1}`
              : `/admin/productlist/${x + 1}`
            }
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center justify-center ${x + 1 === page
                ? 'bg-primary text-white shadow-lg transform scale-105' // الصفحة الحالية
                : 'bg-white dark:bg-dark-accent text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-primary hover:text-white hover:border-primary' // باقي الصفحات
              }`}
          >
            {x + 1}
          </Link>
        ))}
      </div>
    )
  );
};

export default Paginate;