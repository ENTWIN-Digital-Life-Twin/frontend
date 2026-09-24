import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of, type Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type FormAssistType = 'TASK' | 'EVENT' | 'MEAL' | 'WORKOUT' | 'WELLNESS';

export interface FormSuggestion {
  field: string;
  value: string;
  label: string;
  reason?: string | null;
}

export interface FormAssistRequest {
  formType: FormAssistType;
  title?: string;
  category?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class FormAssistService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.aiApiUrl}/ai/form-suggest`;

  suggest(request: FormAssistRequest): Observable<FormSuggestion[]> {
    const title = request.title?.trim() ?? '';
    if (title.length < 3 && request.formType !== 'WELLNESS') {
      return of([]);
    }
    return this.http
      .post<{ suggestions?: FormSuggestion[] }>(this.url, {
        formType: request.formType,
        title: request.title ?? '',
        category: request.category ?? '',
        description: request.description ?? '',
      })
      .pipe(
        map((res) => res.suggestions ?? []),
        catchError(() => of([])),
      );
  }
}
