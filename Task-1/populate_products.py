"""
Script to populate the database with sample products and categories
"""
from store.models import Product, Category

# Clear existing data
print("Clearing existing products and categories...")
Product.objects.all().delete()
Category.objects.all().delete()

# Create categories
print("Creating categories...")
electronics = Category.objects.create(name="Electronics", description="Electronic devices and gadgets")
clothing = Category.objects.create(name="Clothing", description="Fashion and apparel")
home = Category.objects.create(name="Home & Kitchen", description="Home and kitchen essentials")
books = Category.objects.create(name="Books", description="Books and literature")

print(f"Created {Category.objects.count()} categories")

# Create products
print("Creating products...")

# Electronics
Product.objects.create(
    name="Wireless Headphones",
    description="Premium noise-cancelling wireless headphones with 30-hour battery life",
    price=79.99,
    stock=50,
    category=electronics,
    image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    featured=True,
    active=True
)

Product.objects.create(
    name="Smart Watch",
    description="Fitness tracker with heart rate monitor and GPS",
    price=199.99,
    stock=30,
    category=electronics,
    image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    featured=True,
    active=True
)

Product.objects.create(
    name="Laptop Stand",
    description="Ergonomic aluminum laptop stand for better posture",
    price=34.99,
    stock=100,
    category=electronics,
    image="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
    active=True
)

Product.objects.create(
    name="Wireless Mouse",
    description="Ergonomic wireless mouse with precision tracking",
    price=24.99,
    stock=75,
    category=electronics,
    image="https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
    active=True
)

# Clothing
Product.objects.create(
    name="Classic T-Shirt",
    description="100% cotton comfortable t-shirt in various colors",
    price=19.99,
    stock=200,
    category=clothing,
    image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    featured=True,
    active=True
)

Product.objects.create(
    name="Denim Jeans",
    description="Classic fit denim jeans with stretch comfort",
    price=49.99,
    stock=80,
    category=clothing,
    image="https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
    active=True
)

Product.objects.create(
    name="Running Shoes",
    description="Lightweight running shoes with cushioned sole",
    price=89.99,
    stock=60,
    category=clothing,
    image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    featured=True,
    active=True
)

# Home & Kitchen
Product.objects.create(
    name="Coffee Maker",
    description="Programmable coffee maker with thermal carafe",
    price=59.99,
    stock=40,
    category=home,
    image="https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500",
    active=True
)

Product.objects.create(
    name="Blender",
    description="High-power blender for smoothies and more",
    price=69.99,
    stock=35,
    category=home,
    image="https://images.unsplash.com/photo-1585515320310-259814833e62?w=500",
    active=True
)

Product.objects.create(
    name="Cookware Set",
    description="Non-stick 10-piece cookware set",
    price=129.99,
    stock=25,
    category=home,
    image="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
    active=True
)

# Books
Product.objects.create(
    name="Python Programming",
    description="Complete guide to Python programming for beginners",
    price=39.99,
    stock=50,
    category=books,
    image="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500",
    active=True
)

Product.objects.create(
    name="Web Development Guide",
    description="Modern web development with HTML, CSS, and JavaScript",
    price=44.99,
    stock=45,
    category=books,
    image="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
    active=True
)

print(f"Created {Product.objects.count()} products")
print("\nSample data loaded successfully!")
print(f"Categories: {Category.objects.count()}")
print(f"Products: {Product.objects.count()}")
print(f"Featured products: {Product.objects.filter(featured=True).count()}")
