from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import *
from rest_framework.parsers import MultiPartParser, FormParser 
from datetime import datetime
from .serializers import *
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
# views for Products

@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword')
    category_id = request.query_params.get('category')

    if query == None:
        query = ''

    # 1. البحث
    products = Product.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query) |
        Q(brand__icontains=query) |
        Q(category__name__icontains=query)
    ).order_by('-createdAt')

    # 2. فلتر القسم
    if category_id:
        products = products.filter(category__id=category_id)

    # 👇👇 3. التعديل الجذري: فلترة "الموافق عليه" لغير الأدمن 👇👇
    if not request.user.is_staff:
        products = products.filter(approval_status='approved')

    # 4. الـ Pagination (بيتم بعد الفلترة، فبيكون العدد مظبوط)
    page = request.query_params.get('page')
    paginator = Paginator(products, 8)

    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)

    if page == None:
        page = 1

    page = int(page)
    serializer = ProductSerializer(products, many=True)
    return Response({'products': serializer.data, 'page': page, 'pages': paginator.num_pages})

# views for Product Details
@api_view(["GET"])
def getProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
        
# views for Categories
@api_view(['GET'])
def getCategories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

# views for Vendor's Products
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getMyProducts(request):
    user = request.user
    products = user.product_set.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def createProduct(request):
    user = request.user
    # بننشئ منتج مبدئي، والبايع بيعدله في صفحة التعديل
    product = Product.objects.create(
        user=user,
        name="Product Name",
        price=0,
        brand="Brand",
        countInStock=0,
        description="",
        approval_status="pending",
    )
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser]) # 👈 2. ضيف السطر ده عشان السيرفر يقرا الصور
def updateProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)

        # التحقق من الصلاحية
        if product.user != request.user and not request.user.is_staff:
            return Response({"detail": "Not authorized"}, status=status.HTTP_401_UNAUTHORIZED)

        # لاحظ: لما نستخدم MultiPartParser البيانات بتكون في request.data عادي
        data = request.data 

        # ... (نفس كود تحديث النصوص: الاسم، السعر، إلخ) ...
        product.name = data.get('name', product.name)
        product.price = data.get('price', product.price)
        product.brand = data.get('brand', product.brand)
        product.countInStock = data.get('countInStock', product.countInStock)
        product.description = data.get('description', product.description)
        product.discount_price = data.get('discount_price', product.discount_price)

        if data.get('category'):
             # ... (نفس كود الكاتيجوري) ...
             pass

        if request.user.is_staff and data.get('approval_status'):
            product.approval_status = data.get('approval_status')

        # 2. تحديث الصورة الأساسية
        # request.data.get('image') هنا ممكن يحتوي الملف مباشرة مع FormParser
        if request.FILES.get('image'):
            product.image = request.FILES.get('image')

        product.save()

        # 3. رفع الصور الفرعية
        images = request.FILES.getlist('images')

        if images:
            for img in images:
                ProductImage.objects.create(product=product, image=img)

        # إنعاش الداتا
        product.refresh_from_db()
        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)

    except Product.DoesNotExist:
        return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def deleteProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
        if product.user != request.user and not request.user.is_staff:
            return Response({"detail": "Not authorized"}, status=status.HTTP_401_UNAUTHORIZED)
        product.delete()
        return Response("Product Deleted")
    except Product.DoesNotExist:
        return Response({"detail": "Product not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])  
def addOrderItems(request):
    user = request.user
    data = request.data
    orderItems = data["orderItems"]

    if orderItems and len(orderItems) == 0:
        return Response({"detail": "No Order Items"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # 1. إنشاء الطلب مبدئياً
        order = Order.objects.create(
            user=user,
            paymentMethod=data["paymentMethod"],
            taxPrice=data["taxPrice"],
            shippingPrice=data["shippingPrice"],
            totalPrice=0, # 👈 هنحسبه تحت بدقة
        )

        ShippingAddress.objects.create(
            order=order,
            address=data["shippingAddress"]["address"],
            city=data["shippingAddress"]["city"],
            postalCode=data["shippingAddress"]["postalCode"],
            country=data["shippingAddress"]["country"],
        )

        # متغير لحساب مجموع أسعار المنتجات الفعلي
        calculated_items_price = 0

        # 2. إنشاء العناصر وحساب السعر
        for i in orderItems:
            product = Product.objects.get(id=i["id"])

            # تحديد السعر: لو فيه خصم خده، مفيش خد الأصلي
            final_price = product.discount_price if (product.discount_price and product.discount_price > 0) else product.price

            # تجميع السعر الكلي (سعر القطعة * الكمية)
            calculated_items_price += (final_price * i["qty"])

            item = OrderItem.objects.create(
                product=product,
                order=order,
                name=product.name,
                qty=i["qty"],
                price=final_price, # تخزين سعر الشراء الفعلي في العنصر
                image=product.image.url,
            )

            product.countInStock -= item.qty
            product.save()

        # 3. تحديث السعر الكلي للطلب (مجموع المنتجات + الشحن + الضريبة)
        # بنحول القيم لـ Decimal أو Float عشان الجمع يكون صح
        total_order_price = float(calculated_items_price) + float(data["shippingPrice"]) + float(data["taxPrice"])
        
        order.totalPrice = total_order_price
        order.save()

        return Response({"id": order.id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrderById(request, pk):
    user = request.user
    try:
        order = Order.objects.get(id=pk)
        
        if user.is_staff or order.user == user:
            serializer = OrderSerializer(order, many=False)
            return Response(serializer.data)
        else:
            return Response({'detail': 'Not authorized to view this order'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    
    
    
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateOrderToPaid(request, pk):
    try:
        order = Order.objects.get(id=pk)

        order.isPaid = True
        order.paidAt = datetime.now()
        order.save()

        return Response('Order was paid')
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    
    

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getOrders(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateOrderToDelivered(request, pk):
    print("📢 Deliver Request Received for ID:", pk) # 1. هل الطلب وصل أصلاً؟

    try:
        order = Order.objects.get(id=pk)
        
        print("🛑 Before Update - isDelivered:", order.isDelivered) # 2. حالته قبل التعديل

        order.isDelivered = True
        order.deliveredAt = datetime.now()
        order.save()

        print("✅ After Save - isDelivered:", order.isDelivered) # 3. حالته بعد الحفظ (المفروض تبقى True)

        return Response('Order was delivered')
    except Order.DoesNotExist:
        print("❌ Order Not Found")
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print("❌ Error:", e) # لو فيه خطأ غريب
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    user = request.user
    product = Product.objects.get(id=pk)
    data = request.data

    # 1. التحقق لو المستخدم عمل مراجعة قبل كدة
    # 👇👇 التعديل الأول: استخدمنا reviews بدل review_set
    alreadyExists = product.reviews.filter(user=user).exists()

    if alreadyExists:
        return Response({'detail': 'Product already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

    # 2. التحقق من وجود التقييم
    elif data.get('rating') == 0 or data.get('rating') is None:
        return Response({'detail': 'Please select a rating'}, status=status.HTTP_400_BAD_REQUEST)

    # 3. إنشاء المراجعة
    else:
        try:
            review = Review.objects.create(
                user=user,
                product=product,
                name=user.first_name if user.first_name else user.username,
                rating=int(data['rating']),
                comment=data['comment'],
            )

            # 4. تحديث الإحصائيات
            # 👇👇 التعديل الثاني: استخدمنا reviews.all() بدل review_set.all()
            reviews = product.reviews.all()
            
            product.numReviews = len(reviews)

            total = 0
            for i in reviews:
                total += i.rating

            product.rating = total / len(reviews)
            product.save()

            return Response('Review Added')
            
        except Exception as e:
            print("Error creating review:", e) # طباعة الخطأ في التيرمينال للمساعدة
            return Response({'detail': 'An error occurred while saving the review'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateProductReview(request, pk):
    user = request.user
    product = Product.objects.get(id=pk)
    data = request.data

    try:
        # 1. بنجيب الريفيو القديم بتاع نفس المستخدم للمنتج ده
        review = product.reviews.get(user=user)

        # 2. تحديث البيانات
        if data.get('rating') == 0:
             return Response({'detail': 'Please select a rating'}, status=status.HTTP_400_BAD_REQUEST)
             
        review.rating = int(data['rating'])
        review.comment = data['comment']
        review.save()

        # 3. إعادة حساب متوسط التقييم (عشان لو غير النجوم، التقييم الكلي يتغير)
        reviews = product.reviews.all()
        total = 0
        for i in reviews:
            total += i.rating

        product.rating = total / len(reviews)
        product.save()

        return Response('Review Updated')

    except Review.DoesNotExist:
        return Response({'detail': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
    
    
    
@api_view(['GET'])
def getTopProducts(request):
    # التعديل: شلنا الـ filter خالص
    # كدة بنقوله: رتب كل المنتجات حسب التقييم تنازلياً، وهات أول 5
    # سواء بقى واخدين 5 نجوم أو حتى نجمة واحدة، المهم دول الأعلى حالياً
    products = Product.objects.all().order_by('-rating')[0:5]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)






@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user = request.user
    orders = Order.objects.filter(user=user).order_by('-createdAt')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)





@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteOrder(request, pk):
    try:
        order = Order.objects.get(id=pk) # أو _id حسب الموديل بتاعك
        order.delete()
        return Response('Order was deleted')
    except Order.DoesNotExist:
        return Response({'detail': 'Order does not exist'}, status=404)
    
    
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCart(request):
    user = request.user
    cart_items = CartItem.objects.filter(user=user).order_by('-createdAt')
    serializer = CartItemSerializer(cart_items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addToCart(request):
    user = request.user
    data = request.data
    product_id = data.get('product_id')
    qty = data.get('qty', 1)

    product = Product.objects.get(id=product_id)

    # لو المنتج موجود، زود الكمية
    cart_item, created = CartItem.objects.get_or_create(user=user, product=product)
    
    if not created:
        cart_item.qty = qty  # أو cart_item.qty += qty لو عايز تزود
        cart_item.save()
    else:
        cart_item.qty = qty
        cart_item.save()

    return Response('Item Added to Cart')

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def removeFromCart(request, pk):
    # pk هنا هو id المنتج
    try:
        cart_item = CartItem.objects.get(user=request.user, product__id=pk)
        cart_item.delete()
        return Response('Item Removed')
    except CartItem.DoesNotExist:
        return Response('Item not found', status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clearCart(request):
    CartItem.objects.filter(user=request.user).delete()
    return Response('Cart Cleared')


# ================= WISHLIST VIEWS =================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getWishlist(request):
    user = request.user
    wishlist = WishlistItem.objects.filter(user=user).order_by('-createdAt')
    serializer = WishlistItemSerializer(wishlist, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleWishlist(request):
    user = request.user
    data = request.data
    product_id = data.get('product_id')
    product = Product.objects.get(id=product_id)

    # لو موجود امسحه، لو مش موجود ضيفه
    item = WishlistItem.objects.filter(user=user, product=product)
    
    if item.exists():
        item.delete()
        return Response({'status': 'removed'})
    else:
        WishlistItem.objects.create(user=user, product=product)
        return Response({'status': 'added'})
    
    
    
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteProductImage(request, pk):
    try:
        # pk هنا هو id الصورة الفرعية (ProductImage) مش المنتج
        image = ProductImage.objects.get(id=pk)
        
        # تحقق أن المستخدم هو صاحب المنتج أو أدمن
        if image.product.user != request.user and not request.user.is_staff:
             return Response({"detail": "Not authorized"}, status=status.HTTP_401_UNAUTHORIZED)
             
        image.delete()
        return Response('Image Deleted')
    except ProductImage.DoesNotExist:
        return Response({'detail': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)