import requests
from bs4 import BeautifulSoup

url = 'http://127.0.0.1:8000/register/'
session = requests.Session()

# Get CSRF token
g = session.get(url)
soup = BeautifulSoup(g.text, 'html.parser')
csrf = soup.find('input', {'name': 'csrfmiddlewaretoken'})['value']

payload = {
    'username': 'testuser5',
    'email': 'testuser5@example.com',
    'password1': 'ModernStore123',
    'password2': 'ModernStore123',
    'csrfmiddlewaretoken': csrf
}

r = session.post(url, data=payload, allow_redirects=False)
print('Status:', r.status_code)
print('Redirect:', r.headers.get('Location'))
print('Body:', r.text[:500])
