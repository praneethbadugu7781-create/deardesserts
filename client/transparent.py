from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    data = img.getdata()
    
    new_data = []
    for item in data:
        if item[0] > 235 and item[1] > 235 and item[2] > 235:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, 'PNG')

make_transparent('public/ddlogo.jpeg', 'public/ddlogo.png')
make_transparent('public/ddtitle.jpeg', 'public/ddtitle.png')
print('Images converted successfully!')
