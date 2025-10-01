import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GetAnActivityTypeResponse,
  GetAResourceResponse,
  GetChildResourcesResponse,
  UpdateAnActivityBodyParams
} from "../types/ofs-rest-api";
import {awsTokenResponse, tecnicosAdicionalesRequest} from "../types/aws";

@Injectable({
  providedIn: 'root'
})
export class OfsRestApiService {
  credentials: {user: string; pass: string} = {user: '', pass: ''};
  awsCredentials: {user: string, pass: string, awsUrlToken: string} = {user: '', pass: '', awsUrlToken: ''};
  baseUrl = '';
  awsToken = '';
  awsUrlTechnicians = '';

  constructor(private readonly http: HttpClient) { }

  setOfsUrl(url: string) {
    this.baseUrl = url;
    return this;
  }

  setAwsUrlTechnicians(url: string) {
    this.awsUrlTechnicians = url;
    return this;
  }

  setOfsCredentials(credentials: {user: string; pass: string}) {
    this.credentials = credentials;
    return this;
  }

  setAWSCredentials(awsCredentials: {user: string, pass: string, awsUrlToken: string}) {
    this.awsCredentials = awsCredentials;
    return this;
  }

  setAwsToken(token: string) {
    this.awsToken = token;
    return this;
  }

  getAwsToken() {
    const endpoint = this.awsCredentials.awsUrlToken;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.awsCredentials.user}:${this.awsCredentials.pass}`),
      'Content-Type': 'application/json',
    });
    const body = {
      "username": this.awsCredentials.user,
      "password": this.awsCredentials.pass
    };
    return this.http.post<awsTokenResponse>(endpoint, body, {headers: headers});
  }

  getAResource(resourceId: string) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/resources/${resourceId}?identifyResourceBy=resourceId`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json',
    })
    return this.http.get<GetAResourceResponse>(endpoint, {headers: headers});
  }

  getChildResources(resourceId: string) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/resources/${resourceId}/children?fields=resourceId,status,name,resourceType&expand=workSchedules`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json',
    });
    return this.http.get<GetChildResourcesResponse>(endpoint, {headers: headers});
  }

  incidentSendAdditionalTech(bodyParams: tecnicosAdicionalesRequest) {
    const endpoint = this.awsUrlTechnicians;
    const headers = new HttpHeaders({
      Authorization: this.awsToken,
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(endpoint, bodyParams, {headers: headers})
  }

  setAFileProperty(activityId: string, propertyLabel: string, file: Blob) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${activityId}/${propertyLabel}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'image/png',
    });
    return this.http.put<any>(endpoint, file, {headers: headers});
  }

  getAResourceRoute (resourceId: string, date: string) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/resources/${resourceId}/routes/${date}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json',
    });
    return this.http.get<any>(endpoint, {headers: headers});
  }

  updateAnActivity(activityId: number, bodyParams: UpdateAnActivityBodyParams) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${activityId}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json'
    });
    return this.http.patch<any>(endpoint, bodyParams, {headers: headers});
  }

  updateActivitySignRating(activityId: number, bodyParams: UpdateAnActivityBodyParams) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${activityId}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json'
    });
/*    const params = new HttpParams({
      fromObject: {
        ...bodyParams
      }
    })*/
    return this.http.patch<any>(endpoint, bodyParams, {headers: headers});
  }

  completeAnActivity(activityId: number) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${activityId}/custom-actions/complete`
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(endpoint, {}, {headers: headers});
  }

  getAnActivityType(activityType: string) {
    const endpoint = `${this.baseUrl}/rest/ofscMetadata/v1/activityTypes/${activityType}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'image/png',
    });
    return this.http.get<GetAnActivityTypeResponse>(endpoint, {headers: headers});
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
