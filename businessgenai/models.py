from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list, blank=True)

class BusinessIdea(models.Model):
    # Links each idea to a specific user
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ideas')
    
    # Basic info for quick listing
    name = models.CharField(max_length=255)
    slogan = models.CharField(max_length=255)
    description = models.TextField()
    
    # Store the entire AI response (SWOT, BMC, etc.) as JSON
    full_analysis = models.JSONField() 
    
    # Timestamp for sorting history
    created_at = models.DateTimeField(auto_now_add=True)

    def __clstr__(self):
        return f"{self.name} - {self.user.username}"