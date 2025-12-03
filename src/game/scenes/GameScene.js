import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene', physics: { default: 'matter' } });
  }

 

create(data) {
  this.cameras.main.fadeIn(800, 255, 250, 240);
  this.autoShake = data?.autoShake || false;
  const { width, height } = this.scale;

  const bg = this.add.image(width / 2, height / 2, 'background')
  .setOrigin(0.5)
  .setDepth(-10);  

  const scaleX = width / bg.width;
  const scaleY = height / bg.height;
  bg.setScale(Math.max(scaleX, scaleY));
  const group = this.matter.world.nextGroup(true);
  this.tubeStartX = width / 2;
  this.tubeStartY = height / 2 + 140;
  this.wallInset = 10;
  this.bottomInset = 5;

  const shake = data?.shakeData;
  const imgURL = shake?.data?.image_url;

  if (imgURL) {
      this.preloadedResultImg = new Image();
      this.preloadedResultImg.src = imgURL; 
  }


  // Enable Matter Physics with custom settings
  this.matter.world.setGravity(0, 0);

  // Tube visual
  this.tube = this.add.image(this.tubeStartX, this.tubeStartY, 'tube')
    .setScale(0.35)
    .setDepth(20);  

  // Debug: Tube bounds
  // this.tubeDebugGraphics = this.add.graphics();
  // this.tubeDebugGraphics.setDepth(25);

  const tubeWidth = this.tube.width * this.tube.scaleX;
  const tubeHeight = this.tube.height * this.tube.scaleY;

  // Create compound body for tube (left wall, right wall, bottom)
  const Bodies = Phaser.Physics.Matter.Matter.Bodies;
  const Body = Phaser.Physics.Matter.Matter.Body;
  
  const wallThickness = 8;

  // Left wall
  this.leftWall = Bodies.rectangle(
    this.tubeStartX - tubeWidth/2 + wallThickness/2 + this.wallInset,
    this.tubeStartY,
    wallThickness,
    tubeHeight,
    { isStatic: true, label: 'leftWall' }
  );
  
  // Right wall
  this.rightWall = Bodies.rectangle(
    this.tubeStartX + tubeWidth/2 - wallThickness/2 - this.wallInset,
    this.tubeStartY,
    wallThickness,
    tubeHeight,
    { isStatic: true, label: 'rightWall' }
  );
  
  // Bottom wall
  this.bottomWall = Bodies.rectangle(
    this.tubeStartX,
    this.tubeStartY + tubeHeight - wallThickness/2 - this.bottomInset,
    tubeWidth,
    wallThickness,
    { isStatic: true, label: 'bottomWall' }
  );
  
  // Add walls to world
  this.matter.world.add([this.leftWall, this.rightWall, this.bottomWall]);
  
  // Store tube container reference
  this.tubeContainer = { leftWall: this.leftWall, rightWall: this.rightWall, bottomWall: this.bottomWall };
  this.tubeWidth = tubeWidth;
  this.tubeHeight = tubeHeight;

  // Create Lid 
  this.lid = this.add.image(this.tubeStartX, this.tubeStartY - this.tubeHeight / 2 , 'lid')
  .setScale(0.35)
  .setDepth(8);

  // Create slips with physics

  this.slips = [];
  this.slipBodies = [];
  this.slipDebugGraphics = [];

  const totalSlips = 7;
  const baseY = this.tubeStartY - this.tubeHeight / 2;

  // Predefined angles
  const angles = [0,0, 0, 0, 0,0,0,0];
  const startYs = [0, -50, 20, -20, 30, 17, -40, 14];
  const startXs = [-90, -66, -40, 5, 30, 100, 75, 200];

  // Array of all slip texture keys
  const slipKeys = ['slip', 'slip1'];

  for (let i = 0; i < totalSlips; i++) {

  // pick a slip texture based on index
  const slipKey = slipKeys[i % slipKeys.length];

  const x = this.tubeStartX + startXs[i];
  const y = baseY + startYs[i];


  const angle = angles[i] || 0;

  // Create sprite (now using mixed slip textures)
  const slipSprite = this.add.image(x, y, slipKey)
  .setScale(0.35)
  .setRotation(Phaser.Math.DegToRad(angle))
  .setDepth(8 + i)
  .setAlpha(0.95 + i * 0.008);

  // REAL rendered size
  const realWidth = slipSprite.displayWidth;
  const realHeight = slipSprite.displayHeight;

  // Create physics body that EXACTLY matches sprite
  const slipBody = this.matter.add.rectangle(x, y, realWidth, realHeight, {
      collisionFilter: { group: group },
      restitution: 0.1,
      friction: 0.9,
      frictionAir: 0.05,
      density: 0.0008,
      angle: Phaser.Math.DegToRad(angle),
      label: 'slip'
  });

      const slipDebug = this.add.graphics().setDepth(15 + i * 0.5);

      this.slips.push(slipSprite);
      this.slipBodies.push(slipBody);
      // this.slipDebugGraphics.push(slipDebug);
  }



  this.slipsFrozen = true;
  this.time.delayedCall(200, () => {
    this.slipBodies.forEach(body => {
      Phaser.Physics.Matter.Matter.Body.setStatic(body, false);
    });
    this.slipsFrozen = false;
  });

  if (this.autoShake) {
    this.time.delayedCall(300, () => {  
      this.startShaking();
    });
  }

  this.isShaking = false;
}

