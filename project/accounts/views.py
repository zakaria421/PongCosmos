from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import UserProfile
from .serializers import UserProfileSerializer


class UserProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, nickname):
        # Fetch the user profile by nickname
        user_profile = get_object_or_404(UserProfile, nickname=nickname)
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)
