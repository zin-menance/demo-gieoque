import { Scene } from 'phaser';
import FortuneAPI from "../api/ServerAPI";
import RulesPopup from '../component/RulePopUp';
import ErrorPopup from '../component/ErrorPopup';


export default class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        //GAMESCENE
        this.load.image('tube', 'assets/fortune-slip/ONGQUE/OQ10.png');
        this.load.image('lid', 'assets/fortune-slip/ONGQUE/OQ2.png');
        this.load.image('slip', 'assets/fortune-slip/ONGQUE/OG1.png');
        this.load.image('slip1', 'assets/fortune-slip/ONGQUE/OG2.png');
        this.load.image('bloom', 'assets/fortune-slip/bloom.png');
        this.load.image('blossom', 'assets/fortune-slip/blossom.png');
        this.load.image('blossom1', 'assets/fortune-slip/blossom1.png');
        this.load.image('petal', 'assets/fortune-slip/petal.png');
        this.load.image('background', 'assets/fortune-slip/ONGQUE/ONGQUE1.jpg')
        //MAINMENU
        this.load.image('main-background', 'assets/fortune-slip/MHC/MHC1.jpg');
        this.load.image('mascot', 'assets/fortune-slip/MHC/MHC2.png');
        this.load.image('title', 'assets/fortune-slip/MHC/MHC3.png');
        this.load.image('decorate-tube', 'assets/fortune-slip/MHC/MHC4.png');
        this.load.image('decorate-voucher1', 'assets/fortune-slip/MHC/MHC5.png');
        this.load.image('decorate-voucher2', 'assets/fortune-slip/MHC/MHC6.png');
        this.load.image('decorate-voucher3', 'assets/fortune-slip/MHC/MHC8.png');
        this.load.image('decorate-bike', 'assets/fortune-slip/MHC/MHC7.png');
        this.load.image('decorate-slip', 'assets/fortune-slip/MHC/MHC9.png');
    }

    create() {
        const { width, height } = this.scale;

        // 1. Background (fade + slight scale)
        const bg = this.add.image(width / 2, height / 2, 'main-background')
            .setDepth(-10);

        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        bg.setScale(Math.max(scaleX, scaleY) * 1.1); // start a bit zoomed

        this.tweens.add({
            targets: bg,
            scaleX: Math.max(scaleX, scaleY),
            scaleY: Math.max(scaleX, scaleY),
            alpha: { from: 0, to: 1 },
            ease: 'Power2',
            duration: 1200
        });

        // this.createTopRightButtons();
        // this.rulesPopup = new RulesPopup(this);

        // We'll store elements that need to appear after background
        this.time.delayedCall(400, () => this.startDecorations(width, height));
        
    }

    bringInTube(width, height) {
        const tube = this.add.image(width + 600, this.mascotFinalY, 'decorate-tube')
            .setDepth(5)
            .setScale(0.3)
            .setAlpha(0);
        
        const tubeFinalX = width - (tube.width * tube.scaleX * 0.5);
        
        this.tweens.add({
            targets: tube,
            x: tubeFinalX,
            alpha: 1,
            scaleX: 0.3,
            scaleY: 0.3,
            rotation: 0,
            ease: 'Power3',
            duration: 1200,
            delay: 300,
            onStart: () => { tube.rotation = 0.8; },
            onComplete: () => {
                this.tweens.add({
                    targets: tube,
                    rotation: 0.06,
                    duration: 2400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
        }


    startDecorations(width, height) {
        // 1. Title 
        const title = this.add.image(width / 1.9, -300, 'title')
            .setDepth(10)
            .setScale(0.3);
    
        this.tweens.add({
            targets: title,
            y: height * 0.48,
            scaleX: 0.3,
            scaleY: 0.3,
            alpha: { from: 0, to: 1 },
            ease: 'Bounce.easeOut',
            duration: 1200,
            delay: 200,
            onComplete: () => {
                // Gentle float after landing
                this.tweens.add({
                    targets: title,
                    y: '+= 10',
                    duration: 2000,
                    yoyo: true,
                    repeat: -1
                });
            }
        });
    
        // 2. Mascot 
        const mascot = this.add.image(-400, height * 0.5, 'mascot')
            .setDepth(4)
            .setScale(0.3)
            .setAlpha(0);
    
        this.tweens.add({
            targets: mascot,
            x: width * 0.5,
            alpha: 1,
            rotation: 0,
            ease: 'Back.easeOut',
            duration: 1100,
            delay: 400,
            onStart: () => { mascot.rotation = -0.3; },
            onComplete: () => {
                this.mascotFinalX = mascot.x;
        this.mascotFinalY = mascot.y;
                // Cute breathing animation
                this.tweens.add({
                    targets: mascot,
                    scaleX: 0.32,
                    scaleY: 0.32,
                    duration: 1500,
                    yoyo: true,
                    repeat: -1
                });
                this.bringInTube(width, height);
            }
        });
       
    
        // 4. Voucher 1 - fly from top-right with flip
        this.flyVoucher('decorate-voucher1', width * 1.3, -200, width * 0.5, height * 0.5, 800);
    
        // 5. Voucher 2 - fly from bottom-left with bounce
        this.flyVoucher('decorate-voucher2', -300, height * 1.3, width * 0.5, height * 0.5, 900);
    
        // 6. Voucher 3 - fly from right with spiral
        this.flyVoucher('decorate-voucher3', width * 1.5, height * 0.9, width * 0.47, height * 0.5, 1000);
    
        // 7. Motorbike - zoom from bottom with trail effect
        const bike = this.add.image(width * 0.4, height * 0.5, 'decorate-bike')
            .setDepth(20)
            .setScale(0.3)
            .setAlpha(0);
    
        this.tweens.add({
            targets: bike,
            x: width * 0.46,
            y: height * 0.5,
            alpha: 1,
            scaleX: 0.3,
            scaleY: 0.3,
            ease: 'Back.easeOut',
            duration: 1300,
            delay: 1100,
            onComplete: () => {
                // Engine rumble shake
                this.tweens.add({
                    targets: bike,
                    y: '+= 8',
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    delay: 500
                });
            }
        });
    
        // 8. Red lucky slip - fall from top-right with flutter
        const slip = this.add.image(width + 300, -200, 'decorate-slip')
            .setDepth(8)
            .setScale(0.3)
            .setAlpha(0);
    
        this.tweens.add({
            targets: slip,
            x: width * 0.48,
            y: height * 0.5,
            alpha: 1,
            rotation: -0.1,
            ease: 'Power2',
            duration: 1400,
            delay: 1200,
            onComplete: () => {
                // Flutter effect
                this.tweens.add({
                    targets: slip,
                    rotation: 0.1,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1
                });
            }
        });
    
        // 9. "LẮC XÂM" Button - dramatic entrance last
        this.time.delayedCall(1600, () => {
            // Create container for the button
            const btnContainer = this.add.container(width / 2, height).setDepth(20);
            
            
            // Main button body with gradient effect (orange to red)
            const btnBody = this.add.graphics();
            // Bottom darker red
            btnBody.fillStyle(0xff3333, 1);
            btnBody.fillRoundedRect(-85, -35, 170, 60, 12);
            // Top lighter orange
            btnBody.fillStyle(0xff8844, 1);
            btnBody.fillRoundedRect(-85, -35, 170, 25, 12);
            // Middle transition
            btnBody.fillStyle(0xff5533, 0.8);
            btnBody.fillRoundedRect(-85, -20, 170, 20, 12);
            
            // Shine effect on top
            const shine = this.add.graphics();
            shine.fillStyle(0xffffff, 0.3);
            shine.fillRoundedRect(-70, -30, 140, 10, 8);
            
            // Text with shadow effect
            const textShadow = this.add.text(2, 0, 'Lắc Quẻ', {
                fontSize: '25px',
                color: '#000000',
                fontStyle: 'bold',
                fontFamily: '"Inter", sans-serif'
            }).setOrigin(0.5).setAlpha(0.3);
            
            const mainText = this.add.text(0, -2, 'Lắc Quẻ', {
                fontSize: '25px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: '"Inter", sans-serif'
            }).setOrigin(0.5);
            
            // Add all elements to container
            btnContainer.add([ btnBody, shine, textShadow, mainText]);
            
            // Make container interactive
            btnContainer.setSize(180, 60);
            btnContainer.setInteractive(
                new Phaser.Geom.Rectangle(0, -5, 180, 60),
                Phaser.Geom.Rectangle.Contains
            );
            
            // Set initial state
            btnContainer.setAlpha(0).setScale(0.5);
            
            // Store reference
            this.shakeBtn = btnContainer;
            
            // Interaction handlers
            btnContainer.on('pointerdown', async () => {
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    duration: 100,
                    yoyo: true
                });
            
                let apiResult = null;
            
                try {
                    apiResult = await FortuneAPI.shakeEvent();
            
                    if (apiResult && apiResult.status === 200) {
                        this.scene.start("GameScene", {
                            autoShake: true,
                            shakeData: apiResult.data  
                        });
                        return;
                    }
            
                } catch (err) {
                    console.error("API ERROR:", err);
                }
            
                ErrorPopup.show(this);
            });
            
            
            btnContainer.on('pointerover', () => {
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1.08,
                    scaleY: 1.08,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
            });
            
            btnContainer.on('pointerout', () => {
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
            });
            
            // Epic entrance animation
            this.tweens.add({
                targets: btnContainer,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                y: height - 50,
                ease: 'Back.easeOut',
                duration: 900,
                overshoot: 1.2,
                onComplete: () => {
                    // Gentle pulse animation
                    this.tweens.add({
                        targets: btnContainer,
                        scaleX: 1.06,
                        scaleY: 1.06,
                        duration: 1200,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                    
                    // Subtle shine animation
                    this.tweens.add({
                        targets: shine,
                        alpha: 0.5,
                        duration: 1500,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        });
    }
    
    // Enhanced flyVoucher with scale 0.3 and unique effects for each voucher
    flyVoucher(key, fromX, fromY, toX, toY, delay) {
        const voucher = this.add.image(fromX, fromY, key)
            .setDepth(25)
            .setScale(0.3)
            .setAlpha(0);
    
        let rotationStart = 0;
        let rotationEnd = 0;
        
        // Different effects for each voucher
        if (key === 'decorate-voucher1') {
            rotationStart = -1;
            rotationEnd = 0.3;
        } else if (key === 'decorate-voucher2') {
            rotationStart = 1;
            rotationEnd = -0.2;
        } else {
            rotationStart = 0.5;
            rotationEnd = 0;
        }
    
        this.tweens.add({
            targets: voucher,
            x: toX,
            y: toY,
            alpha: 1,
            rotation: rotationEnd,
            ease: 'Power2',
            duration: 1400,
            delay: delay,
            onStart: () => { voucher.rotation = rotationStart; },
            onComplete: () => {
                // Bounce landing + floating
                this.tweens.add({
                    targets: voucher,
                    y: '+= -15',
                    duration: 400,
                    yoyo: true,
                    ease: 'Power1',
                    repeat: 2,
                    onComplete: () => {
                        // Gentle floating
                        this.tweens.add({
                            targets: voucher,
                            y: '+= 8',
                            duration: 2500,
                            yoyo: true,
                            repeat: -1
                        });
                    }
                });
            }
        });
    }

    // Helper function for flying vouchers
    flyVoucher(key, fromX, fromY, toX, toY, delay) {
        const voucher = this.add.image(fromX, fromY, key)
            .setDepth(8)
            .setScale(0.3);

        this.tweens.add({
            targets: voucher,
            x: toX,
            y: toY,
            ease: 'Power2',
            duration: 1400,
            delay: delay,
            onComplete: () => {
                // Little bounce when they land
                this.tweens.add({
                    targets: voucher,
                    y: '+= -20',
                    duration: 300,
                    yoyo: true,
                    ease: 'Power1'
                });
            }
        });
    }

    createTopRightButtons() {
        const { width } = this.scale;
    
        // BUTTON STYLES
        const buttonRadius = 20;
        const deepRed = 0xc42f2f;     // Deep red
        const gold = 0xffd700;        // Gold border
    
        const makeCircleButton = (x, y, label) => {
            const container = this.add.container(x, y).setDepth(999);
    
            // Circle graphics
            const circle = this.add.graphics();
            circle.fillStyle(deepRed, 1);
            circle.fillCircle(0, 0, buttonRadius);
    
            circle.lineStyle(4, gold, 1);
            circle.strokeCircle(0, 0, buttonRadius);
    
            // Label
            const txt = this.add.text(0, 3, label, {
                fontFamily: "Material Icons",
                fontSize: "22px",
                color: "#FFD700",
                padding: { top: 6 }
            }).setOrigin(0.5);
          
    
            container.add([circle, txt]);
    
            // Make it interactable
            container.setSize(buttonRadius * 2, buttonRadius * 2);
            container.setInteractive();
    
            container.on('pointerout', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150,
                    ease: 'Back.easeOut'
                });
            });
    
            return container;
        };
    
        const helpBtn = makeCircleButton(width - 50, 50, "question_mark");
        const shareBtn = makeCircleButton(width - 110, 50, "share");

    
        // Actions
        helpBtn.on("pointerdown", () => {
            console.log("Share clicked");
            this.rulesPopup.show();
        });
    
        shareBtn.on("pointerdown", () => {
            console.log("Share clicked");
            // share logic
        });
    }
    
    
}