from django.contrib import admin
from .models import UserProfile, Project, TestCase, ExecutionHistory

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'created_at')
    list_filter = ('role',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'url', 'owner', 'created_at')
    search_fields = ('name', 'url')

@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'action', 'status', 'severity', 'duration')
    list_filter = ('status', 'severity', 'project')
    search_fields = ('name', 'selector')

@admin.register(ExecutionHistory)
class ExecutionHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'target_url', 'total_tests', 'passed_tests', 'failed_tests', 'status', 'executed_at')
    list_filter = ('status', 'executed_at')
