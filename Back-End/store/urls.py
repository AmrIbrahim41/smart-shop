from django.urls import path
from . import views

urlpatterns = [
    # -------------------------
    # 1.products 
    # -------------------------
    path("products/", views.getProducts, name="products"),
    path('products/top/', views.getTopProducts, name='top-products'),
    path("products/<str:pk>/", views.getProduct, name="product-detail"),
    path('products/<str:pk>/reviews/create/', views.createProductReview, name='create-review'),
    path('products/<str:pk>/reviews/update/', views.updateProductReview, name='update-review'),
    

    # -------------------------
    # 2.products for vendors
    # -------------------------
    path("my_products/", views.getMyProducts, name="my-products"),
    path("create/", views.createProduct, name="product-create"),
    path("products/update/<str:pk>/", views.updateProduct, name="product-update"),
    path("delete/<str:pk>/", views.deleteProduct, name="product-delete"),
    path('categories/', views.getCategories, name='categories'),
    path('products/delete-image/<str:pk>/', views.deleteProductImage, name='delete-product-image'),

    # -------------------------
    # 3.(admin)
    # -------------------------
    path('orders/add/', views.addOrderItems, name='orders-add'), 
    path('orders/', views.getOrders, name='orders'),            
    
    # order details, pay, deliver
    path('orders/myorders/', views.getMyOrders, name='myorders'),
    path('orders/<str:pk>/', views.getOrderById, name='user-order'),
    path('orders/<str:pk>/pay/', views.updateOrderToPaid, name='pay'),
    path('orders/<str:pk>/deliver/', views.updateOrderToDelivered, name='order-delivered'),
    path('orders/delete/<str:pk>/', views.deleteOrder, name='delete-order'),
    
    
    # -------------------------
    # 4. Cart & Wishlist
    # -------------------------
    path('cart/', views.getCart, name='cart-get'),
    path('cart/add/', views.addToCart, name='cart-add'),
    path('cart/remove/<str:pk>/', views.removeFromCart, name='cart-remove'), # pk is product id
    path('cart/clear/', views.clearCart, name='cart-clear'),

    # Wishlist URLs
    path('wishlist/', views.getWishlist, name='wishlist-get'),
    path('wishlist/toggle/', views.toggleWishlist, name='wishlist-toggle'),
    
]