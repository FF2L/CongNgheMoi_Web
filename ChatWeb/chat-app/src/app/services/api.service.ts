import { Injectable } from '@angular/core';
import { apiUrl } from '../contants';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = apiUrl;

    getApiUrl(endpoint: string): string {
        return `${this.baseUrl}/${endpoint}`;
    }
}