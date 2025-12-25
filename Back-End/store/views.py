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

from django.db.models import Sum
from datetime import timedelta
from django.utils import timezone

import csv
from django.http import HttpResponse
import json

# views for Products


@api_view(["GET"])
def getProducts(request):
    query = request.query_params.get("keyword")
    category_id = request.query_params.get("category")

    if query == None:
        query = ""

    # 1. البحث
    products = Product.objects.filter(
        Q(name__icontains=query)
        | Q(description__icontains=query)
        | Q(brand__icontains=query)
        | Q(category__name__icontains=query)
    ).order_by("-createdAt")

    # 2. فلتر القسم
    if category_id:
        products = products.filter(category__id=category_id)

    # 👇👇 3. التعديل الجذري: فلترة "الموافق عليه" لغير الأدمن 👇👇
    if not request.user.is_staff:
        products = products.filter(approval_status="approved")

    # 4. الـ Pagination (بيتم بعد الفلترة، فبيكون العدد مظبوط)
    page = request.query_params.get("page")
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
    return Response(
        {"products": serializer.data, "page": page, "pages": paginator.num_pages}
    )


# views for Product Details
@api_view(["GET"])
def getProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response(
            {"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND
        )


# views for Categories
@api_view(["GET"])
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
@parser_classes([MultiPartParser, FormParser])
def createProduct(request):
    data = request.data
    user = request.user

    status_value = "pending"
    if user.is_staff:
        status_value = data.get("approval_status", "pending")

    # 1. إنشاء المنتج الأساسي
    product = Product.objects.create(
        user=user,
        name=data.get("name"),
        price=data.get("price"),
        brand=data.get("brand"),
        countInStock=data.get("countInStock"),
        category_id=data.get("category"),
        description=data.get("description"),
        approval_status=status_value,
    )

    # 2. حفظ الصورة الرئيسية (Main Image)
    if request.FILES.get("image"):
        product.image = request.FILES.get("image")

    # ---------------------------------------------------
    # 3. حل مشكلة الصور الفرعية (Sub Images) ✅
    # ---------------------------------------------------
    # نستخدم getlist لجلب كل الملفات المرسلة تحت اسم 'images'
    images = request.FILES.getlist("images")
    for img in images:
        ProductImage.objects.create(product=product, image=img)

    # ---------------------------------------------------
    # 4. حل مشكلة التاجز (Tags) ✅
    # ---------------------------------------------------
    if "tags" in data:
        tags_data = data["tags"]
        # التأكد من أن البيانات نصية (JSON String)
        if isinstance(tags_data, str):
            try:
                tags_list = json.loads(tags_data)
                for tag_name in tags_list:
                    # تنظيف النص وإنشاء التاج أو جلبه
                    tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                    product.tags.add(tag)
            except json.JSONDecodeError:
                print("Error decoding tags JSON in Create")

    product.save()
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def updateProduct(request, pk):
    product = Product.objects.get(id=pk)
    data = request.data

    # 1. تحديث البيانات النصية
    product.name = data.get("name", product.name)
    product.price = data.get("price", product.price)
    product.brand = data.get("brand", product.brand)
    product.countInStock = data.get("countInStock", product.countInStock)
    product.description = data.get("description", product.description)
    
    if request.user.is_staff:
        product.approval_status = data.get("approval_status", product.approval_status)

    if data.get("category"):
        product.category_id = data.get("category")

    # 2. تحديث الصورة الرئيسية
    if request.FILES.get("image"):
        product.image = request.FILES.get("image")

    # ---------------------------------------------------
    # 3. حل مشكلة الصور الفرعية في التعديل (إضافة صور جديدة) ✅
    # ---------------------------------------------------
    # الصور القديمة لا تُمسح هنا، فقط نضيف الصور الجديدة القادمة من الفرونت
    images = request.FILES.getlist("images")
    for img in images:
        ProductImage.objects.create(product=product, image=img)

    # ---------------------------------------------------
    # 4. حل مشكلة التاجز في التعديل ✅
    # ---------------------------------------------------
    if "tags" in data:
        tags_data = data["tags"]
        if isinstance(tags_data, str):
            try:
                tags_list = json.loads(tags_data)
                product.tags.clear()  # نمسح العلاقات القديمة
                for tag_name in tags_list:
                    tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                    product.tags.add(tag)
            except json.JSONDecodeError:
                print("Error decoding tags JSON in Update")

    product.save()
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def deleteProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
        if product.user != request.user and not request.user.is_staff:
            return Response(
                {"detail": "Not authorized"}, status=status.HTTP_401_UNAUTHORIZED
            )
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
        return Response(
            {"detail": "No Order Items"}, status=status.HTTP_400_BAD_REQUEST
        )
    else:
        # 1. إنشاء الطلب مبدئياً
        order = Order.objects.create(
            user=user,
            paymentMethod=data["paymentMethod"],
            taxPrice=data["taxPrice"],
            shippingPrice=data["shippingPrice"],
            totalPrice=0,  # 👈 هنحسبه تحت بدقة
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
            final_price = (
                product.discount_price
                if (product.discount_price and product.discount_price > 0)
                else product.price
            )

            # تجميع السعر الكلي (سعر القطعة * الكمية)
            calculated_items_price += final_price * i["qty"]

            item = OrderItem.objects.create(
                product=product,
                order=order,
                name=product.name,
                qty=i["qty"],
                price=final_price,  # تخزين سعر الشراء الفعلي في العنصر
                image=product.image.url,
            )

            product.countInStock -= item.qty
            product.save()

        # 3. تحديث السعر الكلي للطلب (مجموع المنتجات + الشحن + الضريبة)
        # بنحول القيم لـ Decimal أو Float عشان الجمع يكون صح
        total_order_price = (
            float(calculated_items_price)
            + float(data["shippingPrice"])
            + float(data["taxPrice"])
        )

        order.totalPrice = total_order_price
        order.save()

        return Response({"id": order.id}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getOrderById(request, pk):
    user = request.user
    try:
        order = Order.objects.get(id=pk)

        # 👇 التعديل: استعلام مباشر عن OrderItem لتجنب مشاكل الأسماء
        # بنقوله: هل يوجد أي "عنصر" داخل هذا "الطلب" يتبع منتجاً يملكه هذا "المستخدم"؟
        is_seller_item = OrderItem.objects.filter(
            order=order, product__user=user
        ).exists()

        # الشرط: أدمن OR صاحب الطلب (المشتري) OR صاحب منتج في الطلب (بائع)
        if user.is_staff or order.user == user or is_seller_item:
            serializer = OrderSerializer(order, many=False)
            return Response(serializer.data)
        else:
            return Response(
                {"detail": "Not authorized to view this order"},
                status=status.HTTP_403_FORBIDDEN,
            )

    except Order.DoesNotExist:
        return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def updateOrderToPaid(request, pk):
    try:
        order = Order.objects.get(id=pk)

        order.isPaid = True
        order.paidAt = datetime.now()
        order.save()

        return Response("Order was paid")
    except Order.DoesNotExist:
        return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def getOrders(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAdminUser])
def updateOrderToDelivered(request, pk):
    print("📢 Deliver Request Received for ID:", pk)  # 1. هل الطلب وصل أصلاً؟

    try:
        order = Order.objects.get(id=pk)

        print(
            "🛑 Before Update - isDelivered:", order.isDelivered
        )  # 2. حالته قبل التعديل

        order.isDelivered = True
        order.deliveredAt = datetime.now()
        order.save()

        print(
            "✅ After Save - isDelivered:", order.isDelivered
        )  # 3. حالته بعد الحفظ (المفروض تبقى True)

        return Response("Order was delivered")
    except Order.DoesNotExist:
        print("❌ Order Not Found")
        return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print("❌ Error:", e)  # لو فيه خطأ غريب
        return Response(
            {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    user = request.user
    product = Product.objects.get(id=pk)
    data = request.data

    # 1. التحقق لو المستخدم عمل مراجعة قبل كدة
    # 👇👇 التعديل الأول: استخدمنا reviews بدل review_set
    alreadyExists = product.reviews.filter(user=user).exists()

    if alreadyExists:
        return Response(
            {"detail": "Product already reviewed"}, status=status.HTTP_400_BAD_REQUEST
        )

    # 2. التحقق من وجود التقييم
    elif data.get("rating") == 0 or data.get("rating") is None:
        return Response(
            {"detail": "Please select a rating"}, status=status.HTTP_400_BAD_REQUEST
        )

    # 3. إنشاء المراجعة
    else:
        try:
            review = Review.objects.create(
                user=user,
                product=product,
                name=user.first_name if user.first_name else user.username,
                rating=int(data["rating"]),
                comment=data["comment"],
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

            return Response("Review Added")

        except Exception as e:
            print("Error creating review:", e)  # طباعة الخطأ في التيرمينال للمساعدة
            return Response(
                {"detail": "An error occurred while saving the review"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def updateProductReview(request, pk):
    user = request.user
    product = Product.objects.get(id=pk)
    data = request.data

    try:
        # 1. بنجيب الريفيو القديم بتاع نفس المستخدم للمنتج ده
        review = product.reviews.get(user=user)

        # 2. تحديث البيانات
        if data.get("rating") == 0:
            return Response(
                {"detail": "Please select a rating"}, status=status.HTTP_400_BAD_REQUEST
            )

        review.rating = int(data["rating"])
        review.comment = data["comment"]
        review.save()

        # 3. إعادة حساب متوسط التقييم (عشان لو غير النجوم، التقييم الكلي يتغير)
        reviews = product.reviews.all()
        total = 0
        for i in reviews:
            total += i.rating

        product.rating = total / len(reviews)
        product.save()

        return Response("Review Updated")

    except Review.DoesNotExist:
        return Response(
            {"detail": "Review not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
def getTopProducts(request):
    # التعديل: شلنا الـ filter خالص
    # كدة بنقوله: رتب كل المنتجات حسب التقييم تنازلياً، وهات أول 5
    # سواء بقى واخدين 5 نجوم أو حتى نجمة واحدة، المهم دول الأعلى حالياً
    products = Product.objects.all().order_by("-rating")[0:5]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user = request.user
    orders = Order.objects.filter(user=user).order_by("-createdAt")
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def deleteOrder(request, pk):
    try:
        order = Order.objects.get(id=pk)  # أو _id حسب الموديل بتاعك
        order.delete()
        return Response("Order was deleted")
    except Order.DoesNotExist:
        return Response({"detail": "Order does not exist"}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getCart(request):
    user = request.user
    cart_items = CartItem.objects.filter(user=user).order_by("-createdAt")
    serializer = CartItemSerializer(cart_items, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def addToCart(request):
    user = request.user
    data = request.data
    product_id = data.get("product_id")
    qty = data.get("qty", 1)

    product = Product.objects.get(id=product_id)

    # لو المنتج موجود، زود الكمية
    cart_item, created = CartItem.objects.get_or_create(user=user, product=product)

    if not created:
        cart_item.qty = qty  # أو cart_item.qty += qty لو عايز تزود
        cart_item.save()
    else:
        cart_item.qty = qty
        cart_item.save()

    return Response("Item Added to Cart")


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def removeFromCart(request, pk):
    # pk هنا هو id المنتج
    try:
        cart_item = CartItem.objects.get(user=request.user, product__id=pk)
        cart_item.delete()
        return Response("Item Removed")
    except CartItem.DoesNotExist:
        return Response("Item not found", status=status.HTTP_404_NOT_FOUND)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clearCart(request):
    CartItem.objects.filter(user=request.user).delete()
    return Response("Cart Cleared")


# ================= WISHLIST VIEWS =================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getWishlist(request):
    user = request.user
    wishlist = WishlistItem.objects.filter(user=user).order_by("-createdAt")
    serializer = WishlistItemSerializer(wishlist, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggleWishlist(request):
    user = request.user
    data = request.data
    product_id = data.get("product_id")
    product = Product.objects.get(id=product_id)

    # لو موجود امسحه، لو مش موجود ضيفه
    item = WishlistItem.objects.filter(user=user, product=product)

    if item.exists():
        item.delete()
        return Response({"status": "removed"})
    else:
        WishlistItem.objects.create(user=user, product=product)
        return Response({"status": "added"})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def deleteProductImage(request, pk):
    try:
        # pk هنا هو id الصورة الفرعية (ProductImage) مش المنتج
        image = ProductImage.objects.get(id=pk)

        # تحقق أن المستخدم هو صاحب المنتج أو أدمن
        if image.product.user != request.user and not request.user.is_staff:
            return Response(
                {"detail": "Not authorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        image.delete()
        return Response("Image Deleted")
    except ProductImage.DoesNotExist:
        return Response({"detail": "Image not found"}, status=status.HTTP_404_NOT_FOUND)


# -------------------------
# 1. Admin Analytics Dashboard
# -------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def getDashboardStats(request):
    total_sales = Order.objects.aggregate(sum=Sum("totalPrice"))["sum"] or 0
    total_orders = Order.objects.count()
    total_products = Product.objects.count()
    total_users = User.objects.count()

    # تحسين داتا الشارت (آخر 7 طلبات أو آخر 7 أيام)
    # بنرجع التاريخ والسعر فقط
    recent_orders = Order.objects.all().order_by("-createdAt")[:10]
    # بنعكس الترتيب عشان الشارت يبدأ من القديم للجديد
    orders_data = [
        {"name": o.createdAt.strftime("%d/%m"), "sales": o.totalPrice}
        for o in reversed(recent_orders)
    ]

    return Response(
        {
            "totalSales": total_sales,
            "totalOrders": total_orders,
            "totalProducts": total_products,
            "totalUsers": total_users,
            "salesChart": orders_data,  # الداتا الجديدة للشارت
        }
    )


# -------------------------
# 2. Category Management (Admin)
# -------------------------
@api_view(["POST"])
@permission_classes([IsAdminUser])
def createCategory(request):
    data = request.data
    try:
        category = Category.objects.create(
            name=data["name"],
            # لو عندك حقل للصورة أو الوصف ضيفه هنا
        )
        serializer = CategorySerializer(category, many=False)
        return Response(serializer.data)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAdminUser])
def updateCategory(request, pk):
    data = request.data
    try:
        category = Category.objects.get(id=pk)
        category.name = data.get("name", category.name)
        category.save()
        return Response(CategorySerializer(category, many=False).data)
    except Category.DoesNotExist:
        return Response(
            {"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def deleteCategory(request, pk):
    try:
        category = Category.objects.get(id=pk)
        category.delete()
        return Response("Category Deleted")
    except Category.DoesNotExist:
        return Response(
            {"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def exportOrdersCSV(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="orders_report.csv"'

    writer = csv.writer(response)
    # عناوين الأعمدة
    writer.writerow(
        ["Order ID", "Customer", "Date", "Total Price", "Paid?", "Delivered?"]
    )

    orders = Order.objects.all().order_by("-createdAt")
    for order in orders:
        writer.writerow(
            [
                order._id if hasattr(order, "_id") else order.id,
                order.user.first_name if order.user else "Guest",
                order.createdAt.strftime("%Y-%m-%d"),
                order.totalPrice,
                "Yes" if order.isPaid else "No",
                "Yes" if order.isDelivered else "No",
            ]
        )

    return response


# أضف هذا الكود في نهاية ملف views.py


@api_view(["GET"])
def getProductsByCategory(request):
    categories = Category.objects.all()
    data = []

    for cat in categories:
        # هنجيب المنتجات الخاصة بالقسم ده (الموافق عليها فقط)
        products = Product.objects.filter(
            category=cat, approval_status="approved"
        ).order_by("-createdAt")

        # لو القسم فيه منتجات، ضيفه للقائمة
        if products.exists():
            serializer = ProductSerializer(products, many=True)
            data.append({"id": cat.id, "name": cat.name, "products": serializer.data})

    return Response(data)




# -------------------------
# 3. Tag Management (Admin)
# -------------------------
@api_view(["GET"])
def getTags(request):
    tags = Tag.objects.all()
    # تأكد أن TagSerializer موجود في serializers.py
    # لو مش موجود، ممكن تستخدم CategorySerializer مؤقتاً لو نفس الشكل (id, name)
    # أو ضيف TagSerializer في ملف serializers.py
    serializer = CategorySerializer(tags, many=True) 
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAdminUser])
def createTag(request):
    data = request.data
    try:
        tag = Tag.objects.create(name=data["name"])
        serializer = CategorySerializer(tag, many=False)
        return Response(serializer.data)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT"])
@permission_classes([IsAdminUser])
def updateTag(request, pk):
    data = request.data
    try:
        tag = Tag.objects.get(id=pk)
        tag.name = data.get("name", tag.name)
        tag.save()
        return Response(CategorySerializer(tag, many=False).data)
    except Tag.DoesNotExist:
        return Response(
            {"detail": "Tag not found"}, status=status.HTTP_404_NOT_FOUND
        )

@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def deleteTag(request, pk):
    try:
        tag = Tag.objects.get(id=pk)
        tag.delete()
        return Response("Tag Deleted")
    except Tag.DoesNotExist:
        return Response(
            {"detail": "Tag not found"}, status=status.HTTP_404_NOT_FOUND
        )
