import urllib.request
import re

url = 'https://beanro.framer.website/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    fonts = re.findall(r'family=([^&"\'\s]+)', html)
    print('Fonts in Google Fonts link:', set(fonts))
    
    # Find all font definitions in Framer JS/CSS
    font_names = re.findall(r'fontFamily\s*:\s*["\']([^"\']+)["\']', html)
    print('fontFamily props:', set(font_names))

    # Also search for @font-face or font-family in general
    ff = re.findall(r'font-family\s*:\s*([^;\}]+)', html)
    print('font-family CSS:', set(ff))

except Exception as e:
    print('Error:', e)
