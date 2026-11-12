import json
import random
from functools import lru_cache
from pathlib import Path

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST

from .models import TestResult


@lru_cache(maxsize=4)
def load_words(complexity):
    path = Path(settings.BASE_DIR) / "data" / f"{complexity}.txt"

    if not path.exists():
        return ["hello", "world", "typing", "keyboard"]

    return [
        word.strip().lower()
        for word in path.read_text(encoding="utf-8").splitlines()
        if word.strip().isalpha()
    ]


def get_words(request):
    complexity = request.GET.get("complexity", "medium")

    if complexity not in ["simple", "medium", "hard", "long"]:
        complexity = "medium"

    try:
        count = int(request.GET.get("count", 100))
    except ValueError:
        count = 100

    count = max(1, min(count, 2000))

    words = load_words(complexity)

    if not words:
        words = load_words("simple")

    return JsonResponse({
        "words": random.choices(words, k=count)
    })

def home(request):
    return render(request, "typing_app/home.html")


@require_POST
def save_result(request):
    if not request.user.is_authenticated:
        return JsonResponse({"saved": False})

    try:
        data = json.loads(request.body)

        result = TestResult.objects.create(
            user=request.user,
            wpm=max(0, float(data.get("wpm", 0))),
            accuracy=max(0, min(100, float(data.get("accuracy", 0)))),
            errors=max(0, int(data.get("errors", 0))),
            mode=str(data.get("mode", "time"))[:30],
            complexity=str(data.get("complexity", "medium"))[:20],
        )

        return JsonResponse({"saved": True, "id": result.id})

    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({"saved": False}, status=400)


def register(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)

        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("home")
    else:
        form = UserCreationForm()

    return render(request, "registration/login.html", {
        "form": form,
        "registering": True,
    })


@login_required
def profile(request):
    results = TestResult.objects.filter(user=request.user)

    return render(request, "profile.html", {
        "results": results[:10],
        "total_tests": results.count(),
        "best_wpm": max((result.wpm for result in results), default=0),
    })


@login_required
def stats(request):
    results = TestResult.objects.filter(user=request.user).order_by("-created_at")

    return render(request, "stats.html", {
        "results": results,
        "total_tests": results.count(),
        "best_wpm": max((result.wpm for result in results), default=0),
        "average_wpm": round(
            sum(result.wpm for result in results) / results.count(), 1
        ) if results.exists() else 0,
    })