import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService, ChatMessage } from '../../../../core/services/ai-chat.service';

@Component({
    selector: 'app-ai-chat-widget',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ai-chat-widget.component.html',
    styleUrls: ['./ai-chat-widget.component.css']
})
export class AiChatWidgetComponent {
    visible = false;
    newMessage = '';
    messages: ChatMessage[] = [];
    isTyping = false; // Add typing indicator state

    private chatService = inject(AiChatService);

    toggle() {
        this.visible = !this.visible;
        if (this.visible && this.messages.length === 0) {
            this.messages.push({
                role: 'ai',
                text: 'Welcome! I am your AI Tutor. Which language do you prefer: English or Hinglish?',
                time: new Date()
            });
        }
    }

    send() {
        if (!this.newMessage.trim()) return;
        const userMsg: ChatMessage = { role: 'user', text: this.newMessage, time: new Date() };
        this.messages.push(userMsg);
        const userInput = this.newMessage;
        this.newMessage = '';
        this.isTyping = true; // Show loading indicator

        // Timeout to scroll down if we had a scroller reference, but Angular will update DOM
        this.chatService.sendMessage(userInput).subscribe({
            next: (resp: any) => {
                this.isTyping = false;
                const aiText = resp?.data?.reply || resp?.reply || resp?.content || (typeof resp === 'string' ? resp : 'Unable to parse response');
                const aiMsg: ChatMessage = { role: 'ai', text: aiText, time: new Date() };
                this.messages.push(aiMsg);
                this.chatService.addAiResponse(aiMsg.text);
            },
            error: () => {
                this.isTyping = false;
                const errMsg: ChatMessage = { role: 'ai', text: 'Error: unable to reach the server. Please try again.', time: new Date() };
                this.messages.push(errMsg);
            }
        });
    }
}
