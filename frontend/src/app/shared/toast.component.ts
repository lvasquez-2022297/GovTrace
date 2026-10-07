import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts" class="toast" [ngClass]="t.type">
        <div class="toast-text">{{ t.text }}</div>
        <button class="toast-close" (click)="dismiss(t.id)">×</button>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  toasts: ToastMessage[] = [];
  constructor(private toast: ToastService) {
    this.toast.toasts$.subscribe((list) => (this.toasts = list));
  }

  dismiss(id: number) { this.toast.dismiss(id); }
}
