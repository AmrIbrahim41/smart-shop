from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer 
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

# 👇 تأكد إن الاستدعاءات دي صحيحة حسب أسماء التطبيقات عندك
from .models import Profile 
from store.models import Order, OrderItem, ShippingAddress 

# -------------------------
# 1. Profile Serializer
# -------------------------
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['type', 'phone', 'birthdate', 'city', 'country', 'profilePicture']

# -------------------------
# 2. User Serializer (الأساسي)
# -------------------------
class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)
    name = serializers.SerializerMethodField(read_only=True)
    _id = serializers.SerializerMethodField(read_only=True) # ضفنا دي عشان الفرونت بيستخدمها أحياناً

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'first_name', 'last_name', 'name', 'isAdmin', 'profile']

    def get__id(self, obj):
        return obj.id

    def get_isAdmin(self, obj):
        return obj.is_staff
    
    def get_name(self, obj):
        first = obj.first_name
        last = obj.last_name
        name = f"{first} {last}".strip()
        if name == '':
            name = obj.email
        return name

    def get_profile(self, obj):
        try:
            serializer = ProfileSerializer(obj.profile, many=False)
            return serializer.data
        except:
            return None

# -------------------------
# 3. User Serializer With Token (مهم للـ Login و Register)
# -------------------------
# فصلنا التوكن في كلاس لوحده عشان ميرجعش مع كل عملية جلب للمستخدمين
class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = UserSerializer.Meta.fields + ['token']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)

# -------------------------
# 4. Register Serializer
# -------------------------
class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(write_only=True, required=False)
    type = serializers.ChoiceField(choices=[('customer', 'Customer'), ('vendor', 'Vendor')], write_only=True, required=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'confirm_password', 'phone', 'type']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if User.objects.filter(email=attrs['email']).exists():
             raise serializers.ValidationError({"email": "Email already exists"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        phone = validated_data.pop('phone', None)
        account_type = validated_data.pop('type', 'customer')

        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # إنشاء البروفايل
        if not hasattr(user, 'profile'):
            Profile.objects.create(user=user)
        
        user.profile.phone = phone
        user.profile.type = account_type
        user.profile.save()
        
        return user

# -------------------------
# 5. Login Token Serializer (المعدل والمضبوط)
# -------------------------
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # 1. التحقق من البيانات الأساسية
        data = super().validate(attrs)
        
        # 2. حماية إضافية: لو اليوزر معندوش بروفايل، انشئه
        if not hasattr(self.user, 'profile'):
            Profile.objects.create(user=self.user)

        # 3. دمج بيانات اليوزر الكاملة (شاملة التوكن والاسم) مع الرد
        # هنا استخدمنا UserSerializerWithToken عشان نضمن وجود التوكن والاسم
        serializer = UserSerializerWithToken(self.user).data
        
        for k, v in serializer.items():
            data[k] = v
            
        return data

# -------------------------
# 6. Order Serializers (كما هي)
# -------------------------
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = '__all__'

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