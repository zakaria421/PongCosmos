from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import logging
from rest_framework_simplejwt.tokens import UntypedToken
from asgiref.sync import sync_to_async
from django.db import close_old_connections
from jwt import InvalidTokenError

class JwtAuthenticationMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):

        
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]

        if token:
            try:
                validated_token = UntypedToken(token)
                jwt_auth = JWTAuthentication()
                user = await sync_to_async(jwt_auth.get_user)(validated_token)
                print (f'----------------------------------------       {user}', flush=True)
                scope['user'] = user
            except InvalidTokenError:
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        close_old_connections()

        return await super().__call__(scope, receive, send)