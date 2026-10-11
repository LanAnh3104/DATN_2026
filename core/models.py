from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Quản trị viên (Admin)'),
        ('qa_engineer', 'Kỹ sư kiểm thử (QA Engineer)'),
        ('developer', 'Lập trình viên (Developer)'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='qa_engineer')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"


class Project(models.Model):
    name = models.CharField(max_length=255, verbose_name="Tên dự án")
    url = models.URLField(max_length=500, verbose_name="Địa chỉ Website kiểm thử")
    description = models.TextField(blank=True, default="", verbose_name="Mô tả dự án")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TestCase(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Chờ thực thi'),
        ('PASSED', 'Đạt (Passed)'),
        ('FAILED', 'Thất bại (Failed)'),
    ]
    SEVERITY_CHOICES = [
        ('LOW', 'Thấp (Low)'),
        ('MEDIUM', 'Trung bình (Medium)'),
        ('HIGH', 'Cao (High)'),
        ('CRITICAL', 'Nghiêm trọng (Critical)'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='test_cases', null=True, blank=True)
    name = models.CharField(max_length=255, verbose_name="Tên kịch bản test")
    selector = models.CharField(max_length=255, verbose_name="CSS/XPath Selector")
    action = models.CharField(max_length=50, default='click', verbose_name="Hành động (click, fill, hover...)")
    value = models.CharField(max_length=255, blank=True, default="", verbose_name="Giá trị nhập (nếu có)")
    expected = models.CharField(max_length=255, default='Element should respond', verbose_name="Kết quả kỳ vọng")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MEDIUM')
    duration = models.FloatField(default=0.0, verbose_name="Thời gian chạy (giây)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name} - {self.status}"


class ExecutionHistory(models.Model):
    STATUS_CHOICES = [
        ('PASSED', 'Thành công toàn bộ'),
        ('FAILED', 'Có lỗi phát hiện'),
        ('ERROR', 'Gặp sự cố kết nối'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='executions', null=True, blank=True)
    target_url = models.URLField(max_length=500)
    total_tests = models.IntegerField(default=0)
    passed_tests = models.IntegerField(default=0)
    failed_tests = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PASSED')
    duration = models.FloatField(default=0.0, verbose_name="Tổng thời gian (giây)")
    logs = models.TextField(blank=True, default="")
    executed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    executed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-executed_at']

    def __str__(self):
        return f"Test Run {self.id} on {self.target_url} ({self.status})"
