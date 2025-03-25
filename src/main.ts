import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { ROUTES } from './app/route';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './app/interceptor/loading.interceptor';
import {
  FastXmlParserService,
  XmlParserService,
} from './app/services/xml-parser-service.service';
import { AppConfig } from './app/services/app-config.service';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(ROUTES),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideHttpClient(withInterceptors([loadingInterceptor])),
    { provide: XmlParserService, useClass: FastXmlParserService },
    { provide: AppConfig },
    // {
    //   provide: APP_INITIALIZER,
    //   deps: [AppConfig],
    //   multi: true,
    //   useFactory: (conf: AppConfig) => () => conf.load(),
    // },
    importProvidersFrom([BrowserAnimationsModule, MatDialogModule]),
  ],
});
