import { inject, Injectable, signal } from '@angular/core';
import {
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  user,
  updateProfile,
  signOut,
  UserCredential} from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import { UserInterface } from '../models/user.interface';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);


  constructor() {
    this.user$.pipe(
      map((user) => {
        if (user) {
          this.currentUserSig.set({ email: user.email } as UserInterface);
        } else {
          this.currentUserSig.set(undefined);
        }
      })
    ).subscribe();
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(() => {})
      .catch(error => console.error('Login failed', error));

    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth)
      .then(() => {})
      .catch(error => console.error('Logout failed', error));

    return from(promise);
  }

  getCurrentUserEmail(): string | null {
    return this.currentUserSig()?.email || null;
  }

  
}