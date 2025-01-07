"""
ASGI config for gameback project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django
django.setup()


from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter , URLRouter
from channels.auth import AuthMiddlewareStack
from  game.routing import websocket_urlpatterns

from game.middleWare import JwtAuthenticationMiddleware 

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gameback.settings')

django_asgi_app = get_asgi_application()


application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JwtAuthenticationMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    ),
    
})
