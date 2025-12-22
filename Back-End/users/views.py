from django.shortcuts import render
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UserSerializerWithToken,
    MyTokenObtainPairSerializer,
)
from rest_framework.parsers import MultiPartParser, FormParser  # 👈 عشان رفع الصور
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


@api_view(['POST'])
def registerUser(request):
    data = request.data
    try:
        # 1. التأكد أن الإيميل غير مستخدم مسبقاً
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'detail': 'هذا البريد الإلكتروني مسجل بالفعل'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. إنشاء المستخدم وجعل الـ username هو الـ email
        user = User.objects.create(
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            username=data['email'],  # 👈 هنا السر: اليوزرنيم = الإيميل
            email=data['email'],
            password=make_password(data['password']),
            is_active=False, # الحساب غير نشط حتى يتم تفعيل الإيميل
        )

        # 3. تحديث بيانات البروفايل الإضافية (موبايل، نوع الحساب)
        # ملاحظة: بروفايل اليوزر يتم إنشاؤه تلقائياً عبر الـ signals في models.py
        profile = user.profile
        profile.phone = data.get('phone', '')
        profile.type = data.get('type', 'customer')
        profile.save()

        # 4. كود إرسال إيميل التفعيل (كما هو في ملفك)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # رابط التفعيل (تأكد من وضع رابط نتفلاي الصحيح هنا)
        activation_link = f"https://smart-shop00.netlify.app/activate/{uid}/{token}/"
        
        subject = 'تفعيل حسابك - Smart Shop'
        message = f'أهلاً بك، يرجى الضغط على الرابط التالي لتفعيل حسابك: \n {activation_link}'
        
        send_mail(subject, message, settings.EMAIL_HOST_USER, [data['email']])

        return Response(
            {'details': "account created successfully, please check your email to activate your account."},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        print(f"Error: {str(e)}") # عشان يظهرلك الخطأ في terminal السيرفر
        return Response({'detail': 'account creation failed'}, status=status.HTTP_400_BAD_REQUEST)


# 3. دالة جلب بروفايل المستخدم (كانت ناقصة في الكود اللي بعته، ضفتها للأمان)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    serializer = UserSerializerWithToken(user, many=False)
    data = request.data

    # 👇 التعديل الجوهري: استقبال الاسم الأول والأخير منفصلين
    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)

    # تحديث الباسورد لو موجود
    if data.get("password") != "":
        user.password = make_password(data.get("password"))

    user.save()

    # تحديث بيانات البروفايل الإضافية
    profile = user.profile
    profile.phone = data.get("phone", profile.phone)
    profile.city = data.get("city", profile.city)
    profile.country = data.get("country", profile.country)

    if data.get("birthdate"):
        profile.birthdate = data["birthdate"]

    if request.FILES.get("profilePicture"):
        profile.profilePicture = request.FILES["profilePicture"]

    profile.save()

    # بنرجع السيرياليزر الجديد عشان الفرونت إند يحدث البيانات عنده
    return Response(UserSerializerWithToken(user, many=False).data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


# 1. دالة حذف مستخدم (Delete User)
@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def deleteUser(request, pk):
    try:
        user = User.objects.get(id=pk)
        user.delete()
        return Response("User was deleted")
    except User.DoesNotExist:
        return Response(
            {"detail": "User does not exist"}, status=status.HTTP_404_NOT_FOUND
        )


# 2. دالة جلب بيانات مستخدم معين للتعديل (Get User By ID)
@api_view(["GET"])
@permission_classes([IsAdminUser])
def getUserById(request, pk):
    try:
        user = User.objects.get(id=pk)
        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response(
            {"detail": "User does not exist"}, status=status.HTTP_404_NOT_FOUND
        )


# 3. دالة تعديل بيانات مستخدم بواسطة الأدمن (Update User)
@api_view(["PUT"])
@permission_classes([IsAdminUser])
def updateUser(request, pk):
    try:
        user = User.objects.get(id=pk)
        data = request.data

        user.first_name = data.get("name", user.first_name)
        user.username = data.get("email", user.username)  # بنخلي الايميل هو اليوزرنيم
        user.email = data.get("email", user.email)
        user.is_staff = data.get("isAdmin", user.is_staff)

        user.save()

        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)

    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# 4. دالة طلب تغيير الباسورد (إرسال الإيميل)
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def forgot_password(request):
    data = request.data
    email = data.get("email", "")

    try:
        # البحث عن المستخدم عن طريق الإيميل
        user = User.objects.get(email=email)

        # توليد الرموز الأمنية (Token & UID) لمرة واحدة
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # 👈 التعديل الجوهري هنا: استبدل الرابط برابط موقعك على Netlify
        # مثال: https://smart-shop00.netlify.app
        domain = "https://smart-shop00.netlify.app" 
        reset_link = f"{domain}/reset-password/{uid}/{token}/"

        # محتوى رسالة البريد الإلكتروني
        subject = "Password Reset Request - Smart Shop"
        message = f"Hello {user.first_name},\n\nYou requested to reset your password. Click the link below to set a new one:\n\n{reset_link}\n\nThis link will expire soon. If you didn't request this, please ignore this email."

        # إرسال الإيميل باستخدام إعدادات SMTP الخاصة بك
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )

        return Response(
            {"details": "Reset link sent! Please check your email inbox."}
        )

    except User.DoesNotExist:
        # أمنياً: نرجع رسالة نجاح حتى لو الإيميل مش موجود عشان محدش يعرف الإيميلات المسجلة
        return Response({"details": "If this email exists, a reset link has been sent."})
    
    except Exception as e:
        return Response({"detail": f"Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# 5. دالة تأكيد الباسورد الجديد
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def reset_password(request, uid, token):
    data = request.data
    new_password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if new_password != confirm_password:
        return Response(
            {"detail": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)

        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response(
                {"details": "Password reset successful! You can login now."}
            )
        else:
            return Response(
                {"detail": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Exception as e:
        return Response(
            {"detail": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST
        )


# تأكد إنك مستدعي OrderItem فوق
from store.models import Order, OrderItem


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getSellerOrders(request):
    user = request.user
    if user.profile.type == "vendor":
        items = OrderItem.objects.filter(product__user=user).order_by("-id")

        custom_orders = []
        for item in items:
            custom_orders.append(
                {
                    "_id": item.id,
                    "order_id": item.order.id,  # 👈 التعديل هنا: استخدمنا id بدل _id
                    "name": item.name,
                    "qty": item.qty,
                    "price": item.price,
                    "totalPrice": item.price * item.qty,
                    "createdAt": item.order.createdAt,
                    "isPaid": item.order.isPaid,
                    "isDelivered": item.order.isDelivered,
                }
            )

        return Response(custom_orders)
    else:
        return Response(
            {"detail": "Not authorized as a vendor"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
