import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SocialMedia.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Profile

print("--- Database Verification ---")
try:
    user_count = User.objects.count()
    profile_count = Profile.objects.count()
    print(f"Database connection successful.")
    print(f"Total Users: {user_count}")
    print(f"Total Profiles: {profile_count}")
    
    if user_count > 0:
        print("\nLast 5 Users:")
        for user in User.objects.all().order_by('-date_joined')[:5]:
            print(f"- {user.username} (Email: {user.email})")
    else:
        print("\nNo users found in database.")

except Exception as e:
    print(f"Database Error: {e}")
print("-----------------------------")
