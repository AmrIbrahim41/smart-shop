from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator 

# ----------------- Category -----------------
class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(null=True, blank=True)
    def __str__(self): return self.name

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

# ----------------- المنتج -----------------
class Product(models.Model):
    APPROVAL_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField(Tag, blank=True)
    
    name = models.CharField(max_length=200) 
    brand = models.CharField(max_length=200, null=True, blank=True) 
    description = models.TextField(null=True, blank=True) 
    
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]) 
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    countInStock = models.IntegerField(default=0, validators=[MinValueValidator(0)])    
    
    image = models.ImageField(upload_to='products/', null=True, blank=True) 
    
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    numReviews = models.IntegerField(default=0)
    isFeatured = models.BooleanField(default=False) 
    
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='pending') 
    
    createdAt = models.DateTimeField(auto_now_add=True) 

    def __str__(self): return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_gallery/')

# ----------------- المراجعات -----------------
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews') 
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True) 
    name = models.CharField(max_length=200, null=True, blank=True)
    rating = models.IntegerField(default=0, validators=[MinValueValidator(1), MaxValueValidator(5)]) 
    comment = models.TextField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self): return str(self.rating)

# ----------------- الطلبات -----------------
class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    paymentMethod = models.CharField(max_length=200, null=True, blank=True)
    taxPrice = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    shippingPrice = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    totalPrice = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    isPaid = models.BooleanField(default=False)
    paidAt = models.DateTimeField(null=True, blank=True)
    
    isDelivered = models.BooleanField(default=False) 
    
    deliveredAt = models.DateTimeField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self): return f"Order {self.id}"

class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True) 
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200, null=True, blank=True) 
    qty = models.IntegerField(default=1) 
    price = models.DecimalField(max_digits=10, decimal_places=2) 
    image = models.CharField(max_length=200, null=True, blank=True) 
    
    def __str__(self): return str(self.name)

class ShippingAddress(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, primary_key=True) 
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=200)
    postalCode = models.CharField(max_length=200, null=True, blank=True)
    country = models.CharField(max_length=200)
    
    def __str__(self): return str(self.address)
    
    
# ... (موديلات Product و Order القديمة زي ما هي)

# 👇 موديل السلة (Cart)
class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty = models.IntegerField(default=1)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.qty} x {self.product.name}"

# 👇 موديل المفضلة (Wishlist)
class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product.name