import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse }   from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { AuthService } from 'src/app/auth/auth.service';

@Injectable()
export class HttpResponseInterceptor implements HttpInterceptor {
  notifBlackList = [
    '/users/auth/login',
    '/users/confirm-email',
    '/users/confirm-recover-email',
    '/users/validate-recover-email-code',
    '/notification',
    '/payments/create-checkout-session',
  ];

  unauthorizedBlackList = [
    '/users/auth/login',
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(evt => {
        if (evt instanceof HttpResponse) {
          if (req.method !== 'GET' && !this.isInNotifBlackList(req.url)) {
            this.message.create('success', 'Informations sauvegardées', { nzPauseOnHover: false });
          }
        }
      }),
      catchError((error: any) => {
        if (error.error instanceof ErrorEvent) {
          // client-side error
          console.error(error.error.message);
        } else {
          // server-side error
          console.error(`Error Code: ${error.status}\nMessage: ${error.message}`);

          switch (error.status) {
            case 401: {
              if (!this.isIn401BlackList(req.url)) {
                this.authService.doLogout();
              }
              break;
            }

            default: {
              this.message.create('error', 'Une erreur est survenue');
            }
          }
        }

        return throwError(() => error);
      }),
    );
  }

  private isInNotifBlackList(url: string): boolean {
    return this.notifBlackList.some((route) => url.includes(route));
  }

  private isIn401BlackList(url: string): boolean {
    return this.unauthorizedBlackList.some((route) => url.includes(route));
  }
}
