from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .serializers import UserProfileSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from .models import UserProfile
from io import BytesIO
import base64
import qrcode
import pyotp


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
        user_profile.save()

        return JsonResponse({"message": "2FA enabled successfully.", "qr_code": qr_code})


# class VerifyOTPView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         otp = request.data.get("otp")
#         user = request.user

#         try:
#             user_profile = user.user_profile
#         except UserProfile.DoesNotExist:
#             return Response({"message": "User profile does not exist."}, status=400)

#         if not user_profile.is_2fa_enabled:
#             return Response({"message": "2FA is not enabled."}, status=400)

#         totp = pyotp.TOTP(user_profile.otp_secret)
#         if totp.verify(otp):
#             return Response({"message": "OTP verified successfully!"}, status=200)
#         else:
#             return Response({"message": "Invalid OTP."}, status=400)     