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

# logger = logging.getLogger(__name__)

# class JwtAuthenticationMiddleware(BaseMiddleware):
    # def __init__(self, inner):
    #     self.inner = inner

    # async def __call__(self, scope, receive, send):
    #     logger.info("___________________________________middleware__________________")
    #     headers = dict(scope['headers'])
    #     query_string = parse_qs(scope['query_string'].decode())
    #     token = query_string.get('token', [None])[0]
    #     # logger.info(f"_________________Token________________: {token}")

    #     if not token and b'authorization' in headers:
    #         token = headers[b'authorization'][0].decode().split()[1]

    #     scope['user'] = await self.get_user_from_token(token) if token else AnonymousUser()
    #     return await super().__call__(scope, receive, send)

    # @database_sync_to_async
    # def get_user_from_token(self, token):
    #     try:
    #         auth = JWTAuthentication()
    #         logger.info(f"_________________Token________________: {token}")
    #         validated_token = auth.get_validated_token(token)
    #         user = auth.get_user(validated_token)
    #         logger.info(f"Authenticated user: {user}")
    #         return user
    #     except (InvalidToken, TokenError) as e:
    #         logger.error(f"Token validation error: {e}")
    #         return AnonymousUser()
        

class JwtAuthenticationMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Parse token from the query string
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