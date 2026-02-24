from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import Profile, Post, LikePost, FollowersCount, Comment

def comment(request):
    if not request.user.is_authenticated:
        return redirect('signin')
    
    if request.method == 'POST':
        comment_text = request.POST.get('comment', '').strip()
        post_id = request.POST.get('post_id')
        
        if comment_text and post_id:
            try:
                post = Post.objects.get(id=post_id)
                new_comment = Comment.objects.create(
                    post=post, 
                    author=request.user, 
                    content=comment_text
                )
                new_comment.save()
            except Post.DoesNotExist:
                pass
    return redirect('/')

def like_post(request):
    if not request.user.is_authenticated:
        return redirect('signin')
    
    username = request.user.username
    post_id = request.GET.get('post_id')

    try:
        post = Post.objects.get(id=post_id)
        like_filter = LikePost.objects.filter(post_id=post_id, username=username).first()

        if like_filter == None:
            new_like = LikePost.objects.create(post_id=post_id, username=username)
            new_like.save()
            post.no_of_likes = post.no_of_likes + 1
            post.save()
        else:
            like_filter.delete()
            post.no_of_likes = post.no_of_likes - 1
            post.save()
    except Post.DoesNotExist:
        pass
    
    return redirect('/')

def profile(request, pk):
    if not request.user.is_authenticated:
        return redirect('signin')
    
    try:
        user_object = User.objects.get(username=pk)
        user_profile, created = Profile.objects.get_or_create(
            user=user_object,
            defaults={'id_user': user_object.id}
        )
        user_posts = Post.objects.filter(user=pk).order_by('-created_at')
        user_post_length = len(user_posts)

        follower = request.user.username
        user = pk

        if FollowersCount.objects.filter(follower=follower, user=user).first():
            button_text = 'Unfollow'
        else:
            button_text = 'Follow'

        user_followers = len(FollowersCount.objects.filter(user=pk))
        user_following = len(FollowersCount.objects.filter(follower=pk))

        context = {
            'user_object': user_object,
            'user_profile': user_profile,
            'user_posts': user_posts,
            'user_post_length': user_post_length,
            'button_text': button_text,
            'user_followers': user_followers,
            'user_following': user_following,
        }
        return render(request, 'profile.html', context)
    except User.DoesNotExist:
        return redirect('/')

def follow(request):
    if request.method == 'POST':
        follower = request.POST['follower']
        user = request.POST['user']

        if FollowersCount.objects.filter(follower=follower, user=user).first():
            delete_follower = FollowersCount.objects.get(follower=follower, user=user)
            delete_follower.delete()
            return redirect('/profile/'+user)
        else:
            new_follower = FollowersCount.objects.create(follower=follower, user=user)
            new_follower.save()
            return redirect('/profile/'+user)
    return redirect('/')

# Create your views here.
def index(request):
    if not request.user.is_authenticated:
        return redirect('signin')
    user_profile, created = Profile.objects.get_or_create(
        user=request.user,
        defaults={'id_user': request.user.id}
    )

    user_following = FollowersCount.objects.filter(follower=request.user.username)
    user_following_list = []
    for user in user_following:
        user_following_list.append(user.user)
    
    user_following_list.append(request.user.username)
    
    posts = Post.objects.filter(user__in=user_following_list).order_by('-created_at')

    return render(request, 'index.html', {'user_profile': user_profile, 'posts': posts})

def upload(request):
    if not request.user.is_authenticated:
        return redirect('signin')
    
    if request.method == 'POST':
        user = request.user.username
        image = request.FILES.get('image_upload')
        caption = request.POST.get('caption', '').strip()

        if not caption:
            messages.error(request, 'Please provide a caption for your post.')
            return redirect('/')
        
        if not image:
            messages.error(request, 'Please select an image to share.')
            return redirect('/')
            
        try:
            new_post = Post.objects.create(user=user, image=image, caption=caption)
            new_post.save()
            messages.success(request, 'Your post has been shared successfully!')
        except Exception as e:
            messages.error(request, 'There was an error sharing your post. Please try again.')
            
    return redirect('/')

def signup(request):
    if request.user.is_authenticated:
        return redirect('/')
        
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')

        # Validation
        if not all([username, email, password, confirm_password]):
            messages.error(request, 'Please fill in all fields.')
            return render(request, 'signup.html')

        if len(username) < 3:
            messages.error(request, 'Username must be at least 3 characters long.')
            return render(request, 'signup.html')

        if len(password) < 6:
            messages.error(request, 'Password must be at least 6 characters long.')
            return render(request, 'signup.html')

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'signup.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'An account with this email already exists.')
            return render(request, 'signup.html')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'This username is already taken.')
            return render(request, 'signup.html')

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()
            
            # Create Profile with id_user matching user.id
            user_profile = Profile.objects.create(user=user, id_user=user.id)
            user_profile.save()
            
            messages.success(request, f'Welcome {username}! Your account has been created successfully. Please sign in.')
            return redirect('signin')
            
        except Exception as e:
            messages.error(request, 'There was an error creating your account. Please try again.')
            return render(request, 'signup.html')

    return render(request, 'signup.html')

def signin(request):
    if request.user.is_authenticated:
        return redirect('/')
        
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')

        if not username or not password:
            messages.error(request, 'Please fill in both username and password.')
            return render(request, 'signin.html')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', '/')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid username or password. Please try again.')
            return render(request, 'signin.html')

    return render(request, 'signin.html')

def logout_view(request):
    if request.user.is_authenticated:
        username = request.user.username
        logout(request)
        messages.success(request, f'Goodbye {username}! You have been logged out successfully.')
    return redirect('signin')

def settings(request):
    if not request.user.is_authenticated:
        return redirect('signin')
        
    user_profile, created = Profile.objects.get_or_create(
        user=request.user,
        defaults={'id_user': request.user.id}
    )

    # Get user statistics
    user_posts_count = Post.objects.filter(user=request.user.username).count()
    followers_count = FollowersCount.objects.filter(user=request.user.username).count()
    following_count = FollowersCount.objects.filter(follower=request.user.username).count()

    if request.method == 'POST':
        # Handle profile image upload
        if request.FILES.get('image') == None:
            image = user_profile.profileimg
        else:
            image = request.FILES.get('image')

        bio = request.POST.get('bio', '').strip()
        location = request.POST.get('location', '').strip()

        user_profile.profileimg = image
        user_profile.bio = bio
        user_profile.location = location
        
        try:
            user_profile.save()
            messages.success(request, 'Your settings have been updated successfully!')
        except Exception as e:
            messages.error(request, 'There was an error updating your settings. Please try again.')
        
        return redirect('settings')

    context = {
        'user_profile': user_profile,
        'user_posts_count': user_posts_count,
        'followers_count': followers_count,
        'following_count': following_count,
    }
    
    return render(request, 'setting.html', context)
