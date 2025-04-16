import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ProjectService } from '../project.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { SocketService } from '../../core/services/socket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'status', 'startDate', 'endDate', 'actions'];
  dataSource = new MatTableDataSource<any>();
  private unsubscribe$ = new Subject<void>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private socketService: SocketService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadProjects();
    this.setupSocketListeners();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    this.projectService.getProjects()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(projects => {
        this.dataSource.data = projects;
      });
  }

  setupSocketListeners(): void {
    this.socketService.onProjectUpdate()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(project => {
        const index = this.dataSource.data.findIndex(p => p._id === project._id);
        if (index >= 0) {
          const updatedData = [...this.dataSource.data];
          updatedData[index] = project;
          this.dataSource.data = updatedData;
        } else {
          this.dataSource.data = [project, ...this.dataSource.data];
        }
      });
  }

  openProjectForm(project?: any): void {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '600px',
      data: project ? { ...project } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  deleteProject(id: string): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe(
        () => {
          this.snackBar.open('Project deleted successfully', 'Close', {
            duration: 3000
          });
          this.loadProjects();
        },
        error => {
          this.snackBar.open('Failed to delete project', 'Close', {
            duration: 3000
          });
        }
      );
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}