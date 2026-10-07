import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  text: string;
  type?: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 1;
  private _toasts = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this._toasts.asObservable();

  show(text: string, type: ToastMessage['type'] = 'info', timeout = 4000) {
    const msg: ToastMessage = { id: this.counter++, text, type };
    const cur = this._toasts.value.slice();
    cur.push(msg);
    this._toasts.next(cur);
    if (timeout > 0) setTimeout(() => this.dismiss(msg.id), timeout);
  }

  dismiss(id: number) {
    const cur = this._toasts.value.filter((t) => t.id !== id);
    this._toasts.next(cur);
  }
}
