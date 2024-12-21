from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import LoginSerializer    
from rest_framework import status
from .models import UserProfile

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            # Authenticate user
            user = serializer.validated_data['user']

            try:
                user_profile = user.user_profile
            except UserProfile.DoesNotExist:
                return Response({"message": "User profile does not exist."}, status=400)

            if user_profile.is_2fa_enabled:
                return Response({
                    "message": "2FA is enabled. Please verify the OTP.",
                    "requires_2fa": True
                }, status=200)

            # Generate JWT tokens if 2FA is not enabled
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login successful",
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }, status=200)

        return Response(
            {"message": "Incorrect login or password, please try again."},
            status=status.HTTP_400_BAD_REQUEST
        )
