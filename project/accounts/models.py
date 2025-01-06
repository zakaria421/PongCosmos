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

def get_random_profile_pic():
    return random.choice(profilePics)

class UserProfile(models.Model):
    user                    = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_profile')
    id                      = models.AutoField(primary_key=True)
    nickname                = models.CharField(max_length=10, unique=True, )
    profile_picture         = models.ImageField(upload_to="images/", default=get_random_profile_pic, blank=True, null=True)
    mimeType                = models.CharField(max_length=50, default="image/jpg")
    email                   = models.EmailField(max_length=255,unique=True)
    bio                     = models.CharField(max_length=100, blank=True)
    friends                 = models.ManyToManyField(User, blank=True, related_name='user_friends')
    wins                    = models.IntegerField(default=0)
    losses                  = models.IntegerField(default=0)
    level                   = models.FloatField(default=0.0)
    otp_secret              = models.CharField(max_length=32, blank=True, null=True)  # Store OTP secret
    is_2fa_enabled          = models.BooleanField(default=False)
    qrcode                  = models.CharField()
    inGame                  = models.BooleanField(default=False)

    def __str__(self):
        return self.nickname
    
class Match(models.Model):
    match_id                = models.IntegerField()  # Manually managed
    user                    = models.ForeignKey('UserProfile', on_delete=models.CASCADE, related_name='matches')  # The user who played the match
    opponent                = models.ForeignKey('UserProfile', on_delete=models.CASCADE, related_name='opponent_matches')  # The opponent user
    opponent_name           = models.CharField(max_length=255)  # Store the nickname at the time of the match
    score                   = models.IntegerField(default=0)
    opponent_score          = models.IntegerField(default=0)
    match_date              = models.DateTimeField(auto_now_add=True)  # Timestamp of when the match was created

    def save(self, *args, **kwargs):
        if not self.match_id:
            # Get the count of matches for this user and increment it by 1
            self.match_id = Match.objects.filter(user=self.user).count() + 1
        self.opponent_name = self.opponent.nickname  # Set opponent_name before saving
        super().save(*args, **kwargs)
