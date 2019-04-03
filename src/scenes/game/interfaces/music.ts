import { AUDIO_SPRITE_KEY, Sounds } from '@game/models';

import { GameScene } from '../scene';

export enum MusicPlaylist {
  Song89 = '89',
}

export const PLAYLIST: MusicPlaylist[] = [MusicPlaylist.Song89];

export class SoundEffects {
  private music: Phaser.Sound.BaseSound;
  private track: number = 0;

  constructor(private scene: GameScene) {
    if (!this.scene.attractMode.isActive()) {
      this.playMusic();
    }
  }

  private playMusic() {
    try {
      if (this.music) {
        this.music.stop();
        this.music.destroy();
      }

      this.track = (this.track + 1) % PLAYLIST.length;

      this.music = this.scene.sound.add(PLAYLIST[this.track]);
      this.music.once('ended', () => this.playMusic());
      this.music.play();
    } catch (e) {}
  }

  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  resumeMusic() {
    if (this.music) {
      this.music.resume();
    }
  }

  playEffect(key: Sounds, onEnded: Function = () => {}) {
    const sound: any = this.scene.sound.addAudioSprite(AUDIO_SPRITE_KEY);

    sound.on('ended', () => {
      sound.destroy();
      onEnded();
    });

    sound.play(key);
  }

  setMusicRate(rate: number = 1) {
    if (this.music) {
      this.music.play('', { seek: 0, rate });
    }
  }
}