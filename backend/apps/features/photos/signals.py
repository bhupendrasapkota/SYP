from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.features.photos.aitag import generate_ai_tags         



@receiver(post_save, sender="photos.Photo")
def generate_ai_tags_signal(sender, instance, created, **kwargs):
    """Generate AI tags after a photo is saved."""
    if created and not instance.ai_tags:
        try:  
            instance.ai_tags = instance.generate_ai_tags() or []
            instance.save(update_fields=["ai_tags"])
        except Exception as e:
            print(f"AI Tagging failed: {e}")
