import urllib.request
import urllib.parse
import json
import os

items = {
    'tender_coconut': 'File:Tender coconut vendor in India.jpg',
    'coconut_oil': 'File:Coconut oil bottle in the background of coconuts from Kaleeswari Farm.jpg',
    'drumstick': 'File:Moringa oleifera drumstick pods.JPG',
    'brinjal': 'File:An Indian Purple Eggplant (Brinjal).jpg',
    'curry_leaves': 'File:Curry Leaves (5194454978).jpg',
    'turmeric': 'File:Curcuma longa roots.jpg',
    'mango': 'File:Alphonso mango.jpg',
    'ridge_gourd': 'File:Luffa ridge (Luffa acutangula) immature gourd ready for consumption.jpg',
    'bitter_gourd': 'File:Momordica charantia 22052014.jpg',
    'guava': 'File:Psidium guajava fruits.jpg',
    'okra': 'File:Okra (Abelmoschus esculentus) Feb 2019. DSC 0060 01.jpg',
}

dest_dir = r'd:\Lovhack\Lovhack\frontend\public\products'
os.makedirs(dest_dir, exist_ok=True)

for name, title in items.items():
    try:
        url = f'https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=800&format=json'
        req = urllib.request.Request(url, headers={'User-Agent': 'FarmBridgeApp/1.0 (contact@farmbridge.in)'})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            page = list(data['query']['pages'].values())[0]
            if 'imageinfo' in page:
                img_url = page['imageinfo'][0].get('thumburl') or page['imageinfo'][0]['url']
                dest = os.path.join(dest_dir, f'{name}.jpg')
                img_req = urllib.request.Request(img_url, headers={'User-Agent': 'FarmBridgeApp/1.0 (contact@farmbridge.in)'})
                with urllib.request.urlopen(img_req) as img_resp, open(dest, 'wb') as f:
                    f.write(img_resp.read())
                print(f'Successfully downloaded {name} to {dest}')
            else:
                print(f'No imageinfo for {title}')
    except Exception as e:
        print(f'Error downloading {name}: {e}')
