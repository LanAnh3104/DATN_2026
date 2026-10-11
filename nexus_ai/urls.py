from django.contrib import admin
from django.urls import path
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.dashboard_view, name='dashboard'),
    path('projects/', views.projects_view, name='projects'),
    path('projects/<int:project_id>/delete/', views.delete_project_view, name='delete_project'),
    path('testcases/', views.testcases_view, name='testcases'),
    path('testcases/<int:testcase_id>/delete/', views.delete_testcase_view, name='delete_testcase'),
    path('history/', views.history_view, name='history'),
    path('analytics/', views.analytics_view, name='analytics'),
    path('settings/', views.settings_view, name='settings'),
    
    # API endpoints
    path('api/ai-generate/', views.api_ai_generate, name='api_ai_generate'),
    path('api/run-tests/', views.api_run_tests, name='api_run_tests'),
]
