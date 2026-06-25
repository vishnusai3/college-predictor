import json
import urllib.request
from urllib.error import HTTPError, URLError

url = 'http://localhost:5000/api/auth/student-login'
data = json.dumps({
    'mobile_number': '9999999999',
    'password': 'testpass'
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req) as resp:
        print('STATUS', resp.status)
        print(resp.read().decode())
except HTTPError as e:
    print('HTTP', e.code)
    print(e.read().decode())
except URLError as e:
    print('URLERR', e.reason)
