import re

with open('drive_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find ddlogo.jpeg context - look for data-id attributes near the filename
for name in ['ddlogo.jpeg', 'ddtitle.jpeg']:
    idx = html.find(name)
    if idx != -1:
        # Search wider area before the filename for data-id
        snippet = html[max(0, idx-2000):idx+200]
        # Look for data-id="..." pattern
        data_ids = re.findall(r'data-id="([^"]+)"', snippet)
        print(f'{name}:')
        print(f'  data-id values: {data_ids}')
        
        # Also look for /file/d/ pattern
        file_links = re.findall(r'/file/d/([a-zA-Z0-9_-]+)', snippet)
        print(f'  file/d/ links: {file_links}')
        
        # Look for thumbnail URLs which contain file IDs
        thumbs = re.findall(r'https://[^"]*googleusercontent[^"]*', snippet)
        print(f'  Thumbnails: {thumbs}')
        
        # Get a wider HTML snippet around it
        narrow = html[max(0, idx-800):idx+50]
        # Find all potential IDs (alphanumeric strings 20-50 chars)
        all_ids = re.findall(r'"([a-zA-Z0-9_-]{20,50})"', narrow)
        print(f'  All potential IDs in area: {all_ids}')
        print()
