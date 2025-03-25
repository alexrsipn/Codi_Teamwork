import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OfsRestApiService {
  credentials: {user: string; pass: string} = {user: '', pass: ''};
  baseUrl = '';

  constructor(private readonly http: HttpClient) { }

  setUrl(url: string) {
    this.baseUrl = url;
    return this;
  }

  setCredentials(credentials: {user: string; pass: string}) {
    this.credentials = credentials;
    return this;
  }

  getAFileProperty(pathParams: {activityId: string; propertyLabel: string}) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${pathParams.activityId}/${pathParams.propertyLabel}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      Accept: 'image/png'
    });
    // const params = new HttpParams().set('language', 'es');
    return this.http.get<any>(endpoint, {headers, responseType: 'blob' as 'json'});
  }
}
