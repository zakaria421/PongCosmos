from django.urls import path
from .views import MessageListView
from . import views

urlpatterns = [
    path('messages/<int:friend_id>/', MessageListView.as_view(), name='message_list'),
    path("api/block/<int:friend_id>/", views.block_user, name="block_user"),

]
