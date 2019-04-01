import { FONT, TILE_SIZE } from '../../config';
import { Colors } from '../../helpers';
import { GAME_TIMEOUT, HURRY_TIME, TIME_FACTOR } from './constants';
import { GameScene } from './game-scene';

const MS_TO_S = 1000;
const FONT_SIZE = TILE_SIZE / 2;
const HUD_PADDING = TILE_SIZE * 2;
const SCORE_TEXT_PADDING = 5;
const TIME_TEXT_PADDING = 3;
const TIME_TEXT = 'TIME';

export class HUD {
  private playerText: Phaser.GameObjects.BitmapText;
  private scoreText: Phaser.GameObjects.BitmapText;
  private score: number = 0;

  private timeText: Phaser.GameObjects.BitmapText;
  private timerText: Phaser.GameObjects.BitmapText;
  private time: number = GAME_TIMEOUT * MS_TO_S;
  private displayedTime: number = GAME_TIMEOUT;
  private hurry: boolean = false;

  constructor(private scene: GameScene) {
    this.init();
  }

  private init() {
    this.playerText = this.scene.add
      .bitmapText(HUD_PADDING, TILE_SIZE / 2, FONT, this.scene.mario.playerType.toUpperCase(), FONT_SIZE)
      .setScrollFactor(0, 0);
    this.scoreText = this.scene.add
      .bitmapText(HUD_PADDING, TILE_SIZE, FONT, ''.padEnd(SCORE_TEXT_PADDING, '0'), FONT_SIZE)
      .setScrollFactor(0, 0);

    const { width } = this.scene.gameConfig();
    const timePosition = width - HUD_PADDING;

    this.timeText = this.scene.add
      .bitmapText(timePosition - TIME_TEXT.length * FONT_SIZE, TILE_SIZE / 2, FONT, TIME_TEXT, FONT_SIZE)
      .setScrollFactor(0, 0);
    this.timerText = this.scene.add
      .bitmapText(timePosition - TIME_TEXT_PADDING * FONT_SIZE, TILE_SIZE, FONT, ''.padEnd(TIME_TEXT_PADDING, '0'), FONT_SIZE)
      .setScrollFactor(0, 0);

    if (this.scene.attractMode.isActive()) {
      this.playerText.alpha = 0;
      this.scoreText.alpha = 0;
      this.timeText.alpha = 0;
      this.timerText.alpha = 0;
    }
  }

  update(delta: number) {
    this.time -= delta * TIME_FACTOR;

    if (this.time / MS_TO_S - this.displayedTime < 1) {
      this.displayedTime = Math.round(this.time / MS_TO_S);
      this.timerText.setText(String(this.displayedTime).padStart(TIME_TEXT_PADDING, '0'));

      // Hurry up if there is little time left
      if (this.displayedTime < HURRY_TIME && !this.hurry) {
        this.hurry = true;
        this.scene.soundEffects.pauseMusic();
        this.scene.soundEffects.playEffect('smb_warning', () => {
          this.scene.soundEffects.resumeMusic();
          this.scene.soundEffects.setMusicRate(1.5);
        });
      }

      if (this.hurry) {
        // Alternate colors each time
        if (this.displayedTime % 2) {
          this.timerText.setTint(Colors.Red);
        } else {
          this.timerText.clearTint();
        }
      }

      // Timeout
      if (this.displayedTime < 1) {
        this.scene.mario.die();
        this.hurry = false;
        this.timerText.clearTint();
        this.scene.soundEffects.setMusicRate(1);
        this.time = GAME_TIMEOUT * MS_TO_S;
        this.displayedTime = GAME_TIMEOUT;
      }
    }
  }

  updateScore(score: number) {
    this.score += score;
    this.scoreText.setText(String(this.score).padStart(SCORE_TEXT_PADDING, '0'));
  }
}