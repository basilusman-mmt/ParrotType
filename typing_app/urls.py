from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("words/", views.get_words, name="get_words"),
    path("save-result/", views.save_result, name="save_result"),
    path("register/", views.register, name="register"),
    path("profile/", views.profile, name="profile"),
    path("stats/", views.stats, name="stats"),
]