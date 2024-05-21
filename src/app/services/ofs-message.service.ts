import { Injectable, isDevMode } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { Message } from '../types/models/message';

@Injectable({
  providedIn: 'root',
})
export class OfsMessageService {
  message: any;
  messageSubject = new Subject<Message>();
  constructor() {
    fromEvent(window, 'message').subscribe((event: any) => {
      this.getPostMessageData(event);
    });
    this.sendOKMessage();
  }

  getMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  getPostMessageData(event: any) {
    if (typeof event.data !== 'undefined') {
      if (this.isJson(event.data)) {
        let data = JSON.parse(event.data);

        if (data.method) {
          this.log(
            window.location.host +
              ' <- ' +
              ' ' +
              this.getDomain(event.origin) +
              '\nMethod: ' +
              data.method,
            JSON.stringify(data, null, 4)
          );

          switch (data.method) {
            case 'open':
              this.pluginOpen(data);
              break;
            case 'updateResult':
              this.log(window.location.host + ' <- FINISHED UPDATING ', data);
              break;
            case 'error':
              data.errors = data.errors || { error: 'Unknown error' };
              this.showError(data.errors);
              break;
            default:
              alert('Unknown method');
              break;
          }
        } else {
          this.log(
            window.location.host +
              ' <- NO METHOD' +
              this.getDomain(event.origin),
            JSON.stringify(data),
            true,
            '#d62d20'
          );
        }
      } else {
        this.log(
          window.location.host + ' <- NOT JSON ' + this.getDomain(event.origin),
          true
        );
      }
    } else {
      this.log(
        window.location.host + ' <- NO DATA ' + this.getDomain(event.origin),
        true
      );
    }
  }

  sendPostMessageData(data: any) {
    if (document.referrer !== '') {
      this.log(
        window.location.host +
          ' -> ' +
          this.getDomain(document.referrer) +
          '\nMethod: ' +
          data.method +
          ' ',
        JSON.stringify(data, null, 1),
        true,
        '#008744'
      );

      parent.postMessage(
        JSON.stringify(data),
        this.getOrigin(document.referrer)
      );
    }
  }

  // Acciones en OFSC
  pluginOpen(message: any) {
    this.messageSubject.next(message);
    this.messageSubject.complete();
  }

  close() {
    let messageData = {
      apiVersion: 1,
      method: 'close',
    };

    this.sendPostMessageData(messageData);
  }

  closeAndUpdate(activityId: number, resourceId: number) {
    let messageData = {
      apiVersion: 1,
      method: 'close',
      activity: { aid: activityId },
    };

    this.sendPostMessageData(messageData);
  }

  // Aux
  debugMode: boolean = isDevMode();

  sendOKMessage() {
    let messageData = {
      apiVersion: 1,
      method: 'ready',
    };
    this.sendPostMessageData(messageData);
  }

  log(title: any, data: any, warning?: boolean, color?: string) {
    if (!this.debugMode) {
      return;
    }
    if (!color) {
      color = '#000FF5';
    }
    if (data) {
      console.groupCollapsed(
        '%c[API Plugin] ' + title,
        'color: ' +
          color +
          '; ' +
          (warning ? 'font-weight: bold;' : 'font-weight: normal;')
      );
      console.log('[API Plugin] ' + data);
      console.groupEnd();
    } else {
      console.log(
        '%c[API Plugin] ' + title,
        'color: ' + color + '; ' + (warning ? 'font-weight: bold;' : '')
      );
    }
  }

  isJson(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  getOrigin(url: any) {
    if (url != '') {
      if (url.indexOf('://') > -1) {
        return 'https://' + url.split('/')[2];
      } else {
        return url.split('/')[0];
      }
    }
  }

  getDomain(url: any) {
    if (url != '') {
      if (url.indexOf('://') > -1) {
        return url.split('/')[2];
      } else {
        return url.split('/')[0];
      }
    }
  }

  showError(errorData: any) {
    alert(JSON.stringify(errorData, null, 4));
  }
}
