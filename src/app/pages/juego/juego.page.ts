import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, limit, orderBy, query } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { where } from 'firebase/firestore/lite';
import { AuthService } from 'src/app/services/auth.service';
import { users } from 'src/app/users';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './juego.page.html',
  styleUrls: ['./juego.page.css'],
  imports: [IonicModule, CommonModule]
})

export class GamePage {

  level: string = '';
  images: string[] = [];
  grid: { image: string, flipped: boolean, matched: boolean }[] = [];
  timer: any;
  timeElapsed = 0;
  pairsFound = 0;
  pairsNeeded = 0;
  firstCardIndex: number | null = null;
  highscores: any[] = [];
  isPlaying = false;
  isModalOpen = false;
  isLoadingScores = false;
  users = users;

  easyImages = ['assets/buttons/animals/1.png', 'assets/buttons/animals/2.png', 'assets/buttons/animals/3.png'];
  mediumImages = ['assets/buttons/tools/tools1.png', 'assets/buttons/tools/tools2.png', 'assets/buttons/tools/tools3.png', 'assets/buttons/tools/tools4.png', 'assets/buttons/tools/tools5.png'];
  hardImages = ['assets/buttons/fruits/fruits1.png', 'assets/buttons/fruits/fruits2.png', 'assets/buttons/fruits/fruits3.png', 'assets/buttons/fruits/fruits4.png', 'assets/buttons/fruits/fruits5.png', 'assets/buttons/fruits/fruits6.png', 'assets/buttons/fruits/fruits7.png', 'assets/buttons/fruits/fruits8.png'];

  constructor(private firestore: Firestore, private authService :AuthService, private router: Router) {}

 
  selectLevel(level: string) {
    this.level = level;
    this.setupGame();
  }

  setupGame() {
    this.isPlaying = true;
    this.timeElapsed = 0;
    this.pairsFound = 0;

    switch (this.level) {
      case 'fácil':
        this.images = [...this.easyImages];
        this.pairsNeeded = this.easyImages.length;
        break;
      case 'medio':
        this.images = [...this.mediumImages];
        this.pairsNeeded = this.mediumImages.length;
        break;
      case 'difícil':
        this.images = [...this.hardImages];
        this.pairsNeeded = this.hardImages.length;
        break;
    }

    this.images = [...this.images, ...this.images]; // Duplicar para formar pares
    this.images = this.shuffle(this.images);
    this.grid = this.images.map(image => ({ image, flipped: false, matched: false }));

    this.startTimer();
  }

  shuffle(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeElapsed++;
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  flipCard(index: number) {
    if (this.grid[index].flipped || this.grid[index].matched) return;

    this.grid[index].flipped = true;

    if (this.firstCardIndex === null) {
      this.firstCardIndex = index;
    } else {
      const firstCard = this.grid[this.firstCardIndex];
      const secondCard = this.grid[index];

      if (firstCard.image === secondCard.image) {
        firstCard.matched = true;
        secondCard.matched = true;
        this.pairsFound++;
      } else {
        setTimeout(() => {
          firstCard.flipped = false;
          secondCard.flipped = false;
        }, 1000);
      }

      this.firstCardIndex = null;

      if (this.pairsFound === this.pairsNeeded) {
        this.stopTimer();
        this.saveResult();
        this.isPlaying = false;
      }
    }
  }

  async saveResult() {
    const scoresCollection = collection(this.firestore, 'scores');
    await addDoc(scoresCollection, {
      // user: this.authService.currentUserSig().email,
      time: this.timeElapsed,
      level: this.level,
      date: new Date(),
      user: users.find(user => user.email === this.authService.getCurrentUserEmail()).perfil
    });
    this.loadHighscores();
  }

  async loadHighscores() {
    this.isLoadingScores = true;  // Empieza a cargar
    const scoresCollection = collection(this.firestore, 'scores');
    const q = query(scoresCollection, orderBy('time', 'asc'), limit(5));
    const querySnapshot = await getDocs(q);
    
    this.highscores = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data && data['time'] !== undefined && data['date'] && data['level'] == this.level) {
        this.highscores.push(data);
      } else {
        console.warn('Datos de puntaje faltantes o inválidos:', data);
      }
    });
    this.isLoadingScores = false;  // Termina de cargar
  }
  
  async openModal() {
    await this.loadHighscores(); // Carga los datos antes de abrir
    this.isModalOpen = true;
  }

  logout() { 
    this.authService.logout()
    this.router.navigateByUrl('/login')
  }
  

  closeModal() {
    this.isModalOpen = false;
  }
}
