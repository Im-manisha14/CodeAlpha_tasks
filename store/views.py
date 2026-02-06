from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.utils.safestring import mark_safe
from django.http import JsonResponse
from django.db import transaction
from django.core.paginator import Paginator
from .models import Product, CartItem, Order, OrderItem, Category
import json
from decimal import Decimal

def product_list(request):
    products = Product.objects.filter(active=True)
    categories = Category.objects.all()
    
    # Filter by category
    category_id = request.GET.get('category')
    selected_category_name = None
    if category_id:
        products = products.filter(category_id=category_id)
        category_obj = Category.objects.filter(id=category_id).first()
        if category_obj:
            selected_category_name = category_obj.name
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        products = products.filter(name__icontains=search_query)
    
    # Featured products
    featured_products = Product.objects.filter(featured=True, active=True)[:4]

    # Exclude featured products from main list to avoid duplication
    if not category_id and not search_query and not request.GET.get('page'):
         products = products.exclude(id__in=featured_products.values_list('id', flat=True))
    
    # Pagination
    paginator = Paginator(products, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'categories': categories,
        'featured_products': featured_products,
        'search_query': search_query,
        'selected_category': category_id,
        'selected_category_name': selected_category_name,
    }
    return render(request, 'store/product_list.html', context)

def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id, active=True)
    related_products = Product.objects.filter(
        category=product.category, active=True
    ).exclude(id=product.id)[:4]
    
    context = {
        'product': product,
        'related_products': related_products,
    }
    return render(request, 'store/product_detail.html', context)

