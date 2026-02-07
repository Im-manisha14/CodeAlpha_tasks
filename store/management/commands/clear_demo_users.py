from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Remove demo users (non-staff, non-superuser) from the database.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show which users would be deleted without deleting.')

    def handle(self, *args, **options):
        User = get_user_model()
        qs = User.objects.filter(is_staff=False, is_superuser=False)
        count = qs.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No demo users found.'))
            return

        if options['dry_run']:
            self.stdout.write(self.style.WARNING(f'{count} demo users would be deleted:'))
            for u in qs.order_by('id'):
                self.stdout.write(f' - {u.username} (id={u.id}, email={u.email})')
            return

        # Delete related objects if any (cascade will handle typical FK relations)
        usernames = list(qs.values_list('username', flat=True))
        qs.delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {count} demo user(s): {", ".join(usernames)}'))
