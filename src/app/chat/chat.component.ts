import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Add user message
    this.messages.push({
      role: 'user',
      content: this.userInput
    });

    const userMessage = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    // Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${environment.geminiApiKey}`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      contents: [{
        parts: [{
          text: userMessage
        }]
      }]
    };

    this.http.post<any>(apiUrl, body, { headers }).subscribe({
      next: (response) => {
        const assistantMessage = response.candidates[0].content.parts[0].text;
        this.messages.push({
          role: 'assistant',
          content: assistantMessage
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error calling Gemini API:', error);
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.'
        });
        this.isLoading = false;
      }
    });
  }

  clearChat() {
    this.messages = [];
  }
}
