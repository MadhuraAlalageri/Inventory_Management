from PIL import Image, ImageDraw, ImageFont

img = Image.new('RGB', (1000, 800), color=(255, 255, 255))
d = ImageDraw.Draw(img)

try:
    font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
    font_normal = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
except IOError:
    font_large = ImageFont.load_default()
    font_normal = ImageFont.load_default()

text_header = """ELECTRO WORLD INDIA
123, Sector 5, Rohini, New Delhi - 110085

INVOICE
Invoice No: EWI-2024-051
Date: 15-May-2024
"""
d.text((50, 50), text_header, fill=(0, 0, 0), font=font_normal)

# Draw Table Header
d.text((50, 250), "Item Name", fill=(0, 0, 0), font=font_large)
d.text((500, 250), "Quantity", fill=(0, 0, 0), font=font_large)
d.text((680, 250), "Price (Rs)", fill=(0, 0, 0), font=font_large)

d.line([(50, 290), (950, 290)], fill=(0, 0, 0), width=2)

# Draw Rows
items = [
    ("Soldering Iron", "2", "350.00"),
    ("Digital Multimeter", "1", "1250.00"),
    ("Arduino Uno", "3", "480.00"),
    ("Resistor Pack", "5", "85.00")
]

y = 310
for item, qty, price in items:
    d.text((50, y), item, fill=(0, 0, 0), font=font_normal)
    d.text((500, y), qty, fill=(0, 0, 0), font=font_normal)
    d.text((680, y), price, fill=(0, 0, 0), font=font_normal)
    y += 40

d.line([(50, y+10), (950, y+10)], fill=(0, 0, 0), width=2)

footer = """
Sub Total: 3815.00
GST (18%): 686.70
Grand Total: 4501.70

Total Amount in Words: Rupees Four Thousand Five Hundred
and One and Paisa Seventy only
"""
d.text((500, y+30), footer, fill=(0, 0, 0), font=font_normal)

img.save('/home/armtronix/.gemini/antigravity/brain/016f8920-f02a-4df0-8b93-8d1371f5f5d6/demo_invoice_digital.png')
print("Image generated successfully")
