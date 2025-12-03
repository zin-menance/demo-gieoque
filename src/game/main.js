import GameScene from './scenes/GameScene.js'
import MainMenu from './scenes/MainMenu.js'
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter', 
        matter: {
          gravity: { y: 2 },
          debug: false
        }
      },
    scene: [
      MainMenu,
      GameScene
    ],
    transition: {
      duration: 800,           // 0.8 second fade
      ease: 'Power2',
      mode: 'both'             // Fade out + fade in
    }
};

const StartGame = (parent) => {
  const game = new Game({ ...config, parent });
  
  window.game = game;

  return game;
};

export default StartGame;
