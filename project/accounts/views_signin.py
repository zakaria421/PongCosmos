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

            refresh = RefreshToken.for_user(user)
            
            if user_profile.is_2fa_enabled:
                return Response({
                    "message": "2FA is enabled. Please verify the OTP.",
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "qr_code": user_profile.qrcode,
                    "twoFa": True,

                }, status=200)

            # Generate JWT tokens if 2FA is not enabled
            return Response({
                "twoFa": False,
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }, status=200)

        return Response(
            {"message": "Incorrect login or password, please try again."},
            status=status.HTTP_400_BAD_REQUEST
        )
