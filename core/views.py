import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Project, TestCase, ExecutionHistory, UserProfile
from .services import scrape_and_analyze, execute_test_cases

def dashboard_view(request):
    projects = Project.objects.all()
    test_cases = TestCase.objects.all()[:15]
    total_projects = Project.objects.count()
    total_tests = TestCase.objects.count()
    passed_tests = TestCase.objects.filter(status='PASSED').count()
    failed_tests = TestCase.objects.filter(status='FAILED').count()
    
    pass_rate = round((passed_tests / total_tests * 100), 1) if total_tests > 0 else 0
    
    context = {
        'active_page': 'dashboard',
        'projects': projects,
        'test_cases': test_cases,
        'total_projects': total_projects,
        'total_tests': total_tests,
        'pass_rate': pass_rate,
        'failed_tests': failed_tests,
    }
    return render(request, 'dashboard.html', context)

def projects_view(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        url = request.POST.get('url', '').strip()
        desc = request.POST.get('description', '').strip()
        if name and url:
            Project.objects.create(name=name, url=url, description=desc)
            return redirect('projects')
            
    projects = Project.objects.all()
    context = {
        'active_page': 'projects',
        'projects': projects,
    }
    return render(request, 'projects.html', context)

def delete_project_view(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    project.delete()
    return redirect('projects')

def testcases_view(request):
    project_id = request.GET.get('project')
    projects = Project.objects.all()
    
    if request.method == 'POST':
        action_type = request.POST.get('action_type', 'create')
        if action_type == 'create':
            name = request.POST.get('name')
            selector = request.POST.get('selector')
            action = request.POST.get('action', 'click')
            value = request.POST.get('value', '')
            severity = request.POST.get('severity', 'MEDIUM')
            p_id = request.POST.get('project_id')
            proj = Project.objects.filter(id=p_id).first() if p_id else None
            
            TestCase.objects.create(
                name=name, selector=selector, action=action, 
                value=value, severity=severity, project=proj
            )
            return redirect('testcases')

    if project_id:
        test_cases = TestCase.objects.filter(project_id=project_id)
    else:
        test_cases = TestCase.objects.all()
        
    context = {
        'active_page': 'testcases',
        'test_cases': test_cases,
        'projects': projects,
        'selected_project_id': int(project_id) if project_id else None,
    }
    return render(request, 'testcases.html', context)

def delete_testcase_view(request, testcase_id):
    tc = get_object_or_404(TestCase, id=testcase_id)
    tc.delete()
    return redirect('testcases')

def history_view(request):
    histories = ExecutionHistory.objects.all()
    context = {
        'active_page': 'history',
        'histories': histories,
    }
    return render(request, 'history.html', context)

def analytics_view(request):
    total_tests = TestCase.objects.count()
    passed = TestCase.objects.filter(status='PASSED').count()
    failed = TestCase.objects.filter(status='FAILED').count()
    pending = TestCase.objects.filter(status='PENDING').count()
    
    crit = TestCase.objects.filter(severity='CRITICAL').count()
    high = TestCase.objects.filter(severity='HIGH').count()
    med = TestCase.objects.filter(severity='MEDIUM').count()
    low = TestCase.objects.filter(severity='LOW').count()

    context = {
        'active_page': 'analytics',
        'total_tests': total_tests,
        'passed': passed,
        'failed': failed,
        'pending': pending,
        'severity_data': [crit, high, med, low],
    }
    return render(request, 'analytics.html', context)

def settings_view(request):
    return render(request, 'settings.html', {'active_page': 'settings'})

# --- AJAX APIs cho AI & Playwright Run ---
@csrf_exempt
def api_ai_generate(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    
    try:
        data = json.loads(request.body)
        url = data.get('url', '').strip()
        project_id = data.get('project_id')
        
        if not url:
            return JsonResponse({'error': 'Vui lòng cung cấp URL'}, status=400)
            
        generated_cases = scrape_and_analyze(url)
        
        proj = Project.objects.filter(id=project_id).first() if project_id else None
        saved_cases = []
        for item in generated_cases:
            tc = TestCase.objects.create(
                project=proj,
                name=item.get('name', 'Tự động kiểm thử'),
                selector=item.get('selector', 'body'),
                action=item.get('action', 'click'),
                value=item.get('value', ''),
                expected=item.get('expected', 'Thành công'),
                severity=item.get('severity', 'MEDIUM'),
                status='PENDING'
            )
            saved_cases.append({
                'id': tc.id,
                'name': tc.name,
                'selector': tc.selector,
                'action': tc.action,
                'severity': tc.severity,
                'status': tc.status,
            })
            
        return JsonResponse({'success': True, 'test_cases': saved_cases})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def api_run_tests(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
        
    try:
        data = json.loads(request.body)
        url = data.get('url', '').strip()
        if not url:
            return JsonResponse({'error': 'URL không được để trống'}, status=400)
            
        test_cases_objs = TestCase.objects.all()
        cases_payload = [{
            'id': tc.id,
            'name': tc.name,
            'selector': tc.selector,
            'action': tc.action,
            'value': tc.value
        } for tc in test_cases_objs]
        
        results = execute_test_cases(url, cases_payload)
        
        passed_count = 0
        failed_count = 0
        total_duration = 0.0
        
        for res in results:
            tc_id = res.get('id')
            tc = TestCase.objects.filter(id=tc_id).first()
            if tc:
                tc.status = res.get('status')
                tc.duration = res.get('duration', 0.0)
                tc.save()
            if res.get('status') == 'PASSED':
                passed_count += 1
            else:
                failed_count += 1
            total_duration += res.get('duration', 0.0)
            
        status = 'PASSED' if failed_count == 0 else 'FAILED'
        ExecutionHistory.objects.create(
            target_url=url,
            total_tests=len(results),
            passed_tests=passed_count,
            failed_tests=failed_count,
            status=status,
            duration=round(total_duration, 2),
            logs=json.dumps(results, ensure_ascii=False)
        )
        
        return JsonResponse({'success': True, 'results': results, 'status': status})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
