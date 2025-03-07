import requests
from io import BytesIO
from PIL import Image as PILImage
from transformers import BlipProcessor, BlipForConditionalGeneration

def generate_ai_tags(self):
    """Generate AI tags using Google Cloud Vision API."""
    try:
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        
        response = requests.get(self.image, stream=True)
        image = PILImage.open(BytesIO(response.content))
        image = image.convert("RGB")
            
        input = processor(image, return_tensors="pt")
            
        out = model.generate(**input)
        caption = processor.decode(out[0], skip_special_tokens=True)
        ai_tags = caption.lower().split()
        return ai_tags
    except Exception as e:
        print(f"AI Tagging failed: {e}")
        return []