from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json
import logging
from django.contrib.auth.models import User
from .models import ChatRoom, Message, Block
from django.db.models import Q
from urllib.parse import parse_qs
import traceback


logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # self.user = self.scope["user"]
        # self.global_group_name = "global_notif"
        
        # await self.channel_layer.group_add(
        #     self.global_group_name,
        #     self.channel_name
        # )
        
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"


        logger.info(f"Connecting to room: {self.room_name}")
        query_params = parse_qs(self.scope['query_string'].decode())
        receiver_id = query_params.get('receiver_id', [None])[0]
        logger.info(f"Receiver IIIIID: {receiver_id}")

        if receiver_id:
            receiver_group_name = f"user_{receiver_id}"
            await self.channel_layer.group_add(
                receiver_group_name,
                self.channel_name
            )
            logger.info(f"User connected to group: {receiver_group_name}")
        else:
            logger.error("Receiver ID not found in the query parameters")
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        try:
            messages = await self.get_messages()
            for message in messages:
                await self.send(text_data=json.dumps({
                    "message": message["content"],
                    "username": message["sender"],
                    "timestamp": message["timestamp"],
                }))
            logger.info(f"Sent previous messages to client: {self.room_name}")
        except Exception as e:
            logger.error(f"Error fetching or sending messages: {e}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"WebSocket disconnected: {self.room_group_name}")
        except Exception as e:
            logger.error(f"Error during WebSocket disconnection: {e}")

    @sync_to_async
    def get_messages(self):
        try:
            logger.info(f"Fetching messages for room: {self.room_name}")
            messages = Message.objects.filter(chat_room__name=self.room_name).order_by('timestamp')
            return [
                {
                    "content": message.content,
                    "sender": message.sender.username,
                    "timestamp": message.timestamp.isoformat(),
                }
                for message in messages
            ]
        except Exception as e:
            logger.error(f"Error fetching messages: {e}")
            return []

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            logger.info(f"Received WebSocket data: {data}")

            message_type = data.get("type")
            logger.info(message_type)
            if message_type == "join":
                username = data.get("username")
                logger.info(f"{username} joined the room")
            elif message_type == "game_invite":
                await self.send_game_invite(data)
            elif message_type == "invite_response":
                await self.send_invite_response(data)
            elif message_type == "message":
                await self.handle_chat_message(data)
            else:
                logger.warning(f"Unknown message type received: {data}")
                await self.send(text_data=json.dumps({"error": "Unknown message type"}))
        except Exception as e:
            logger.error(f"Error in receive: {e}")
            await self.send(
                text_data=json.dumps({"error": f"Server error: {str(e)}"})
            )

    async def handle_chat_message(self, data):
        try:
            message = data.get("message")
            sender_username = data.get("username")
            timestamp = data.get("timestamp")

            if not message or not sender_username:
                await self.send(
                    text_data=json.dumps({"error": "Invalid message format"})
                )
                return

            room_part1, room_part2 = self.room_name.split("_")
            sender = await sync_to_async(User.objects.get)(username=sender_username)
            receiver_id = int(room_part1) if sender.id == int(room_part2) else int(room_part2)

            if not receiver_id:
                raise ValueError("Receiver ID cannot be determined.")

            if await self.is_blocked(sender.id, receiver_id):
                await self.send(
                    text_data=json.dumps({"error": "Blocked users cannot exchange messages."})
                )
                return

            await self.save_message(sender_username, message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "username": sender_username,
                    "timestamp": timestamp,
                },
            )
        except Exception as e:
            logger.error(f"Error handling chat message: {e}")
            await self.send(
                text_data=json.dumps({"error": f"Server error: {str(e)}"})
            )

    async def chat_message(self, event):
        try:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "message",
                        "message": event["message"],
                        "username": event["username"],
                        "timestamp": event["timestamp"],
                    }
                )
            )
        except Exception as e:
            logger.error(f"Error broadcasting message: {e}")

    async def send_game_invite(self, data):
        try:
            query_params = parse_qs(self.scope['query_string'].decode())
            receiver_id = query_params.get('receiver_id', [None])[0]
            invite_id = data.get("invite_id")
            sender_name = data.get("sender_name")
            sender_id = data.get("sender_id")


            if not receiver_id or not invite_id or not sender_name:
                raise ValueError("Missing required fields in game invite payload")

            receiver_group_name = f"user_{receiver_id}"
            logger.info(f"Sending game invite to {receiver_group_name} with invite_id: {invite_id}")

            if sender_id == receiver_id:
                raise ValueError("Cannot send game invite to the same user")
            elif await self.is_blocked(receiver_id, sender_id):
                raise ValueError("Blocked users cannot send game invites")
            elif await self.is_blocked(sender_id, receiver_id):
                raise ValueError("Blocked users cannot receive game invites")

        
            await self.channel_layer.group_add(
                receiver_group_name,
                self.channel_name
            )
            await self.channel_layer.group_send(
                receiver_group_name,
                {
                    "type": "game_invite",
                    "sender_name": sender_name,
                    "sender_id": sender_id,
                    "invite_id": invite_id,
                }
            )
            logger.info(f"Game invite successfully sent to {receiver_group_name}")

        except Exception as e:
            logger.error(f"Error in send_game_invite: {e}")
            await self.send(
                text_data=json.dumps({"error": f"Error sending game invite: {str(e)}"})
            )


    async def send_invite_response(self, data):
        try:
            query_params = parse_qs(self.scope['query_string'].decode())
            receiver_id = query_params.get('receiver_id', [None])[0]
            invite_id = data.get("invite_id")
            sender_name = data.get("sender_name")
            sender_id = data.get("sender_id")

            status = data.get("status")

            if not status or not sender_name or not invite_id:
                raise ValueError("Missing required fields in invite response payload")
            receiver_group_name = f"user_{receiver_id}"

            await self.channel_layer.group_add(
                receiver_group_name,
                self.channel_name
            )
            await self.channel_layer.group_send(
                receiver_group_name,
                {
                    "type": "invite_response",
                    "status": status,
                    "sender_id": sender_id,
                    "sender_name": sender_name,
                    "invite_id": invite_id,
                },
            )
            logger.info(f"Invite response sent to group user_{receiver_group_name}")
        except Exception as e:
            logger.error(f"Error in send_invite_response: {e}")


    async def invite_response(self, event):
        try:
            response_message = {
                "type": "invite_response",
                "status": event["status"],
                "sender_id": event["sender_id"],
                "sender_name": event["sender_name"],
                "invite_id": event["invite_id"],
            }
            await self.send(text_data=json.dumps(response_message))
            logger.info(f"Invite response successfully sent to client: {response_message}")
        except Exception as e:
            logger.error(f"Error processing invite response: {traceback.format_exc()}")
            await self.send(text_data=json.dumps({"error": f"Error processing invite response: {str(e)}"}))

    async def game_invite(self, event):
        logger.info(f"Handling game invite with event data: {event}")

        try:
            game_invite_message = json.dumps({
                "type": "game_invite",
                "sender_id": event["sender_id"],
                "sender_name": event["sender_name"],
                "invite_id": event["invite_id"],
            })

            await self.send(text_data=game_invite_message)
            
            logger.info(f"Game invite successfully processed and sent to client: {game_invite_message}")
        except Exception as e:
            error_details = traceback.format_exc()
            logger.error(error_details)
            # logger.error(f"Error processing game_invite event: {e}")
            await self.send(text_data=json.dumps({"error": f"Error processing game invite: {str(e)}"}))


    @sync_to_async
    def save_message(self, username, message):
        try:
            sender = User.objects.get(username=username)

            # Parse room name to identify the receiver
            room_part1, room_part2 = self.room_name.split("_")
            sender_id = sender.id
            receiver_id = int(room_part1) if sender_id == int(room_part2) else int(room_part2)

            if not receiver_id:
                raise ValueError("Receiver ID cannot be null.")

            # Get or create the chat room
            chat_room, _ = ChatRoom.objects.get_or_create(name=self.room_name)

            # Save the message
            return Message.objects.create(
                chat_room=chat_room,
                sender=sender,
                receiver_id=receiver_id,
                content=message
            )
        except User.DoesNotExist as e:
            logger.error(f"User does not exist: {e}")
            raise
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            raise

    @sync_to_async
    def is_blocked(self, sender_id, receiver_id):
        try:
            return Block.objects.filter(
                Q(blocker_id=sender_id, blocked_user_id=receiver_id) |
                Q(blocker_id=receiver_id, blocked_user_id=sender_id)
            ).exists()
        except Exception as e:
            logger.error(f"Error checking block status: {e}")
            return True



class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.global_group_name = "global_notifications"

        # Join a global group to receive notifications
        await self.channel_layer.group_add(
            self.global_group_name,
            self.channel_name
        )

        await self.accept()

        # Broadcast new user status
        await self.broadcast_user_status(self.user.id, "online")

    async def disconnect(self, close_code):
        # Leave the global group
        await self.channel_layer.group_discard(
            self.global_group_name,
            self.channel_name
        )

        # Broadcast user offline status
        await self.broadcast_user_status(self.user.id, "offline")

    async def broadcast_user_status(self, user_id, status):
        # Broadcasts user status to the global notifications group
        await self.channel_layer.group_send(
            self.global_group_name,
            {
                "type": "user.status",
                "user_id": user_id,
                "status": status,
            }
        )

    # Handler for user status updates within the group
    async def user_status(self, event):
        # Send a message down to the client
        await self.send(text_data=json.dumps({
            "user_id": event["user_id"],
            "status": event["status"],
        }))
