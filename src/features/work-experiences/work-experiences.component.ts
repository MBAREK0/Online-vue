import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DragDropModule
} from '@angular/cdk/drag-drop';

import { WorkExperienceService } from '../../core/services/work-experience.service';
import { WorkExperienceResponseVM } from '../../core/interfaces/WorkExperienceResponseVM';
import { ReorderRequest } from '../../core/interfaces/ReorderRequest';
import { ConfirmationDialogService } from "../../core/services/ConfirmationDialogService";
import { ToastService } from "../../core/services/ToastService";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-work-experiences',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    RouterLink
  ],
  templateUrl: './work-experiences.component.html',
  styleUrls: ['./work-experiences.component.css']
})
export class WorkExperienceComponent implements OnInit {
  workExperiences: WorkExperienceResponseVM[] = [];
  loading = false;

  constructor(
    private workExperienceService: WorkExperienceService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadWorkExperiences();
  }

  drop(event: any) {
    // Reorder the items
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    // Create a copy of the current array
    const updatedExperiences = [...this.workExperiences];

    // Remove the item from the previous index
    const [removed] = updatedExperiences.splice(previousIndex, 1);

    // Insert the item at the new index
    updatedExperiences.splice(currentIndex, 0, removed);

    // Prepare reorder request
    const reorderRequests: ReorderRequest[] = updatedExperiences.map((exp, index) => ({
      componentId: exp.experienceId,
      languageCode: exp.languageCode,
      displayOrder: index + 1
    }));

    // Update local array immediately
    this.workExperiences = updatedExperiences;

    // Send reorder request to backend
    this.workExperienceService.reorderWorkExperiences(reorderRequests).subscribe({
      next: (serverUpdatedExperiences) => {
        this.workExperiences = serverUpdatedExperiences;
        this.toastService.showSuccess('Work experiences reordered successfully');
      },
      error: (error) => {
        // Revert to original order if backend fails
        this.toastService.showError('Failed to reorder work experiences');
      }
    });
  }

  loadWorkExperiences(): void {
    this.loading = true;
    this.workExperienceService.getAllWorkExperiences().subscribe({
      next: (experiences) => {
        this.workExperiences = experiences;
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Failed to load work experiences');
        this.loading = false;
      }
    });
  }

  // Placeholder methods
  openAddWorkExperienceModal(): void {
    console.log('Open add work experience modal');
  }

  openEditWorkExperienceModal(experience: WorkExperienceResponseVM): void {
    console.log('Open edit work experience modal', experience);
  }

  deleteWorkExperience(experienceId: string): void {
    this.confirmationDialogService.confirm(
      'Delete Work Experience',
      'Are you sure you want to delete this work experience?'
    ).subscribe((confirmed: any) => {
      if (confirmed) {
        this.workExperienceService.deleteWorkExperience(experienceId).subscribe({
          next: (updatedExperiences) => {
            this.loadWorkExperiences();
            this.toastService.showSuccess('Work experience deleted successfully');
          },
          error: (error) => {
            this.toastService.showError('Failed to delete work experience');
          }
        });
      }
    });
  }

  archiveWorkExperience(experienceId: string): void {
    this.confirmationDialogService.confirm(
      'Archive Work Experience',
      'Are you sure you want to archive this work experience?'
    ).subscribe((confirmed: any) => {
      if (confirmed) {
        this.workExperienceService.archiveWorkExperience(experienceId).subscribe({
          next: (updatedExperiences) => {
            this.workExperiences = updatedExperiences;
            this.toastService.showSuccess('Work experience archived successfully');
          },
          error: (error) => {
            this.toastService.showError('Failed to archive work experience');
          }
        });
      }
    });
  }
}
