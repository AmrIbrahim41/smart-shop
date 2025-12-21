import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text, color = '#f8e825' }) => {
  return (
    <div className="flex items-center gap-1 mb-2">
      {[1, 2, 3, 4, 5].map((rate) => (
        <span key={rate} style={{ color }}>
          {value >= rate ? (
            <FaStar />
          ) : value >= rate - 0.5 ? (
            <FaStarHalfAlt />
          ) : (
            <FaRegStar />
          )}
        </span>
      ))}
      {text && <span className="text-sm text-gray-400 ml-2">{text}</span>}
    </div>
  );
};

export default Rating;