from django.contrib import admin
from .models import Category, Product, CartItem, Order, OrderItem

# Register your models here.

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'featured', 'active', 'created_at')
    list_filter = ('category', 'featured', 'active', 'created_at')
    search_fields = ('name', 'description')
    list_editable = ('price', 'stock', 'featured', 'active')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'total_price', 'created_at')
    list_filter = ('created_at',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('total_price',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__email')
    list_editable = ('status',)
    inlines = [OrderItemInline]
    readonly_fields = ('created_at', 'updated_at')
