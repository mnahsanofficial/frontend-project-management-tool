import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  projectForm!: FormGroup;
  isEditMode = false;
  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private dialogRef: MatDialogRef<ProjectFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    if (this.data) {
      this.isEditMode = true;
      this.patchForm(this.data);
    }
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      status: ['active', Validators.required]
    });
  }

  patchForm(project: any): void {
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      startDate: new Date(project.startDate),
      endDate: project.endDate ? new Date(project.endDate) : null,
      status: project.status
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      return;
    }

    const formValue = {
      ...this.projectForm.value,
      startDate: moment(this.projectForm.value.startDate).format('YYYY-MM-DD'),
      endDate: this.projectForm.value.endDate 
        ? moment(this.projectForm.value.endDate).format('YYYY-MM-DD') 
        : null
    };

    if (this.isEditMode) {
      this.projectService.updateProject(this.data._id, formValue)
        .subscribe(() => this.dialogRef.close(true));
    } else {
      this.projectService.createProject(formValue)
        .subscribe(() => this.dialogRef.close(true));
    }
  }
}