import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { GeminiChatService, ChatMessage } from '../../../services/gemini-chat.service';

@Component({
  selector: 'app-ai-chatbot',
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.scss'],
})
export class AiChatbotComponent implements OnInit, OnDestroy {
  isOpen = false;
  showWidget = false;
  messages: ChatMessage[] = [];
  inputText = '';
  loading = false;
  private history: ChatMessage[] = [];
  private isLoggedIn = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private gemini: GeminiChatService,
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.updateVisibility(this.router.url);
    });
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateVisibility(e.url));
    this.updateVisibility(this.router.url);
  }

  ngOnDestroy(): void {}

  private updateVisibility(url: string): void {
    const isHome = url === '' || url === '/' || url === '/home' || url.startsWith('/home?');
    this.showWidget = isHome && !this.isLoggedIn;
    if (!this.showWidget) this.isOpen = false;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.messages = [
        { role: 'model', text: 'Hi! You can ask me anything—general knowledge, Barangay Nexus, certificates, appointments, or how to use the portal.' },
      ];
      this.history = [...this.messages];
    }
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.loading) return;
    this.inputText = '';
    this.messages.push({ role: 'user', text });
    this.history.push({ role: 'user', text });
    this.loading = true;
    this.gemini.sendMessage(text, this.history.slice(0, -1)).subscribe({
      next: res => {
        this.loading = false;
        if (res.error) {
          this.messages.push({ role: 'model', text: `Sorry, something went wrong: ${res.error}` });
        } else if (res.text) {
          this.messages.push({ role: 'model', text: res.text });
          this.history.push({ role: 'model', text: res.text });
        }
        this.scrollToBottom();
      },
      error: () => {
        this.loading = false;
        this.messages.push({ role: 'model', text: 'Sorry, I couldn\'t get a response. Please try again.' });
        this.scrollToBottom();
      },
    });
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = document.getElementById('ai-chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
