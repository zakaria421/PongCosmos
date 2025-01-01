import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatapp.settings')

# Ensure apps are loaded before any further imports
import django
django.setup()

# Import other modules after setup
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing

from chat.authentication_middleware import JwtAuthenticationMiddleware 

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JwtAuthenticationMiddleware(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
