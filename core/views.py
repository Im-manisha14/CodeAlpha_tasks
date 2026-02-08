from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import Profile, Post, LikePost, FollowersCount, Comment

def comment(request):
    if request.method == 'POST':
        comment = request.POST['comment']
        username = request.user.username
        post_id = request.POST['post_id']
        post = Post.objects.get(id=post_id)
        author = User.objects.get(username=username)
        
        new_comment = Comment.objects.create(post=post, author=author, content=comment)
        new_comment.save()
        return redirect('/')
    return redirect('/')

def like_post(request):
    username = request.user.username
    post_id = request.GET.get('post_id')

    post = Post.objects.get(id=post_id)

    like_filter = LikePost.objects.filter(post_id=post_id, username=username).first()

    if like_filter == None:
        new_like = LikePost.objects.create(post_id=post_id, username=username)
        new_like.save()
        post.no_of_likes = post.no_of_likes + 1
        post.save()
        return redirect('/')
    else:
        like_filter.delete()
        post.no_of_likes = post.no_of_likes - 1
        post.save()
        return redirect('/')

def profile(request, pk):
    user_object = User.objects.get(username=pk)
    user_profile = Profile.objects.get(user=user_object)
    user_posts = Post.objects.filter(user=pk)
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
    user_profile = Profile.objects.get(user=request.user)

    user_following = FollowersCount.objects.filter(follower=request.user.username)
    user_following_list = []
    for user in user_following:
        user_following_list.append(user.user)
    
    user_following_list.append(request.user.username)
    
    posts = Post.objects.filter(user__in=user_following_list).order_by('-created_at')

    return render(request, 'index.html', {'user_profile': user_profile, 'posts': posts})

def upload(request):
    if request.method == 'POST':
        user = request.user.username
        image = request.FILES.get('image_upload')
        caption = request.POST['caption']

        new_post = Post.objects.create(user=user, image=image, caption=caption)
        new_post.save()
        return redirect('index')
    return redirect('index')

def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']

        if password == confirm_password:
            if User.objects.filter(email=email).exists():
                messages.info(request, 'Email already taken')
                return redirect('signup')
            elif User.objects.filter(username=username).exists():
                messages.info(request, 'Username already taken')
                return redirect('signup')
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save()
                # Create Profile with id_user matching user.id
                user_profile = Profile(user=user, id_user=user.id)
                user_profile.save()
                return redirect('signin')
        else:
            messages.info(request, 'Passwords do not match')
            return redirect('signup')
    return render(request, 'signup.html')

def signin(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            messages.info(request, 'Invalid credentials')
            return redirect('signin')

    return render(request, 'signin.html')

def logout_view(request):
    logout(request)
    return redirect('signin')

def settings(request):
    user_profile = Profile.objects.get(user=request.user)

    if request.method == 'POST':
        if request.FILES.get('image') == None:
            image = user_profile.profileimg
        else:
            image = request.FILES.get('image')

        bio = request.POST['bio']
        location = request.POST['location']

        user_profile.profileimg = image
        user_profile.bio = bio
        user_profile.location = location
        user_profile.save()
        return redirect('settings')

    return render(request, 'setting.html', {'user_profile': user_profile})
