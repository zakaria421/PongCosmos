from django.contrib import admin
from .models import Message, Block, ChatRoom

admin.site.register(ChatRoom)
admin.site.register(Message)
admin.site.register(Block)