update() {
  // Sync sprites with physics bodies
  this.slipBodies.forEach((body, i) => {
    this.slips[i].setPosition(body.position.x, body.position.y);
    this.slips[i].setRotation(body.angle);
    
    // Update debug lines for slips
    // const graphics = this.slipDebugGraphics[i];
    // graphics.clear();
    // graphics.lineStyle(2, 0x00ff00, 1);
    
    // Draw rectangle around slip body
    // const vertices = body.vertices;
    // graphics.beginPath();
    // graphics.moveTo(vertices[0].x, vertices[0].y);
    // for (let j = 1; j < vertices.length; j++) {
    //   graphics.lineTo(vertices[j].x, vertices[j].y);
    // }
    // graphics.closePath();
    // graphics.strokePath();
  });
  
  // Update debug lines for tube walls
  // this.tubeDebugGraphics.clear();
  // this.tubeDebugGraphics.lineStyle(3, 0xff0000, 1);
  
  // Draw tube bounds
  // const tubeBounds = this.tube.getBounds();
  // this.tubeDebugGraphics.strokeRect(tubeBounds.x, tubeBounds.y, tubeBounds.width, tubeBounds.height);
  
  // Draw physics walls
  // this.tubeDebugGraphics.lineStyle(3, 0x00ffff, 1);
  // [this.leftWall, this.rightWall, this.bottomWall].forEach(wall => {
  //   const vertices = wall.vertices;
  //   this.tubeDebugGraphics.beginPath();
  //   this.tubeDebugGraphics.moveTo(vertices[0].x, vertices[0].y);
  //   for (let j = 1; j < vertices.length; j++) {
  //     this.tubeDebugGraphics.lineTo(vertices[j].x, vertices[j].y);
  //   }
  //   this.tubeDebugGraphics.closePath();
  //   this.tubeDebugGraphics.strokePath();
  // });
}

