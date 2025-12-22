from django.urls import path
from . import views

urlpatterns = [
    # -------------------------
    # 1. Products (الروابط العامة)
    # -------------------------
    path("products/", views.getProducts, name="products"),
    path('products/top/', views.getTopProducts, name='top-products'),
    
    # -------------------------
    # 1.1. Product Creation & User's Products
    # -------------------------
    path("products/create/", views.createProduct, name="product-create"),
    path("products/myproducts/", views.getMyProducts, name="my-products"),
    
    # -------------------------
    # 2. Product Details (لازم يكون في الآخر عشان الـ ID)
    # -------------------------
    path("products/<str:pk>/", views.getProduct, name="product-detail"),
    path('products/<str:pk>/reviews/create/', views.createProductReview, name='create-review'),
    path('products/<str:pk>/reviews/update/', views.updateProductReview, name='update-review'),
    
    # -------------------------
    # 3. Product Operations (Update & Delete)
    # -------------------------
    path("products/update/<str:pk>/", views.updateProduct, name="product-update"),
    path("products/delete/<str:pk>/", views.deleteProduct, name="product-delete"),
    path('products/delete-image/<str:pk>/', views.deleteProductImage, name='delete-product-image'),

    # -------------------------
    # 4. Categories & Others
    # -------------------------
    path('categories/', views.getCategories, name='categories'),

    # -------------------------
    # 5. Admin & Orders
    # -------------------------
    path('orders/add/', views.addOrderItems, name='orders-add'), 
    path('orders/', views.getOrders, name='orders'),            
    path('orders/myorders/', views.getMyOrders, name='myorders'),
    path('orders/<str:pk>/', views.getOrderById, name='user-order'),
    path('orders/<str:pk>/pay/', views.updateOrderToPaid, name='pay'),
    path('orders/<str:pk>/deliver/', views.updateOrderToDelivered, name='order-delivered'),
    path('orders/delete/<str:pk>/', views.deleteOrder, name='delete-order'),
    
    # -------------------------
    # 6. Cart & Wishlist
    # -------------------------
    path('cart/', views.getCart, name='cart-get'),
    path('cart/add/', views.addToCart, name='cart-add'),
    path('cart/remove/<str:pk>/', views.removeFromCart, name='cart-remove'),
    path('cart/clear/', views.clearCart, name='cart-clear'),

    path('wishlist/', views.getWishlist, name='wishlist-get'),
    path('wishlist/toggle/', views.toggleWishlist, name='wishlist-toggle'),
]