@login_required
def add_to_cart(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        quantity = int(request.POST.get('quantity', 1))
        
        product = get_object_or_404(Product, id=product_id, active=True)
        
        if quantity > product.stock:
            messages.error(request, 'Not enough stock available.')
            return redirect('product_detail', product_id=product_id)
        
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            if cart_item.quantity > product.stock:
                cart_item.quantity = product.stock
                messages.warning(request, f'Limited to {product.stock} items due to stock.')
            cart_item.save()
        
        messages.success(request, f'{product.name} added to cart!')
        return redirect('shopping_cart')
    
    return redirect('product_list')

@login_required
def shopping_cart(request):
    cart_items = CartItem.objects.filter(user=request.user)
    # Use Decimal arithmetic to avoid mixing types and ensure correct formatting
    total = sum((item.total_price for item in cart_items), Decimal('0.00'))

    free_threshold = Decimal('50.00')
    shipping_cost = Decimal('0.00') if total >= free_threshold else Decimal('5.00')
    final_total = total + shipping_cost
    remaining_for_free_shipping = (free_threshold - total) if total < free_threshold else Decimal('0.00')

    context = {
        'cart_items': cart_items,
        'total': total,
        'shipping_cost': shipping_cost,
        'final_total': final_total,
        'remaining_for_free_shipping': remaining_for_free_shipping,
    }
    return render(request, 'store/shopping_cart.html', context)

@login_required
def update_cart(request):
    if request.method == 'POST':
        item_id = request.POST.get('item_id')
        quantity = int(request.POST.get('quantity', 1))
        
        cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
        
        if quantity <= 0:
            cart_item.delete()
            messages.success(request, 'Item removed from cart.')
        else:
            if quantity > cart_item.product.stock:
                quantity = cart_item.product.stock
                messages.warning(request, f'Limited to {cart_item.product.stock} items due to stock.')
            cart_item.quantity = quantity
            cart_item.save()
            messages.success(request, 'Cart updated.')
    
    return redirect('shopping_cart')

@login_required
def remove_from_cart(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
    cart_item.delete()
    messages.success(request, 'Item removed from cart.')
    return redirect('shopping_cart')

@login_required
def checkout(request):
    cart_items = CartItem.objects.filter(user=request.user)
    if not cart_items:
        messages.warning(request, 'Your cart is empty.')
        return redirect('shopping_cart')
    
    total = sum(item.total_price for item in cart_items)
    
    if request.method == 'POST':
        shipping_address = request.POST.get('shipping_address')
        
        if not shipping_address:
            messages.error(request, 'Shipping address is required.')
            return render(request, 'store/checkout.html', {'cart_items': cart_items, 'total': total})
        
        try:
            with transaction.atomic():
                # Create order
                order = Order.objects.create(
                    user=request.user,
                    total_amount=total,
                    shipping_address=shipping_address
                )
                
                # Create order items and update stock
                for cart_item in cart_items:
                    if cart_item.quantity > cart_item.product.stock:
                        raise ValueError(f'Not enough stock for {cart_item.product.name}')
                    
                    OrderItem.objects.create(
                        order=order,
                        product=cart_item.product,
                        quantity=cart_item.quantity,
                        price=cart_item.product.price
                    )
                    
                    # Update product stock
                    cart_item.product.stock -= cart_item.quantity
                    cart_item.product.save()
                
                # Clear cart
                cart_items.delete()
                
                messages.success(request, f'Order #{order.id} placed successfully!')
                return redirect('order_success', order_id=order.id)
                
        except ValueError as e:
            messages.error(request, str(e))
            return redirect('shopping_cart')
        except Exception as e:
            messages.error(request, 'An error occurred while processing your order.')
            return redirect('shopping_cart')
    
    context = {
        'cart_items': cart_items,
        'total': total,
    }
    return render(request, 'store/checkout.html', context)

@login_required
def order_success(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'store/order_success.html', {'order': order})

@login_required
def order_history(request):
    orders = Order.objects.filter(user=request.user)
    return render(request, 'store/order_history.html', {'orders': orders})

def user_register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        
        # Validation checks
        errors = []
        
        if not username or not email or not password1 or not password2:
            errors.append('All fields are required.')
        
        if password1 != password2:
            errors.append('Passwords do not match.')
        
        if User.objects.filter(username=username).exists():
            errors.append('Username already exists.')
        
        if User.objects.filter(email=email).exists():
            errors.append('Email already registered.')
        
        # Check password validity using Django's password validators
        if password1:
            from django.contrib.auth.password_validation import validate_password
            from django.core.exceptions import ValidationError
            try:
                validate_password(password1)
            except ValidationError as e:
                errors.extend(e.messages)
        
        if errors:
            # Remove specific redundant messages the UX owner requested hidden
            blocked = ['Username already exists.', 'Email already registered.']
            filtered = [e for e in errors if all(b not in e for b in blocked)]
            # If there are filtered errors, build HTML server-side and pass through
            # so the template contains a plain <ul> with only <li> children (no template tags).
            if filtered:
                from django.utils.html import escape
                items = ''.join(f'<li>{escape(e)}</li>' for e in filtered)
                alert_html = f'<div class="alert alert-danger"><ul class="mb-0">{items}</ul></div>'
                return render(request, 'store/auth/register.html', {'form_errors_html': mark_safe(alert_html), 'suppress_messages': True})
            else:
                return render(request, 'store/auth/register.html', {'suppress_messages': True})
        
        try:
            user = User.objects.create_user(username=username, email=email, password=password1)
        except Exception as e:
            from django.utils.html import escape
            items = f'<li>{escape(str(e))}</li>'
            alert_html = f'<div class="alert alert-danger"><ul class="mb-0">{items}</ul></div>'
            return render(request, 'store/auth/register.html', {'form_errors_html': mark_safe(alert_html), 'suppress_messages': True})

        # Registration successful - do NOT auto-login, redirect to login page with message
        messages.success(request, 'Registration successful! Please log in with your credentials.')
        return redirect('user_login')
    
    # Suppress global messages on the register GET so past alerts don't appear here
    return render(request, 'store/auth/register.html', {'suppress_messages': True})

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', 'product_list')
            messages.success(request, f'Welcome back, {user.username}!')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'store/auth/login.html')

def user_logout(request):
    logout(request)
    messages.success(request, 'You have been logged out.')
    return redirect('product_list')
