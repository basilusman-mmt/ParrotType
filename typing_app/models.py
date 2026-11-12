from django.db import models
from django.contrib.auth.models import User


class TestResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    wpm = models.FloatField(default=0)
    accuracy = models.FloatField(default=0)
    errors = models.IntegerField(default=0)
    mode = models.CharField(max_length=30)
    complexity = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.wpm} WPM"