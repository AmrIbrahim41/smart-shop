from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

# ---------------------------------------------------------
# 0. Categories
# ---------------------------------------------------------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# ---------------------------------------------------------
# 1. User Serializer 
# ---------------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    _id = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin']
    
    def get__id(self, obj):
        return obj.id

    def get_isAdmin(self, obj):
        return obj.is_staff

    def get_name(self, obj):
        name = obj.first_name
        if name == '':
            name = obj.email
        return name

# ---------------------------------------------------------
# 2. Reviews
# ---------------------------------------------------------
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'rating', 'comment', 'createdAt']
    
    def get_user_name(self, obj):
        return obj.user.first_name if obj.user else "Anonymous"

# ---------------------------------------------------------
# 3. Product Images (الصور الفرعية)
# ---------------------------------------------------------
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

# ---------------------------------------------------------
# 4. Products (المنتجات)
# ---------------------------------------------------------
class ProductSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    # 👇 هنا ربطنا الصور الفرعية بالمنتج (related_name='images' في الموديل)
    images = ProductImageSerializer(many=True, read_only=True) 
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

# ---------------------------------------------------------
# 5. Order Items
# ---------------------------------------------------------
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

# ---------------------------------------------------------
# 6. Shipping Address
# ---------------------------------------------------------
class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = '__all__'

# ---------------------------------------------------------
# 7. Orders
# ---------------------------------------------------------
class OrderSerializer(serializers.ModelSerializer):
    orderItems = serializers.SerializerMethodField(read_only=True)
    shippingAddress = serializers.SerializerMethodField(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_orderItems(self, obj):
        items = obj.items.all() 
        serializer = OrderItemSerializer(items, many=True)
        return serializer.data

    def get_shippingAddress(self, obj):
        try:
            address = ShippingAddressSerializer(obj.shippingaddress, many=False).data
        except:
            address = False
        return address

# ---------------------------------------------------------
# 8. Cart Items (عناصر السلة من الداتابيز)
# ---------------------------------------------------------
class CartItemSerializer(serializers.ModelSerializer):
    # بنرجع تفاصيل المنتج كاملة عشان الفرونت يعرض الصورة والاسم
    product_details = ProductSerializer(source='product', read_only=True) 
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_details', 'qty']

# ---------------------------------------------------------
# 9. Wishlist Items (عناصر المفضلة من الداتابيز)
# ---------------------------------------------------------
class WishlistItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_details']