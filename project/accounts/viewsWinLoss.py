from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile, Match
from django.shortcuts import get_object_or_404



class UpdateWinLossView(APIView):
    permission_classes = [IsAuthenticated]


    def post(self, request, result):
        try:
            user_id = request.data.get('user_id')
            opponent_name = request.data.get('opponent_name')
            score = request.data.get('score')
            opponent_score = request.data.get('opponent_score')
            level = request.data.get('level')


            if not user_id:
                return Response({"error": "User ID is required"}, status=400)
            # Fetch the user profile
            user_profile = UserProfile.objects.get(user__id=user_id)


            # Update stats based on the result
            if result == "win":
                user_profile.wins += 1
            elif result == "lose":
                user_profile.losses += 1
            else:
                return Response({"error": "Invalid result. Use 'win' or 'lose'."}, status=400)
            
            # Saving the new level
            user_profile.level = level
            user_profile.save()

            # Fetch the opponent user profile
            opponent_profile = get_object_or_404(UserProfile, nickname=opponent_name)
            match = Match.objects.create(
                user=user_profile,
                opponent_name=opponent_name,
                score=score,
                opponent_score=opponent_score
            )
            opponent_profile_picture = opponent_profile.profile_picture.url
            return Response({
                "message": f"User {user_profile.nickname} updated successfully.",
                "wins": user_profile.wins,
                "losses": user_profile.losses,
                "id":user_profile.id,
                "get_id":user_id,
                "match": {
                    "match_id": match.match_id,
                    "score": score,
                    "opponent_score": opponent_score,
                    "opponent_name" : opponent_name,
                    "opponent_profile_picture": opponent_profile_picture
                }
            }, status=200)

        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        



class matchHistory(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        user_id = request.query_params.get('user_id')  # Get the user ID from query params
        if not user_id:
            return Response({"error": "User ID is required"}, status=400)
        
        try:
            # Fetch the user profile
            user_profile = UserProfile.objects.get(user__id=user_id)

            # Get all matches for the user
            matches = Match.objects.filter(user=user_profile).values(
                'match_id', 'score', 'opponent_score', 'opponent_name', 'match_date'
            )

            # Fetch the opponent profile picture for each match
            match_details = []
            for match in matches:
                opponent_profile = get_object_or_404(UserProfile, nickname=match['opponent_name'])
                opponent_profile_picture_url = opponent_profile.profile_picture.url
                match_details.append({
                    "match_id": match['match_id'],
                    "score": match['score'],
                    "opponent_score": match['opponent_score'],
                    "opponent_name": match['opponent_name'],
                    "opponent_profile_picture": opponent_profile_picture_url,
                    "match_date": match['match_date']
                })

            return Response({
                "wins": user_profile.wins,
                "losses": user_profile.losses,
                "id": user_profile.id,
                "get_id": user_id,
                "matches": match_details
            }, status=200)

        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
