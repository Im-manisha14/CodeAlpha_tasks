from django.core.management.base import BaseCommand
from django.contrib.sessions.models import Session


class Command(BaseCommand):
    help = 'Clear demo product, cart, and order data from the store app.'

    def add_arguments(self, parser):
        parser.add_argument('--yes', action='store_true', help='Actually perform deletions without prompt')

    def handle(self, *args, **options):
        from store.models import Product, CartItem, Order, OrderItem, Category

        # Summarize counts
        counts = {
            'products': Product.objects.count(),
            'categories': Category.objects.count(),
            'cart_items': CartItem.objects.count(),
            'orders': Order.objects.count(),
            'order_items': OrderItem.objects.count(),
            'sessions': Session.objects.count(),
        }

        self.stdout.write('Current demo data counts:')
        for k, v in counts.items():
            self.stdout.write(f' - {k}: {v}')

        if not options['yes']:
            self.stdout.write(self.style.WARNING('No changes made. Re-run with --yes to delete these items.'))
            return

        # Delete in order to respect FK constraints
        deleted_order_items = OrderItem.objects.count()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        CartItem.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Session.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Demo data cleared.'))
        self.stdout.write(f'Deleted {deleted_order_items} order items and remaining related data.')
