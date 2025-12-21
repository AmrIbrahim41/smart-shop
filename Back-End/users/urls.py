from django.urls import path
from . import views

urlpatterns = [
    # 1. الروابط المحددة (Authentication & Profile)
    path('users/login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/register/', views.registerUser, name='register'),
    path('users/profile/update/', views.updateUserProfile, name='user-profile-update'),
    
    # 👇👇 2. روابط استعادة الباسورد والتفعيل (لازم يكونوا هنا في الأول) 👇👇
    path('users/forgot-password/', views.forgot_password, name='forgot-password'),
    path('users/reset-password/<str:uid>/<str:token>/', views.reset_password, name='reset-password'),
    
    # رابط التفعيل (التعديل: ضفنا users/ في الأول)
    path('users/activate/<str:uid>/<str:token>/', views.activateUser, name='activate'),
    path('users/seller/orders/', views.getSellerOrders, name='seller-orders'),

    # 3. روابط الأدمن العامة
    path('users/', views.getUsers, name='users'),

    # 4. الروابط المتغيرة (pk) - لازم تكون في الآاااخر
    path('users/delete/<str:pk>/', views.deleteUser, name='user-delete'),
    path('users/update/<str:pk>/', views.updateUser, name='user-update'),
    path('users/<str:pk>/', views.getUserById, name='user-detail'), # ⚠️ دي المصيدة، لازم تفضل تحت
]