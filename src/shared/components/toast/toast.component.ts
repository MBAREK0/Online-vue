import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ToastService} from "../../../core/services/ToastService";


@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="toastService.toast()"
      class="fixed top-4 right-4 z-50 p-4 rounded shadow-lg transition-all duration-300 ease-in-out"
      [ngClass]="{
        'bg-green-500 text-white': toastService.toast()?.type === 'success',
        'bg-red-500 text-white': toastService.toast()?.type === 'error',
        'bg-yellow-500 text-black': toastService.toast()?.type === 'warning',
        'bg-blue-500 text-white': toastService.toast()?.type === 'info'
      }"
    >
      {{ toastService.toast()?.message }}
    </div>
  `
})
export class ToastComponent implements OnInit {
  constructor(public toastService: ToastService) {}

  ngOnInit() {
    if (this.toastService.toast()) {
      setTimeout(() => this.toastService.clear(), 3000);
    }
  }
}
