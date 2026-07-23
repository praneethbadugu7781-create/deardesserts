import urllib.request
import re
import os

url = 'https://drive.google.com/drive/folders/108iO5gSBAree-R7HiPwzVs_94RRXMgCb'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    with open('drive_page.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('HTML saved, length:', len(html))
    
    # Search for Google Drive file IDs and titles
    # Drive folder item patterns
    file_ids = re.findall(r'https://drive\.google\.com/file/d/([a-zA-Z0-9_-]+)', html)
    print('File IDs found via link:', file_ids)
    
    # Alternative pattern for file names and IDs in JS data
    matches = re.findall(r'\["([a-zA-Z0-9_-]{28,35})",\["([^"]+)"', html)
    print('Matches:', matches)

    # Search for images/png/jpg/svg filenames in html
    filenames = re.findall(r'["\']([^"\']+\.(?:png|jpg|jpeg|svg|webp|png\?v=\d+))["\']', html, re.IGNORECASE)
    print('Filenames:', set(filenames))
    
except Exception as e:
    print('Error:', e)
