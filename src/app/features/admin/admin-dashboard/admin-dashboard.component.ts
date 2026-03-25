import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/admin.service';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
Chart.register(
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  totalCourses = 0;
  totalUsers = 0;
  revenueEstimate = 0;
  newUsersThisMonth = 0;
  newEnrollmentsThisMonth = 0;
  loading = false;

  // Users Table Data
  users: any[] = [];
  showUsers = false;
  loadingUsers = false;

  // Courses Table Data
  courses: any[] = [];
  showCourses = false;
  loadingCourses = false;

  // Revenue/Enrollment Data
  enrollments: any[] = [];
  revenueBreakdown: any[] = [];
  showRevenue = false;
  loadingRevenue = false;

  // Bulk Mode
  bulkMode = false;
  selectedIds: string[] = [];

  // Activity Feed
  activities: any[] = [];

  // Phase 5 Visionary Features
  searchQuery = '';
  showOmniSearch = false;
  platformSentiment = 'OPTIMISTIC'; // Mocked for radar
  healthStatus = {
    uptime: '99.98%',
    db: 'CONNECTED',
    signals: 'SOLID'
  };

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleOmniSearch();
    }
    if (event.key === 'Escape') {
      if (this.showOmniSearch) this.showOmniSearch = false;
      this.closeDrillDown();
    }
  }

  closeDrillDown() {
    this.showUsers = false;
    this.showCourses = false;
    this.showRevenue = false;
    this.selectedIds = [];
    this.bulkMode = false;
  }

  toggleOmniSearch() {
    this.showOmniSearch = !this.showOmniSearch;
    if (this.showOmniSearch) {
      setTimeout(() => {
        document.getElementById('omni-input')?.focus();
      }, 100);
    }
  }

  onOmniSearch() {
    console.log('Searching for:', this.searchQuery);
    // Simple mock logic: filter existing users/courses
  }

  toggleUsersList() {
    this.showUsers = !this.showUsers;
    this.showCourses = false;
    this.showRevenue = false;

    if (this.showUsers && this.users.length === 0) {
      this.loadingUsers = true;
      this.adminService.getAllUsers().subscribe({
        next: (res) => {
          if (res.success) {
            this.users = res.users;
          }
          this.loadingUsers = false;
        },
        error: () => {
          this.loadingUsers = false;
        }
      });
    }
  }

  toggleCoursesList() {
    this.showCourses = !this.showCourses;
    this.showUsers = false;
    this.showRevenue = false;

    if (this.showCourses && this.courses.length === 0) {
      this.loadingCourses = true;
      this.adminService.getAllCourses(1, 100).subscribe({
        next: (res) => {
          if (res.success) {
            this.courses = res.data;
          }
          this.loadingCourses = false;
        },
        error: () => {
          this.loadingCourses = false;
        }
      });
    }
  }

  toggleRevenueDetails() {
    this.showRevenue = !this.showRevenue;
    this.showUsers = false;
    this.showCourses = false;

    if (this.showRevenue && this.revenueBreakdown.length === 0) {
      this.loadingRevenue = true;
      this.adminService.getRevenueBreakdown().subscribe({
        next: (res) => {
          if (res.success) {
            this.revenueBreakdown = res.data;
          }
          this.loadingRevenue = false;
        },
        error: () => {
          this.loadingRevenue = false;
        }
      });
    }
  }

  toggleBulkMode() {
    this.bulkMode = !this.bulkMode;
    if (!this.bulkMode) {
      this.selectedIds = [];
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id);
  }

  toggleSelection(id: string) {
    if (this.isSelected(id)) {
      this.selectedIds = this.selectedIds.filter(sid => sid !== id);
    } else {
      this.selectedIds.push(id);
    }
  }

  bulkAction(type: 'verify' | 'delete') {
    if (this.selectedIds.length === 0) return;

    if (!confirm(`Are you sure you want to ${type} ${this.selectedIds.length} selected items?`)) {
      return;
    }

    // Since specific bulk API might not exist yet, we can simulate or call individual ones if few
    // Ideally we add a backend route for this.
    console.log(`Executing Bulk ${type} on:`, this.selectedIds);
    alert(`Bulk ${type} initiated for ${this.selectedIds.length} items. (Backend integration pending)`);

    // Clear selection after action
    this.selectedIds = [];
    this.bulkMode = false;
  }

  // Revenue Chart Data
  public revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  public revenueChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  // Enrollments Chart Data
  public enrollmentsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  public enrollmentsChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  ngOnInit() {
    this.loadStats();
    this.loadCharts();
    this.loadActivities();
  }

  loadStats() {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success && res.stats) {
          this.totalCourses = res.stats.totalCourses || 0;
          this.totalUsers = res.stats.totalUsers || 0;
          this.revenueEstimate = res.stats.totalRevenue || 0;
          this.newUsersThisMonth = res.stats.newUsersThisMonth || 0;
          this.newEnrollmentsThisMonth = res.stats.newEnrollmentsThisMonth || 0;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadActivities() {
    this.adminService.getActivities().subscribe({
      next: (res) => {
        if (res.success) {
          this.activities = res.activities;
        }
      }
    });
  }

  exportReport(type: 'users' | 'enrollments') {
    const request = type === 'users' ? this.adminService.exportUsers() : this.adminService.exportEnrollments();

    request.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(`Export ${type} error:`, err);
        alert(`Failed to export ${type} report.`);
      }
    });
  }

  loadCharts() {
    // 1. Revenue Chart (Last 30 days)
    this.adminService.getRevenueChart().subscribe({
      next: (res) => {
        if (res.success && res.chartData) {
          const labels = res.chartData.map((d: any) => d.date);
          const data = res.chartData.map((d: any) => d.revenue);

          this.revenueChartData = {
            labels: labels,
            datasets: [
              {
                data: data,
                label: 'Revenue (₹)',
                fill: true,
                tension: 0.4,
                borderColor: '#00f2ff',
                backgroundColor: 'rgba(0, 242, 255, 0.1)',
                pointBackgroundColor: '#00f2ff',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00f2ff'
              }
            ]
          };
        }
      }
    });

    // 2. Top Courses Enrollments Chart
    this.adminService.getEnrollmentsChart().subscribe({
      next: (res) => {
        if (res.success && res.chartData) {
          const labels = res.chartData.map((d: any) => d.course.length > 20 ? d.course.substring(0, 20) + '...' : d.course);
          const data = res.chartData.map((d: any) => d.enrollments);

          this.enrollmentsChartData = {
            labels: labels,
            datasets: [
              {
                data: data,
                label: 'Enrollments',
                backgroundColor: [
                  '#00f2ff',
                  '#bc13fe',
                  '#ff00ff',
                  '#4f46e5',
                  '#10b981'
                ],
                borderRadius: 8
              }
            ]
          };
        }
      }
    });
  }
}
