from django.urls import path
from . import views

urlpatterns = [
    # 1. الروابط المحددة (Authentication & Profile)
    path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', views.registerUser, name='register'),
    path('profile/update/', views.updateUserProfile, name='user-profile-update'),
    
    # 👇👇 2. روابط استعادة الباسورد والتفعيل (لازم يكونوا هنا في الأول) 👇👇
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('reset-password/<str:uid>/<str:token>/', views.reset_password, name='reset-password'),
    
    # رابط التفعيل (التعديل: ضفنا users/ في الأول)
    path('activate/<str:uid>/<str:token>/', views.activateUser, name='activate'),
    path('seller/orders/', views.getSellerOrders, name='seller-orders'),

    # 3. روابط الأدمن العامة
    path('', views.getUsers, name='users'),

    # 4. الروابط المتغيرة (pk) - لازم تكون في الآاااخر
    path('delete/<str:pk>/', views.deleteUser, name='user-delete'),
    path('update/<str:pk>/', views.updateUser, name='user-update'),
    path('<str:pk>/', views.getUserById, name='user-detail'), # ⚠️ دي المصيدة، لازم تفضل تحت
]