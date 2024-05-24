import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable()
export class AppConfig {
  private config: { [key: string]: string } = {};

  constructor(private http: HttpClient) {}

  /**
   * Use to get the data found in the second file (config file)
   */
  public getConfig(key: string): string {
    if (this.config[key] === undefined) {
      throw new Error(`Config key ${key} does not exist in config.js`);
    }
    return this.config[key];
  }

  /**
   * Loads "config.js" to get all env's variables
   */
  public load() {
    return new Promise((resolve, reject) => {
      this.http
        .get<{ [key: string]: string }[]>('./assets/config/config.js')
        .pipe(
          map((res) => res.reduce((acc, item) => ({ ...acc, ...item })), {})
        )
        .subscribe({
          next: (config) => {
            this.config = config;
            resolve(true);
          },
          error: (error) => {
            console.error('Error loading config');
            resolve(error);
          },
        });
    });
  }
}
