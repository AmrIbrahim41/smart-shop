import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Paginate = ({ pages, page, keyword = '' }) => {
  // دالة عشان نحافظ على كلمة البحث واحنا بنقلب الصفحات
  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const currentKeyword = query.get('keyword') || '';

  return (
    pages > 1 && (
      <div className="flex justify-center mt-10 gap-2">
        {[...Array(pages).keys()].map((x) => (
          <Link
            key={x + 1}
            to={`/?keyword=${currentKeyword}&page=${x + 1}`}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              x + 1 === page
                ? 'bg-primary text-white shadow-lg transform scale-105' // الصفحة الحالية
                : 'bg-dark-accent text-gray-400 hover:bg-white/10 hover:text-white' // باقي الصفحات
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