import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private router: Router,
  ) {}

  get isLoggedIn(): boolean {
    const token: string = localStorage.getItem('access_token') as string;
    return token !== null ? true : false;
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  doLogout() {
    const removeToken = localStorage.removeItem('access_token');
    if (removeToken == null) {
      this.router.navigate(['page', 'login']);
    }
  }
}
