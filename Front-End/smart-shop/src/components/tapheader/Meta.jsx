import React from 'react';
import { Helmet } from 'react-helmet-async';    
const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />
    </Helmet>
  );
};

// 👇 ده الجزء المهم عشان الـ Home يشتغل لما ميكونش فيه بحث
Meta.defaultProps = {
  title: 'Welcome To SmartShop',
  description: 'We sell the best products for cheap',
  keywords: 'electronics, buy electronics, cheap electroincs',
};

export default Meta;