import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastSubject = new BehaviorSubject<Toast | null>(null);

    get toast$(): Observable<Toast | null> {
        return this.toastSubject.asObservable();
    }

    show(message: string, type: 'success' | 'error' | 'info' = 'info') {
        this.toastSubject.next({ message, type });
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.clear();
        }, 3000);
    }

    clear() {
        this.toastSubject.next(null);
    }
}
