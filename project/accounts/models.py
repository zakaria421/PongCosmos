from django.db import models
from django.contrib.auth.models import User
import random
import os

profilePics = [
    'images/poro0.jpg',
    'images/poro1.jpg',
    'images/poro2.jpg',
    'images/poro3.jpg',
    'images/poro4.jpg',
    'images/poro5.jpg',
    'images/poro6.jpg',
]

class UserProfile(models.Model):
    user                    = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_profile')
    id                      = models.AutoField(primary_key=True)
    nickname                = models.CharField(max_length=30, unique=True, blank=True, null=True)
    profile_picture         = models.ImageField(upload_to="images/", default=random.choice(profilePics), blank=True, null=True)
    mimeType                = models.CharField(max_length=50, default="image/jpg")
    email                   = models.EmailField(max_length=255, blank=True, null=True)
    bio                     = models.CharField(max_length=100, blank=True)
    friends                 = models.ManyToManyField(User, blank=True, related_name='user_friends')
    wins                    = models.IntegerField(default=0)
    losses                  = models.IntegerField(default=0)
    level                   = models.IntegerField(default=0)
    otp_secret              = models.CharField(max_length=32, blank=True, null=True)  # Store OTP secret
    is_2fa_enabled          = models.BooleanField(default=False)

    def __str__(self):
        return self.nickname