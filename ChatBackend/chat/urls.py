from django.urls import path
from .views import MessageListView
from . import views
from django.conf import settings
from .views import block_user, unblock_user, block_status

urlpatterns = [
    path('messages/<int:friend_id>/', MessageListView.as_view(), name='message_list'),
    path('block/<int:friend_id>/', block_user, name='block_user'),
    path('unblock/<int:friend_id>/', unblock_user, name='unblock_user'),
    path('chat/status/<int:friend_id>/', block_status, name='block_status'),

]

