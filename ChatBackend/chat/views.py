from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth.models import User
from .models import ChatRoom, Message
from rest_framework.permissions import IsAuthenticated
from .serializers import ChatRoomSerializer, MessageSerializer
from django.db.models import Q

from django.http import JsonResponse
from .models import Block, User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json

import logging

logger = logging.getLogger(__name__)


# class CreateRoom(APIView):
#     def post(self, request, *args, **kwargs):
#         room_name = request.data.get('room_name')
#         users = request.data.get('users', [])

#         # Create a room and link users (simplified)
#         room = ChatRoom.objects.create(name=room_name)
#         for friend_id in users:
#             user = User.objects.get(id=user_id)
#             room.users.add(user)

#         room.save()
#         return Response(ChatRoomSerializer(room).data)

class ChatRoomView(APIView):
    def get(self, request, room_name):
        room = get_object_or_404(ChatRoom, name=room_name)
        serializer = ChatRoomSerializer(room)
        return Response(serializer.data)

    def post(self, request):
        serializer = ChatRoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageListView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, friend_id):
        try:
            user = request.user
            friend = User.objects.get(id=friend_id)
            
            # Filter messages between the authenticated user and the friend
            messages = Message.objects.filter(
                (Q(sender=user) & Q(receiver=friend)) | (Q(sender=friend) & Q(receiver=user))
            ).order_by('timestamp')

            # Serialize the messages
            serialized_messages = [
                {
                    "id": message.id,
                    "sender": message.sender.username,
                    "receiver": message.receiver.username,
                    "content": message.content,
                    "timestamp": message.timestamp.isoformat(),
                }
                for message in messages
            ]
            return Response(serialized_messages, status=200)

        except User.DoesNotExist:
            return Response({"error": "Friend not found."}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)



@csrf_exempt
def block_user(request, friend_id):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode('utf-8'))
            blocker_id = data.get('blocker_id')

            # Check if blocker and blocked user exist
            blocker = User.objects.get(id=blocker_id)
            blocked_user = User.objects.get(id=friend_id)

            # Create a block relationship
            Block.objects.get_or_create(blocker=blocker, blocked_user=blocked_user)

            return JsonResponse({"status": "blocked", "message": f"User {blocked_user.username} has been blocked."})

        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def unblock_user(request, friend_id):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode('utf-8'))
            blocker_id = data.get('blocker_id')

            # Fetch the blocker and blocked users
            blocker = User.objects.get(id=blocker_id)
            blocked_user = User.objects.get(id=friend_id)

            
            # Delete the block entry    
            deleted, _ = Block.objects.filter(blocker=blocker, blocked_user=blocked_user).delete()

            if deleted > 0:
                return JsonResponse({"status": "unblocked", "message": f"User {blocked_user.username} has been unblocked."}, status=200)
            else:
                return JsonResponse({"error": "No block entry found to delete."}, status=404)

        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)



@csrf_exempt
def block_status(request, friend_id):
    if request.method == "GET":
        try:
            blocker_id = request.user.id  # Assuming the user is authenticated
            is_blocked = Block.objects.filter(blocker_id=blocker_id, blocked_user_id=friend_id).exists()
            return JsonResponse({"is_blocked": is_blocked}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)
