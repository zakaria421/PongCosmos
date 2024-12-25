from django.contrib import admin
from .models import UserProfile, Match

# Register your models here.

class MatchInline(admin.TabularInline):
    model = Match
    extra = 0  # No extra empty forms
    fields = ('match_id', 'score', 'opponent_name', 'opponent_score', 'match_date')
    readonly_fields = ('match_id', 'opponent_name', 'score', 'opponent_score', 'match_date')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'id', 'nickname', 'profile_picture', 'show_friends')
    inlines = [MatchInline]  # Include matches inline
        
    def show_friends(self, obj):
        return ", ".join([friend.username for friend in obj.friends.all()])
    
    show_friends.short_description = 'Friends'
