import urllib.request
import re
import os

# Read saved HTML
with open('drive_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find file IDs associated with ddlogo.jpeg and ddtitle.jpeg
# Google Drive folder pages store file metadata in JS arrays
# Look for patterns near the filenames
logo_context = []
title_context = []

# Find positions of filenames
for name in ['ddlogo.jpeg', 'ddtitle.jpeg']:
    idx = html.find(name)
    if idx != -1:
        snippet = html[max(0, idx-500):idx+100]
        # Extract all potential Google Drive file IDs (33-char alphanumeric) from nearby context
        ids = re.findall(r'["\[]([a-zA-Z0-9_-]{25,45})["\]]', snippet)
        print(f'{name} found at index {idx}')
        print(f'  Nearby IDs: {ids}')
        # Show a smaller snippet for manual inspection
        small = html[max(0, idx-200):idx+50]
        print(f'  Context: ...{small[-150:]}...')
    else:
        print(f'{name} NOT FOUND in HTML')