createMistBoom(x, y) {
    const size = 360;
    const rt = this.add.renderTexture(x, y, size, size).setBlendMode('ADD');
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    const cx = size / 2;
    const cy = size / 2;

    const layers = 36;

    for (let i = 0; i < layers; i++) {
        g.clear();

        // Radius grows outward smoothly
        const baseRadius = i * 4;

        // Noise strength per layer (more natural fog)
        const noiseStrength = Phaser.Math.FloatBetween(8, 20);

        // Very soft alpha = mist
        const alpha = Phaser.Math.FloatBetween(0.01, 0.04);

        g.fillStyle(0xffffff, alpha);
        g.beginPath();

        // Smooth circular sampling but with noisy radius
        const points = 80;

        for (let p = 0; p <= points; p++) {
            const angle = (Math.PI * 2 * p) / points;

            // Generate angle-based turbulence
            const turbulence =
                Math.sin(angle * 3 + i * 0.5) * 6 +
                Math.cos(angle * 5 + i * 0.3) * 4 +
                Phaser.Math.FloatBetween(-noiseStrength, noiseStrength);

            const r = baseRadius + turbulence;

            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;

            if (p === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
        }

        g.closePath();
        g.fillPath();
        rt.draw(g);
    }

    // Starting small — grows outward
    rt.setTint(0xf2df74)
      .setAlpha(0.38)
      .setScale(0.1)     
      .setOrigin(0.5);

    // Animate boom (inside → outward)
    this.tweens.add({
        targets: rt,
        scale: 3.5,    
        alpha: 0,
        duration: 3000,  
        ease: 'Cubic.out',
        onComplete: () => rt.destroy()
    });

    const textures = ['bloom', 'blossom', 'blossom1', 'petal'];
    textures.forEach(key => {
    const explosion = this.add.particles(x, y, key, {
      speed: { min: 400, max: 250 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 3000,
      quantity: 25,
      gravityY: 150,
      blendMode: Phaser.BlendModes.NORMAL
    });

    explosion.explode();
    });
}

createPetalFloat(x, y) {
  const petalTextures = ['bloom', 'blossom', 'blossom1', 'petal'];
  const petalOffsetsX = [-20, -10, -4, 4, 20];
  const petalOffsetsY = [40, 50, 70, 120, 140];
  for (let i = 0; i < 5; i++) {

      const texture = Phaser.Utils.Array.GetRandom(petalTextures);

      // Much wider scatter
      const spawnX = x + petalOffsetsX[i];
      const spawnY = y + petalOffsetsY[i];

      const petal = this.add.image(spawnX, spawnY, texture)
          .setScale(0.15)  
          .setRotation(Phaser.Math.FloatBetween(-0.5, 0.5))
          .setAlpha(0)
          .setDepth(21)

      const fallY  = Phaser.Math.Between(90, 140);
      const delay  = Phaser.Math.Between(-20, 250);   

      // Fade in soft
      this.tweens.add({
          targets: petal,
          alpha: Phaser.Math.FloatBetween(0.5, 0.9),
          duration: 300,
          delay
      });

      // Float + drift + rotation
      this.tweens.add({
          targets: petal,
          x: petal.x,
          y: petal.y + fallY,
          angle: Phaser.Math.Between(-90, 90),
          duration: Phaser.Math.Between(1200, 1700),
          delay,
          ease: "Sine.inOut",
          onComplete: () => petal.destroy()
      });
  }
}

createUpwardGlow(x, y) {
  const particleOffsetsX = [-20, -10, -30, -2, 0];
  const particleOffsetsY = [40, 120, 170];

  for (let i = 0; i < 3; i++) {

    this.time.delayedCall(i * 500, () => { 

      const startX = x + particleOffsetsX[i];
      const startY = y + particleOffsetsY[i];
      const size = Phaser.Math.FloatBetween(1.2, 2.2);

      const p = this.add.circle(startX, startY, size, 0xf2df74, 1)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(30)
        .setAlpha(1); 

      const baseAmp   = 40;
      const smallAmp  = 30;
      const frequency = 1;
      const travel    = 150;

      this.tweens.add({
        targets: p,
        duration: 6000,
        alpha: { from: 1, to: 0 },
        y: startY - travel,
        scale: { from: 1, to: 1.7 },
        ease: "Sine.inOut",

        onUpdate: (tw) => {
          const t = tw.progress;

          // serpentine “snake-like” horizontal wave
          const wave1 = Math.sin(t * Math.PI * frequency) * baseAmp;
          const wave2 = Math.sin(t * Math.PI * 6) * smallAmp;
          const noise = Math.sin(t * 12 + i) * 1.2;

          p.x = startX + wave1 + wave2 + noise;
          p.scaleY = 1 + t * 0.7;
        },

        onComplete: () => p.destroy()
      });

    });
  }
}

  startShaking() {
    if (this.isShaking || this.slipsFrozen) return;
    this.isShaking = true;

    const centerX = this.tubeStartX;
    const centerY = this.tubeStartY;

    const Body = Phaser.Physics.Matter.Matter.Body;

    // Store initial tube position and rotation
    this.initialTubeX = this.tube.x;
    this.initialTubeY = this.tube.y;
    this.initialTubeAngle = this.tube.angle;

    // Store initial offsets of slips relative to tube center
    this.initialSlipOffsets = this.slipBodies.map((body) => {
        return {
            x: body.position.x - this.tube.x,
            y: body.position.y - this.tube.y,
            angle: body.angle
        };
    });

    // Phase 1: Tilt right (0-250ms)
    this.tweens.add({
        targets: this.tube,
        angle: 10,
        x: centerX + 10,
        y: centerY,
        duration: 250,
        ease: 'Power2.out',
        onUpdate: () => {
          this.matter.world.engine.world.gravity.y = 2;
            this.updateTubeWalls(this.tube.x, this.tube.y, this.tube.angle);
            this.moveSlipsWithTube(this.tube.x, this.tube.y, this.tube.angle, this.initialTubeX, this.initialTubeY, this.initialTubeAngle);
            this.syncLidWithTube();
        }
    });

    // Phase 2: Tilt left (250-550ms)
    this.time.delayedCall(250, () => {
        this.tweens.add({
            targets: this.tube,
            angle: -15,
            x: centerX - 10,
            y: centerY,
            duration: 300,
            ease: 'Power2.inOut',
            onUpdate: () => {
                this.updateTubeWalls(this.tube.x, this.tube.y, this.tube.angle);
                this.moveSlipsWithTube(this.tube.x, this.tube.y, this.tube.angle,
                                       this.initialTubeX, this.initialTubeY, this.initialTubeAngle);
                this.syncLidWithTube();
            }
        });
    });

    // Phase 3: Return to center (550-1050ms)
    this.time.delayedCall(550, () => {
        this.tweens.add({
            targets: this.tube,
            angle: 0,
            x: centerX,
            y: centerY,
            duration: 500,
            ease: 'Power2.out',
            onUpdate: () => {
                this.updateTubeWalls(this.tube.x, this.tube.y, this.tube.angle);
                this.moveSlipsWithTube(this.tube.x, this.tube.y, this.tube.angle,
                                       this.initialTubeX, this.initialTubeY, this.initialTubeAngle);
                this.syncLidWithTube();                       
            }
        });
    });

    // Phase 4: Tap/Bounce (1050-1290ms)
    this.time.delayedCall(1050, () => {
        this.tweens.add({
            targets: this.tube,
            y: centerY - 30,
            duration: 120,
            yoyo: true,
            repeat: 1,
            ease: 'Sine.out',
            onUpdate: () => {
                this.updateTubeWalls(this.tube.x, this.tube.y, this.tube.angle);
                this.moveSlipsWithTube(this.tube.x, this.tube.y, this.tube.angle,
                                       this.initialTubeX, this.initialTubeY, this.initialTubeAngle);
                this.syncLidWithTube();
            },
            onYoyo: () => {
             
                this.slipBodies.forEach(body => {
                    Body.applyForce(body, body.position, { x: 0, y: -0.0015 });
                });
            }
            
        });
        this.matter.world.engine.world.gravity.y = 0;
    });

  // Choose one slip to rise after shaking settles      
  this.time.delayedCall(2000, () => {

    const chosenIndex = Phaser.Math.Between(0, 5);
    const chosenBody = this.slipBodies[chosenIndex];
    const chosenSprite = this.slips[chosenIndex];
    let effectsTriggered = false;
  
    const Body = Phaser.Physics.Matter.Matter.Body;
  
    this.slipBodies.forEach((body, i) => {
      if (i !== chosenIndex) Body.setStatic(body, true);
    });
  
   
    
    // 🚀 Rocket Up
    const rocketHeight = 800;
  
    this.tweens.add({
      targets: chosenSprite,
      y: chosenSprite.y - rocketHeight,
      duration: 600,
      ease: 'Power2.out',
      onUpdate: () =>
        Body.setPosition(chosenBody, { x: chosenSprite.x, y: chosenSprite.y }),
      onComplete: () => {

        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;
  
        this.tweens.add({
          targets: chosenSprite,
          x: cx,
          y: cy,
          scale: 0.3,
          duration: 600,
          ease: 'Power2.inOut',
          onUpdate: (tween) => {
            Body.setPosition(chosenBody, { x: chosenSprite.x, y: chosenSprite.y });
        
            // if (!effectsTriggered && tween.progress > 0.75) {
            //   effectsTriggered = true;
        
            //   this.createPetalFloat(
            //     cx,
            //     chosenSprite.y + chosenSprite.displayHeight / 2
            //   );
        
            //   this.createUpwardGlow(cx,
            //     chosenSprite.y + chosenSprite.displayHeight / 2);
        
             
            // }
          },
          onComplete: () => {    
            this.createMistBoom(cx, cy - 80);      
              this.tweens.add({
                targets: { y: chosenBody.position.y },
                y: chosenBody.position.y - 20,
                duration: 800,
                ease: 'Sine.inOut',
            
                onUpdate: (tween, target) => {
                  Body.setPosition(chosenBody, {
                    x: chosenBody.position.x,
                    y: target.y
                  });
            
                  chosenSprite.x = chosenBody.position.x;
                  chosenSprite.y = chosenBody.position.y;
                },
            
                onComplete: () => this.showResult()
             
            });
            
          }
        });
      }
    });
  
    
    // Fade out other slips + tube
    this.slips.forEach((sprite, i) => {
      if (i !== chosenIndex) {
        const body = this.slipBodies[i];
        this.tweens.add({
          targets: sprite,
          y: sprite.y + 200,
          alpha: 0,
          duration: 800,
          ease: 'Power2.in',
          onUpdate: () => Body.setPosition(body, { x: sprite.x, y: sprite.y })
        });
      }
    });
  
    this.tweens.add({
      targets: [this.tube, this.lid],
      y: '+=200',
      alpha: 0,
      duration: 800,
      ease: 'Power2.in',
      onComplete: () =>
        this.matter.world.remove([this.leftWall, this.rightWall, this.bottomWall])
    });
  
  });
  
}

syncLidWithTube() {
  const tube = this.tube;
  const lid = this.lid;

  const angle = tube.rotation;

  const halfTubeW = tube.displayWidth / 2;
  const halfTubeH = tube.displayHeight / 2;
  const halfLidW = lid.displayWidth / 2;
  const halfLidH = lid.displayHeight / 2;

  const rimInset = 6;
  const tiltFollowFactor = 0.25;
  const manualLocalCorrectionX = 2;
  const manualLocalCorrectionY = -13;

  const localX = 0;
  const localY = -halfTubeH + halfLidH - rimInset;

  const extraX = Math.sin(angle) * (halfTubeW - halfLidW) * tiltFollowFactor;
  const finalLocalX = localX + extraX + manualLocalCorrectionX;
  const finalLocalY = localY + manualLocalCorrectionY;

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const worldX = tube.x + finalLocalX * cos - finalLocalY * sin;
  const worldY = tube.y + finalLocalX * sin + finalLocalY * cos;

  lid.setPosition(worldX, worldY);
  lid.setRotation(angle);
}

updateTubeWalls(tubeX, tubeY, tubeAngle) {
  const Body = Phaser.Physics.Matter.Matter.Body;
  const angleRad = Phaser.Math.DegToRad(tubeAngle);
  
  const wallThickness = 8;
  const halfWidth = this.tubeWidth / 2;
  const halfHeight = this.tubeHeight / 2;
  
  // Calculate rotated positions using proper 2D rotation
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  
  // Left wall - offset from center in local space: (-halfWidth + wallThickness/2, 0)
  const leftLocalX = -halfWidth + wallThickness/2 + this.wallInset;
  const leftLocalY = 0;
  Body.setPosition(this.leftWall, {
    x: tubeX + leftLocalX * cos - leftLocalY * sin,
    y: tubeY + leftLocalX * sin + leftLocalY * cos
  });
  Body.setAngle(this.leftWall, angleRad);
  
  // Right wall - offset from center in local space: (halfWidth - wallThickness/2, 0)
  const rightLocalX = halfWidth - wallThickness/2 - this.wallInset;
  const rightLocalY = 0;
  Body.setPosition(this.rightWall, {
    x: tubeX + rightLocalX * cos - rightLocalY * sin,
    y: tubeY + rightLocalX * sin + rightLocalY * cos
  });
  Body.setAngle(this.rightWall, angleRad);
  
  // Bottom wall - offset from center in local space: (0, halfHeight - wallThickness/2)
  const bottomLocalX = 0;
  const bottomLocalY = halfHeight - wallThickness/2 - this.bottomInset;
  Body.setPosition(this.bottomWall, {
    x: tubeX + bottomLocalX * cos - bottomLocalY * sin,
    y: tubeY + bottomLocalX * sin + bottomLocalY * cos
  });
  Body.setAngle(this.bottomWall, angleRad);
}

moveSlipsWithTube(tubeX, tubeY, tubeAngle, initialTubeX, initialTubeY, initialTubeAngle) {
  const Body = Phaser.Physics.Matter.Matter.Body;
  const angleRad = Phaser.Math.DegToRad(tubeAngle);
  const initialAngleRad = Phaser.Math.DegToRad(initialTubeAngle);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  
  // Calculate how much the tube has rotated from initial position
  const tubeRotationDelta = angleRad - initialAngleRad;
  
  this.slipBodies.forEach((body, i) => {
    // Calculate where slip should be based on tube's rotation
    const offset = this.initialSlipOffsets[i];
    const rotatedX = offset.x * cos - offset.y * sin;
    const rotatedY = offset.x * sin + offset.y * cos;
    
    const targetX = tubeX + rotatedX;
    const targetY = tubeY + rotatedY;
    
    // Smoothly move slip towards target position (simulates container pushing)
    const currentX = body.position.x;
    const currentY = body.position.y;
    
    const pushForce = 0.08; // How strongly tube "carries" the slips
    Body.setVelocity(body, {
      x: (targetX - currentX) * pushForce,
      y: (targetY - currentY) * pushForce + body.velocity.y * 0.5 // Keep some vertical velocity
    });
    
    // Rotate slips to match tube rotation
    const targetSlipAngle = offset.angle + tubeRotationDelta;
    const currentAngle = body.angle;
    const angleDiff = targetSlipAngle - currentAngle;
    
    // Smoothly rotate towards target angle
    Body.setAngularVelocity(body, angleDiff * 0.4);
    
    // Apply tilt-based sliding force (gravity component)
    const tiltForce = Math.sin(angleRad) * 0.6;
    Body.applyForce(body, body.position, { x: tiltForce, y: 0 });
  });
}

showResult() {
  const { width, height } = this.scale;
  const shake = this.scene.settings.data.shakeData;
  const msg = shake.data?.message || "";

  // Dark overlay
  this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setDepth(200);

  // Use the preloaded image
  const img = this.preloadedResultImg;
  img.style.position = 'absolute';
  img.style.left = `${this.game.canvas.offsetLeft}px`;
  img.style.top = `${this.game.canvas.offsetTop}px`;
  img.style.width = `${width}px`;
  img.style.height = `${height}px`;
  img.style.objectFit = 'contain';
  img.style.zIndex = 201;

  document.body.appendChild(img);

  // Optional text
  const text = document.createElement('div');
text.innerText = msg;
text.style.position = 'absolute';
text.style.left = `${this.game.canvas.offsetLeft}px`;
text.style.top = `${this.game.canvas.offsetTop + height - 180}px`;
text.style.width = `${width}px`;
text.style.color = '#fff64f';
text.style.textAlign = 'center';
text.style.zIndex = 202;
text.style.paddingRight = 60;
text.style.paddingLeft = 60;
text.style.fontSize = '22px';
text.style.fontWeight = 'bold';
text.style.fontFamily = '"Sansita Swashed", system-ui';
text.style.animation = 'fadeInScale 0.5s ease-out';
text.style.letterSpacing = '2px';
document.body.appendChild(text);

// Add keyframe animation if not already present
if (!document.getElementById('lny-text-animation')) {
  const style = document.createElement('style');
  style.id = 'lny-text-animation';
  style.textContent = `
    @keyframes fadeInScale {
      0% {
        opacity: 0;
        transform: scale(0.5);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;
  document.head.appendChild(style);
}

  // Click to remove
  const closeBtn = document.createElement('div');
    closeBtn.innerText = '✕'; 
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = `${this.game.canvas.offsetTop + 20}px`;
    closeBtn.style.right = `${this.game.canvas.offsetLeft + 20}px`;
    closeBtn.style.fontSize = '32px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = '#fff';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = 203;
    closeBtn.style.userSelect = 'none';
    document.body.appendChild(closeBtn);

    closeBtn.addEventListener('click', () => {
        // Remove elements
        img.remove();
        text.remove();
        closeBtn.remove();

        // Go back to MainMenu scene
        this.scene.start('MainMenu');
    });
    
}

resetScene() {
  this.scene.restart();
  this.isShaking = false;
}
}