from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import UserProfile
from .serializers import UserProfileSerializer

class TopPlayersView(APIView):
    permission_classes = [AllowAny]  # Allow public access to this endpoint

    def get(self, request):
        top_players = UserProfile.objects.order_by('-level')[:10]  # Get top 10 players by level
        serializer = UserProfileSerializer(top_players, many=True)
        return Response(serializer.data, status=200)
