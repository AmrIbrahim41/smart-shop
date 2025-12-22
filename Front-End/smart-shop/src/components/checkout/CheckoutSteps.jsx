import React from 'react'
import { Link } from 'react-router-dom'

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  // دالة صغيرة عشان نحدد شكل الرابط (شغال ولا لا)
  const getLinkClass = (isActive) => {
    return isActive 
      ? "text-blue-500 hover:text-blue-700 font-bold border-b-2 border-blue-500 pb-1" // لو الخطوة مفعلة
      : "text-gray-400 cursor-not-allowed" // لو الخطوة لسه مجاتش
  }

  return (
    <div className="flex justify-center items-center mb-8 space-x-4 text-sm md:text-base">
      
      {/* الخطوة 1: تسجيل الدخول */}
      <div className="px-2">
        {step1 ? (
          <Link to='/login' className={getLinkClass(true)}>Login</Link>
        ) : (
          <span className={getLinkClass(false)}>Login</span>
        )}
      </div>

      {/* علامة > بين الخطوات */}
      <div className="text-gray-400">&gt;</div>

      {/* الخطوة 2: الشحن */}
      <div className="px-2">
        {step2 ? (
          <Link to='/shipping' className={getLinkClass(true)}>Shipping</Link>
        ) : (
          <span className={getLinkClass(false)}>Shipping</span>
        )}
      </div>

      <div className="text-gray-400">&gt;</div>

      {/* الخطوة 3: الدفع */}
      <div className="px-2">
        {step3 ? (
          <Link to='/payment' className={getLinkClass(true)}>Payment</Link>
        ) : (
          <span className={getLinkClass(false)}>Payment</span>
        )}
      </div>

      <div className="text-gray-400">&gt;</div>

      {/* الخطوة 4: إتمام الطلب */}
      <div className="px-2">
        {step4 ? (
          <Link to='/placeorder' className={getLinkClass(true)}>Place Order</Link>
        ) : (
          <span className={getLinkClass(false)}>Place Order</span>
        )}
      </div>
    </div>
  )
}

export default CheckoutSteps