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
from rest_framework.exceptions import AuthenticationFailed

class JwtAuthenticationMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Parse the query string and extract the token
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]
        print(f'__________TOKEN_____DBG_____ {token}')
        
        if token:
            try:
                # Validate the token (this will raise exceptions if invalid)
                validated_token = UntypedToken(token)
                jwt_auth = JWTAuthentication()
                
                # Fetch the user associated with the token
                user = await self.get_user(jwt_auth, validated_token)
                scope['user'] = user
                print(f'---------------------------------------- User found: {user}', flush=True)
                
            except (InvalidTokenError, AuthenticationFailed) as e:
                # If token is invalid or user is not found, set AnonymousUser
                print(f'Error during token validation: {str(e)}')
                scope['user'] = AnonymousUser()
        else:
            # If no token is provided, assign AnonymousUser
            scope['user'] = AnonymousUser()

        # Close old database connections to avoid any connection issues
        close_old_connections()
        
        # Continue with the base middleware
        return await super().__call__(scope, receive, send)

    # The `get_user` method is now a synchronous method and will be wrapped correctly by `sync_to_async`
    @database_sync_to_async
    def get_user(self, jwt_auth, validated_token):
        """
        Custom method to retrieve the user from the JWT token
        This function is wrapped in `database_sync_to_async` because `jwt_auth.get_user`
        is a synchronous function that interacts with the database.
        """
        try:
            user = jwt_auth.get_user(validated_token)
            return user
        except Exception as e:
            raise AuthenticationFailed(f'Error: {str(e)}')
