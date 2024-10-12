import { inject, Injectable, signal } from '@angular/core';
import {
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  user,
  updateProfile,
  signOut,
  UserCredential} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { UserInterface } from '../models/user.interface';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);

  login(email:string, password:string,): Observable<void> {

    //firebase retorna promesas, pero los convertimos a observables

    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then(() => {})

    return from(promise)
  }

  logout() : Observable<void> {
    const promise = signOut(this.firebaseAuth)
    .then(() => {})

    return from(promise)
  }

  
}