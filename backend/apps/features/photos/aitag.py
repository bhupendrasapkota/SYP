import requests
from io import BytesIO
from PIL import Image as PILImage
from transformers import BlipProcessor, BlipForConditionalGeneration


processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

def generate_ai_tags(photo):
    """Generate AI tags using Google Cloud Vision API."""
    try:
        response = requests.get(photo.image, stream=True)
        image = PILImage.open(BytesIO(response.content)).convert("RGB")  
                  
        input = processor(image, return_tensors="pt")
        out = model.generate(**input)
        caption = processor.decode(out[0], skip_special_tokens=True)
        
        return caption.lower().split()
    except Exception as e:
        print(f"AI Tagging failed: {e}")
        return []