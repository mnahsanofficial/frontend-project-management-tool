import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { ProjectService } from '../projects/project.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: any;
  projects: any[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadProjects();
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'active': return 'primary';
      case 'pending': return 'accent';
      case 'completed': return 'warn';
      default: return '';
    }
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe(
      projects => {
        this.projects = projects;
        this.loading = false;
      },
      error => {
        this.snackBar.open('Failed to load projects', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    );
  }
}