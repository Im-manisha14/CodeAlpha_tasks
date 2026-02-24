import requests
from bs4 import BeautifulSoup

BASE = 'http://127.0.0.1:8000'
session = requests.Session()

# Register
r = session.get(BASE + '/register/')
soup = BeautifulSoup(r.text, 'html.parser')
csrf = soup.find('input', {'name': 'csrfmiddlewaretoken'})['value']
username = 'flowuser1'
payload = {
    'username': username,
    'email': f'{username}@example.com',
    'password1': 'ModernStore123',
    'password2': 'ModernStore123',
    'csrfmiddlewaretoken': csrf
}
r = session.post(BASE + '/register/', data=payload, allow_redirects=True)
print('Register status', r.status_code)

# Login
r = session.get(BASE + '/login/')
soup = BeautifulSoup(r.text, 'html.parser')
csrf = soup.find('input', {'name': 'csrfmiddlewaretoken'})['value']
payload = {
    'username': username,
    'password': 'ModernStore123',
    'csrfmiddlewaretoken': csrf
}
r = session.post(BASE + '/login/', data=payload, allow_redirects=True)
print('Login status', r.status_code)

# Home page
r = session.get(BASE + '/')
print('Home status', r.status_code)
soup = BeautifulSoup(r.text, 'html.parser')
images = soup.select('img.product-image')
print('Product images found:', len(images))
for i, img in enumerate(images[:12], 1):
    print(i, img.get('src'))
