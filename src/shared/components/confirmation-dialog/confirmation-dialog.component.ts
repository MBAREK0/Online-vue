import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-dialog1">
      <div class="modal-content1 shadow-lg">
        <div class="modal-header1" [ngClass]="getHeaderClass()">
          <h5 class="modal-title">
            <i [class]="getHeaderIcon()" class="me-2"></i>
            {{ data.title }}
          </h5>
          <button type="button" class="btn-close1" (click)="dialogRef.close(false)" aria-label="Close"></button>
        </div>
        <div class="modal-body1">
          <p>{{ data.message }}</p>
        </div>
        <div class="modal-footer1">
          <button type="button" class="btn btn-outline-secondary" (click)="dialogRef.close(false)">
            <i class="fas fa-times me-1"></i> Cancel
          </button>
          <button type="button" [class]="getConfirmButtonClass()" (click)="dialogRef.close(true)">
            <i [class]="getConfirmIcon()" class="me-1"></i> {{ getConfirmText() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay1 {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* This creates the dark overlay */
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }

    .modal-dialog1 {
      max-width: 450px;
      width: 100%;
      margin: 1.75rem auto;
    }

    .modal-content1 {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      background-color: #fff;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .modal-header1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
    }

    .modal-header1.delete-header {
      background-color: #f8d7da;
      color: #842029;
    }

    .modal-header1.archive-header {
      background-color: #fff3cd;
      color: #664d03;
    }

    .modal-header1.info-header {
      background-color: #cfe2ff;
      color: #084298;
    }

    .modal-body1 {
      padding: 1.5rem;
    }

    .modal-footer1 {
      display: flex;
      justify-content: flex-end;
      padding: 1rem;
      gap: 0.5rem;
      border-top: 1px solid #dee2e6;
    }

    .btn-close1 {
      background: transparent;
      border: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #6c757d;
      cursor: pointer;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: {
      title: string;
      message: string;
      type?: 'delete' | 'archive' | 'info';
    }
  ) {
    // Default to delete if no type is provided
    if (!this.data.type) {
      this.data.type = this.determineType(this.data.title);
    }
  }

  private determineType(title: string): 'delete' | 'archive' | 'info' {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('delete')) return 'delete';
    if (lowerTitle.includes('archive')) return 'archive';
    return 'info';
  }

  getHeaderClass(): string {
    switch (this.data.type) {
      case 'delete': return 'delete-header';
      case 'archive': return 'archive-header';
      default: return 'info-header';
    }
  }

  getHeaderIcon(): string {
    switch (this.data.type) {
      case 'delete': return 'fas fa-exclamation-triangle';
      case 'archive': return 'fas fa-archive';
      default: return 'fas fa-info-circle';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.data.type) {
      case 'delete': return 'btn btn-danger';
      case 'archive': return 'btn btn-warning';
      default: return 'btn btn-primary';
    }
  }

  getConfirmIcon(): string {
    switch (this.data.type) {
      case 'delete': return 'fas fa-trash';
      case 'archive': return 'fas fa-archive';
      default: return 'fas fa-check';
    }
  }

  getConfirmText(): string {
    switch (this.data.type) {
      case 'delete': return 'Delete';
      case 'archive': return 'Archive';
      default: return 'Confirm';
    }
  }
}
