from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (UserSerializer, RegisterSerializer, UserSerializerWithToken, MyTokenObtainPairSerializer)
from rest_framework.parsers import MultiPartParser, FormParser # 👈 عشان رفع الصور
from store.models import Order, OrderItem 
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

# استخدام السيرياليزر المخصص للتوكن
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# 👇👇 1. تعديل دالة التسجيل (تفعيل عبر الإيميل) 👇👇
@api_view(['POST'])
def registerUser(request):
    data = request.data
    try:
        if User.objects.filter(email=data['email']).exists():
            return Response({'detail': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # إنشاء المستخدم الأساسي
        user = User.objects.create(
            first_name=data['name'],
            username=data['email'],
            email=data['email'],
            password=make_password(data['password']),
            is_active=False 
        )

        # 👇👇 تحديث بيانات البروفايل (الهاتف والنوع) 👇👇
        # (Profile بيتم إنشاؤه تلقائياً بسبب Signals، احنا بس هنعدله)
        user.profile.phone = data.get('phone', '')
        user.profile.type = data.get('type', 'customer') # customer or vendor
        user.profile.save()

        # ... (باقي كود إرسال الإيميل زي ما هو بالظبط) ...
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        activation_link = f"http://localhost:5173/activate/{uid}/{token}/"
        message = f"Hi {user.first_name},\n\nPlease click the link below to activate your account:\n{activation_link}\n\nThanks,\nSmartShop Team"
        
        send_mail(
            'Activate your Account',
            message,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )

        return Response({'details': 'Account created! Please check your email to activate it.'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        message = {'detail': 'User with this email already exists or invalid data'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)
    

# 👇👇 2. دالة التفعيل الجديدة 👇👇
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([]) # إلغاء فحص التوكن لأن اليوزر لسه مسجلش دخول
def activateUser(request, uid, token):
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'details': 'Account activated successfully! You can login now.'})
        else:
            return Response({'detail': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'detail': 'Invalid token or user ID'}, status=status.HTTP_400_BAD_REQUEST)


# 3. دالة جلب بروفايل المستخدم (كانت ناقصة في الكود اللي بعته، ضفتها للأمان)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    serializer = UserSerializerWithToken(user, many=False)
    data = request.data

    # تحديث بيانات User الأساسية
    user.first_name = data.get('name', user.first_name)
    if data.get('password') != '':
        user.password = make_password(data.get('password'))
    user.save()

    # 👇👇 تحديث بيانات Profile (تأكد إن السطور دي موجودة) 👇👇
    profile = user.profile
    profile.phone = data.get('phone', profile.phone)
    profile.city = data.get('city', profile.city)       # ✅ المدينة
    profile.country = data.get('country', profile.country) # ✅ البلد/العنوان
    
    # ✅ تاريخ الميلاد (نتأكد إنه مش فاضي قبل الحفظ)
    if data.get('birthdate'):
        profile.birthdate = data['birthdate']

    if request.FILES.get('profilePicture'):
        profile.profilePicture = request.FILES['profilePicture']
    
    profile.save()

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


# 1. دالة حذف مستخدم (Delete User)
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteUser(request, pk):
    try:
        user = User.objects.get(id=pk)
        user.delete()
        return Response('User was deleted')
    except User.DoesNotExist:
        return Response({'detail': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

# 2. دالة جلب بيانات مستخدم معين للتعديل (Get User By ID)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUserById(request, pk):
    try:
        user = User.objects.get(id=pk)
        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'detail': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

# 3. دالة تعديل بيانات مستخدم بواسطة الأدمن (Update User)
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateUser(request, pk):
    try:
        user = User.objects.get(id=pk)
        data = request.data

        user.first_name = data.get('name', user.first_name)
        user.username = data.get('email', user.username) # بنخلي الايميل هو اليوزرنيم
        user.email = data.get('email', user.email)
        user.is_staff = data.get('isAdmin', user.is_staff)

        user.save()

        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)
    
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    
# 4. دالة طلب تغيير الباسورد (إرسال الإيميل)
@api_view(['POST'])
@authentication_classes([]) 
@permission_classes([AllowAny]) 
def forgot_password(request):
    data = request.data
    email = data.get('email', '')

    try:
        user = User.objects.get(email=email)
        
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"
        
        message = f"Hello {user.first_name},\n\nClick the link below to reset your password:\n{reset_link}\n\nIf you didn't request this, ignore this email."
        
        send_mail(
            'Password Reset Request',
            message,
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        
        return Response({'details': 'Email sent successfully! Check your inbox (or console).'})

    except User.DoesNotExist:
        return Response({'details': 'Email sent successfully! Check your inbox.'})

# 5. دالة تأكيد الباسورد الجديد
@api_view(['POST'])
@authentication_classes([]) 
@permission_classes([AllowAny]) 
def reset_password(request, uid, token):
    data = request.data
    new_password = data.get('password')
    confirm_password = data.get('confirmPassword')

    if new_password != confirm_password:
        return Response({'detail': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)

        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'details': 'Password reset successful! You can login now.'})
        else:
            return Response({'detail': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'detail': 'Something went wrong'}, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    
# تأكد إنك مستدعي OrderItem فوق
from store.models import Order, OrderItem

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getSellerOrders(request):
    user = request.user
    if user.profile.type == 'vendor':
        items = OrderItem.objects.filter(product__user=user).order_by('-id')
        
        custom_orders = []
        for item in items:
            custom_orders.append({
                '_id': item.id,
                'order_id': item.order.id, # 👈 التعديل هنا: استخدمنا id بدل _id
                'name': item.name,
                'qty': item.qty,
                'price': item.price,
                'totalPrice': item.price * item.qty,
                'createdAt': item.order.createdAt,
                'isPaid': item.order.isPaid,
                'isDelivered': item.order.isDelivered
            })
            
        return Response(custom_orders)
    else:
        return Response({'detail': 'Not authorized as a vendor'}, status=status.HTTP_401_UNAUTHORIZED)