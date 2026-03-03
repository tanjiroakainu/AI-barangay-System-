import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const BASE = 'https://generativelanguage.googleapis.com';

function getGeminiUrl(version: 'v1' | 'v1beta', model: string): string {
  return `${BASE}/${version}/models/${model}:generateContent`;
}

/** Fallback list: try in order until one responds without 404/not found. v1beta for newer models, v1 for gemini-pro. */
const FALLBACK_MODELS: Array<{ version: 'v1' | 'v1beta'; model: string }> = [
  { version: 'v1beta', model: 'gemini-2.5-flash' },
  { version: 'v1beta', model: 'gemini-2.0-flash' },
  { version: 'v1beta', model: 'gemini-1.5-flash' },
  { version: 'v1beta', model: 'gemini-1.5-flash-8b' },
  { version: 'v1beta', model: 'gemini-1.5-pro' },
  { version: 'v1beta', model: 'gemini-pro' },
  { version: 'v1', model: 'gemini-pro' },
];

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/** Response from Gemini generateContent API. */
interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string };
}

@Injectable({
  providedIn: 'root',
})
export class GeminiChatService {
  private get apiKey(): string {
    try {
      return (environment && environment.geminiApiKey) ? environment.geminiApiKey : '';
    } catch {
      return '';
    }
  }

  constructor(private http: HttpClient) {}

  /**
   * Send a single user message and get the model reply.
   * Optional: pass previous messages for context (multi-turn).
   */
  sendMessage(userMessage: string, history: ChatMessage[] = []): Observable<{ text: string; error?: string }> {
    if (!userMessage.trim()) {
      return of({ text: '' });
    }
    if (!this.apiKey) {
      return of({ text: '', error: 'Gemini API key is not configured.' });
    }

    const contextPrompt =
      'You are a helpful AI assistant. Answer any question the user asks—general knowledge, Barangay Nexus (certificates, appointments, portal), or anything else. Be concise and friendly. Do not refuse to answer off-topic questions; answer them helpfully.';

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = history
      .filter(m => m.text)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    const hasUserMessage = contents.some(c => c.role === 'user');
    if (!hasUserMessage) {
      contents.unshift({ role: 'user', parts: [{ text: contextPrompt }] });
    }
    contents.push({ role: 'user', parts: [{ text: userMessage.trim() }] });

    const body = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    const params = new HttpParams().set('key', this.apiKey);

    const doPost = (url: string) =>
      this.http.post<GeminiGenerateResponse>(url, body, { params }).pipe(
        map(res => {
          if (res.error) return { text: '' as string, error: res.error.message || 'API error' };
          const text = res.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
          return { text };
        }),
      );

    function isModelUnavailable(result: { error?: string }): boolean {
      const e = (result.error || '').toLowerCase();
      return (
        e.includes('not found') ||
        e.includes('not supported') ||
        e.includes('404') ||
        e.includes('invalid model')
      );
    }

    function tryNextModel(index: number): Observable<{ text: string; error?: string }> {
      if (index >= FALLBACK_MODELS.length) {
        return of({ text: '', error: 'No Gemini model available for this API key. Try another model or check your key.' });
      }
      const { version, model } = FALLBACK_MODELS[index];
      const url = getGeminiUrl(version, model);
      return doPost(url).pipe(
        switchMap(result => {
          if (result.error && isModelUnavailable(result)) {
            return tryNextModel(index + 1);
          }
          return of(result);
        }),
        catchError(err => {
          const status = err?.status;
          const msg = err?.message || err?.error?.message || '';
          if (status === 0 || msg.toLowerCase().includes('cors') || msg.toLowerCase().includes('network')) {
            return of({
              text: '',
              error: 'Network error. Check your connection and that the Gemini API allows requests from this site.',
            });
          }
          return tryNextModel(index + 1);
        }),
      );
    }

    return tryNextModel(0);
  }
}
