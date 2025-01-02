from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .serializers import UserProfileSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework import status
from .models import UserProfile
from io import BytesIO
import base64
import qrcode
import pyotp


import logging

logger = logging.getLogger(__name__)


class UserProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, nickname):
        # Fetch the user profile by nickname
        user_profile = get_object_or_404(UserProfile, nickname=nickname)
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)



def generate_otp_secret():
    """Generate a random OTP secret."""
    return pyotp.random_base32()

def generate_qr_code(user_profile):
    """Generate a QR code for the user's OTP setup."""
    if not user_profile.otp_secret:
        user_profile.otp_secret = generate_otp_secret()
        user_profile.save()

    totp = pyotp.TOTP(user_profile.otp_secret)
    qr_url = totp.provisioning_uri(
        name=user_profile.user.email,
        issuer_name="web"
    )
    qr = qrcode.make(qr_url)
    buffered = BytesIO()
    qr.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

## This is for enabling the 2fa
class Enable2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            user_profile = user.user_profile
        except UserProfile.DoesNotExist:
            return Response({"message": "User profile does not exist."}, status=400)

        if user_profile.is_2fa_enabled:
            return Response({"message": "2FA is already enabled."}, status=400)

        # Generate QR code and enable 2FA
        qr_code = generate_qr_code(user_profile)
        user_profile.is_2fa_enabled = True
        user_profile.qrcode = qr_code
        user_profile.save()

        return JsonResponse({"message": "2FA enabled successfully.", })


# This is for verify the otp
class VerifyOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        otp = request.data.get("otp")

        user = request.user
        try:
            user_profile = user.user_profile
        except UserProfile.DoesNotExist:
            return Response({"message": "User profile does not exist."}, status=400)

        if not user_profile.is_2fa_enabled:
            return Response({"message": "2FA is not enabled."}, status=400)

        # Validate the OTP
        totp = pyotp.TOTP(user_profile.otp_secret)
        if not totp.verify(otp):
            return Response({"message": "Invalid OTP."}, status=400)

        # Generate tokens upon successful OTP verification
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "OTP verified successfully!",
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=200)

        

# This is for disable the 2fa
class Disable2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            user_profile = user.user_profile
        except UserProfile.DoesNotExist:
            return Response({"message": "User profile does not exist."}, status=400)

        if not user_profile.is_2fa_enabled:
            return Response({"message": "2FA is not enabled."}, status=400)

        user_profile.is_2fa_enabled = False
        user_profile.otp_secret = None  # Clear the OTP secret
        user_profile.save()

        return Response({"message": "2FA disabled successfully."}, status=200)




online_users = {}

# class OnlineOfflineView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         logger.info(f"________marking user {request.user.id} as online")
#         logger.info("__________Marking user as online_________")
#         user_id = request.user.id
#         logger.info(f"________marking user {user_id} as online")

#         online_users[user_id] = online_users.get(user_id, 0) + 1
#         logger.info(f"Current online users: {online_users}")

#         return Response({"message": f"User {user_id} marked as online"}, status=200)

#     def delete(self, request):
        
#         user_id = request.user.id
#         logger.info(f"Marking user {user_id} as offline")

#         if user_id in online_users:
#             online_users[user_id] -= 1
#             if online_users[user_id] <= 0:
#                 del online_users[user_id]
#                 logger.info(f"User {user_id} fully removed from online list")
#         else:
#             logger.warning(f"User {user_id} is not in the online list")

#         logger.info(f"Current online users: {online_users}")
#         return Response({"message": f"User {user_id} marked as offline"}, status=200)

#     def get(self, request):
        
#         logger.info("__________Fetching list of onlineusers_________")
#         return Response({"online_users": list(online_users.keys())}, status=200)















class OnlineOfflineView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Mark the user as online or increment their session count.
        """
        user_id = request.user.id
        print(f"Marking user {user_id} as online.")

        # Increment the session count for the user
        if user_id in online_users:
            online_users[user_id] += 1
        else:
            online_users[user_id] = 1

        print(f"Current online users: {online_users}")
        return Response({"message": f"User {user_id} marked as online."}, status=200)

    def delete(self, request):
        """
        Mark the user as offline or decrement their session count.
        """
        user_id = request.user.id
        print(f"Marking user {user_id} as offline.")

        if user_id in online_users:
            online_users[user_id] -= 1
            if online_users[user_id] <= 0:
                del online_users[user_id]
                print(f"User {user_id} fully removed from online list.")
        else:
            logger.warning(f"User {user_id} is not in the online list.")

        print(f"Current online users: {online_users}")
        return Response({"message": f"User {user_id} marked as offline."}, status=200)

    def get(self, request):
        """
        Retrieve the list of currently online users.
        """
        print("Fetching the list of online users.")
        return Response({"online_users": list(online_users.keys())}, status=200)





