from django.contrib import admin
from .models import *

# عشان تشوف الصور داخل صفحة المنتج في الأدمن
class ProductImageInline(admin.TabularInline):
    model = ProductImage

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]

admin.site.register(Product, ProductAdmin)
admin.site.register(Review)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(ShippingAddress)
admin.site.register(Category)
admin.site.register(Tag)
admin.site.register(CartItem)
admin.site.register(WishlistItem)
