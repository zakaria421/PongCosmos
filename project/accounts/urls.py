from django.urls import path
from .views_signin import LoginView
from .views_auth import oauth_callback
from .views_signup import RegisterView
from .viewsUserInfo import ProtectedView
from .views_changePass import ChangePasswordView
from .views_PrflUpdate import UserProfileUpdateView, ChangeProfilePictureAPIView
from .viewsWinLoss import UpdateWinLossView, matchHistory
from .views import UserProfileDetailView, Enable2FAView, VerifyOTPView, Disable2FAView
from .viewsTopplayers import TopPlayersView
from .views import OnlineOfflineView
# from .views import ProxyToChat

from . import viewsUserInfo

urlpatterns = [
    # path('proxy/block/<int:user_id>/', ProxyToChat.as_view(), name='proxy_to_chat'),
    path('userinfo/', ProtectedView.as_view(),),
    path('oauthcallback/', oauth_callback),
    path('signup/',RegisterView.as_view(),),
    path('signin/',LoginView.as_view(),),
    path('profile/update/',UserProfileUpdateView.as_view()),
    path('profile/update/changepassword/',ChangePasswordView.as_view()),
    path('profile/update/picture/',ChangeProfilePictureAPIView.as_view(),),
    path('online-offline/', OnlineOfflineView.as_view(), name='online-offline'),
    path('profile/update/<str:result>/', UpdateWinLossView.as_view()), #this is the url for the win or loss
    ####
    path('user-profile/<str:nickname>/', UserProfileDetailView.as_view(), name='user-profile-detail'),
    # *************************************************************************new
    path('api/search-friends/', viewsUserInfo.search_friends, name='search_friends'),
    path('api/add-friend/', viewsUserInfo.add_friend, name='add_friend'),

    path('2fa/enable/', Enable2FAView.as_view(), name='enable_2fa'),
    path("2fa/verify/", VerifyOTPView.as_view(), name="verify_otp"),
    path("2fa/disable/", Disable2FAView.as_view(), name="disable_2fa"),

    path('profile/matchHistory/', matchHistory.as_view(), name='user_profile_detail'),

    path('topplayers/', TopPlayersView.as_view(), name='top-players'),
    
]
