import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, limit, orderBy, query } from '@angular/fire/firestore';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './juego.page.html',
  styleUrls: ['./juego.page.css'],
  imports: [IonicModule, CommonModule]
})
export class GamePage {
  level: string | null = null;
  images: string[] = [];
  grid: { image: string, flipped: boolean, matched: boolean }[] = [];
  timer: any;
  timeElapsed = 0;
  pairsFound = 0;
  pairsNeeded = 0;
  firstCardIndex: number | null = null;
  highscores: any[] = [];
  isPlaying = false;

  easyImages = ['assets/buttons/animals/1.png', 'assets/buttons/animals/2.png', 'assets/buttons/animals/3.png'];
  mediumImages = ['assets/buttons/colors/1.png', 'assets/buttons/colors/2.png', 'assets/buttons/colors/3.png', 'assets/buttons/colors/4.png', 'assets/buttons/colors/5.png'];
  hardImages = ['assets/buttons/colors/1.png', 'assets/buttons/colors/2.png', 'assets/buttons/colors/3.png', 'assets/buttons/colors/4.png', 'assets/buttons/colors/5.png', 'assets/buttons/animals/1.png', 'assets/buttons/animals/2.png', 'assets/buttons/animals/3.png'];

  constructor(private firestore: Firestore) {}

  selectLevel(level: string) {
    this.level = level;
    this.setupGame();
  }

  setupGame() {
    this.isPlaying = true;
    this.timeElapsed = 0;
    this.pairsFound = 0;

    switch (this.level) {
      case 'easy':
        this.images = [...this.easyImages];
        this.pairsNeeded = this.easyImages.length;
        break;
      case 'medium':
        this.images = [...this.mediumImages];
        this.pairsNeeded = this.mediumImages.length;
        break;
      case 'hard':
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
      time: this.timeElapsed,
      level: this.level,
      date: new Date()
    });
    this.loadHighscores();
  }

  async loadHighscores() {
    const scoresCollection = collection(this.firestore, 'scores');
    const q = query(scoresCollection, orderBy('time', 'asc'), limit(5));
    const querySnapshot = await getDocs(q);
    this.highscores = [];
    querySnapshot.forEach((doc) => {
      this.highscores.push(doc.data());
    });
  }
}
