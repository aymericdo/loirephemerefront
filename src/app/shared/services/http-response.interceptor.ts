import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse }   from '@angular/common/http';
import { Injectable } from "@angular/core"
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, of, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { AuthService } from 'src/app/auth/auth.service';

@Injectable()
export class HttpResponseInterceptor implements HttpInterceptor {
  blackList = [
    '/users/auth/login',
    '/users/confirm-email',
    '/users/confirm-recover-email',
    '/users/validate-recover-email-code',
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
          if (req.method !== 'GET' && !this.isInBlackList(req.url)) {
            this.message.create('success', 'Informations sauvegardées');
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
              this.authService.doLogout();
              break;
            }

            case 404: {
              this.router.navigate(['page', '404']);
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

  private isInBlackList(url: string): boolean {
    return this.blackList.some((route) => url.includes(route));
  }
}
