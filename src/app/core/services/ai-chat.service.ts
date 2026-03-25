import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  time: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/ai`;

  // State for chat history so it persists while navigating around lessons
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([
    { role: 'ai', text: 'Namaste! Main tumhara AI Tutor hu. 🌟 Aaj kya seekhna chahte ho? (You can ask in Hindi, English, Gujarati, or Hinglish!)', time: new Date() }
  ]);
  public messages$ = this.messagesSubject.asObservable();

  constructor() { }

  get messages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  sendMessage(text: string): Observable<any> {
    const token = localStorage.getItem('cp_token') || '';

    // 1. Add User message to state immediately
    const userMsg: ChatMessage = { role: 'user', text, time: new Date() };
    this.messagesSubject.next([...this.messages, userMsg]);

    // 2. Format history for backend (only required fields)
    // We send up to the last 10 messages for context window, excluding the newly added one which is sent in 'message' field explicitly
    const historyPayload = this.messages.slice(-11, -1).map(m => ({ role: m.role, text: m.text }));

    return this.http.post<any>(`${this.baseUrl}/chat`,
      { message: text, history: historyPayload },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  addAiResponse(text: string) {
    const aiMsg: ChatMessage = { role: 'ai', text, time: new Date() };
    this.messagesSubject.next([...this.messages, aiMsg]);
  }
}
