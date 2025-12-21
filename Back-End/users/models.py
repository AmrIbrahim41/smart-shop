from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save 

class Profile(models.Model):
    USER_TYPE_CHOICES = (
        ('customer', 'Customer'),
        ('vendor', 'Vendor'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='customer') 
    
    phone = models.CharField(max_length=20, null=True, blank=True) 
    birthdate = models.DateField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    profilePicture = models.ImageField(upload_to='profiles/', null=True, blank=True) 

    def __str__(self):
        return self.user.username

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
post_save.connect(create_user_profile, sender=User)