from django.db import models
from django.contrib.auth.models import User
from django.views.generic import ListView



class ChatRoom(models.Model):
    name = models.CharField(max_length=255, unique=True)
    # created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Message(models.Model):
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name="sent_messages", on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name="received_messages", on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username} at {self.timestamp}"


class MessageListView(ListView):
    model = Message
    template_name = 'chat/message_list.html'

    def get_queryset(self):
        # Get the friend ID from the URL and filter messages accordingly
        friend_id = self.kwargs.get('friend_id')
        return Message.objects.filter(receiver_id=friend_id).order_by('timestamp')
    
# class Block(models.Model):
#     blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocker")
#     blocked_user = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="blocked_user",
#         null=True,  # Allow null values temporarily
#         blank=True
#     )
#     created_at = models.DateTimeField(auto_now_add=True)

class Block(models.Model):
    BLOCK_STATUS_CHOICES = [
        ('blocked', 'Blocked'),
        ('unblocked', 'Unblocked'),
    ]

    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocker")
    blocked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_user", null=True, blank=True)
    status = models.CharField(max_length=10, choices=BLOCK_STATUS_CHOICES, default='blocked')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked_user')

    def __str__(self):
        return f"{self.blocker.username} {self.status} {self.blocked_user.username}"
