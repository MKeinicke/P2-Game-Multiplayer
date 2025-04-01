export default class character1 extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, socket) {
        super(scene, x, y, texture);
        // Store the scene and socket for later use
        this.scene = scene;
        this.socket = socket; // Store the socket instance
        this.animation = "idle";
        this.isLocalPlayer = false; // Default to false, set to true for the local player
        // Add the player to the scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this); // Corrected line
    
        // Set player properties
        this.setScale(0.5);
        this.setCollideWorldBounds(true);
    
        //Physics body
        this.body.setCircle(16, 16, 16);
    
        // Define animations
        this.createAnimations(scene);
      }

      createAnimations(scene) {
        // Define animations
        scene.anims.create({
          key: "up",
          frames: scene.anims.generateFrameNumbers("PlayerM", {
            start: 105,
            end: 112,
          }),
          frameRate: 20,
        });
    
        scene.anims.create({
          key: "down",
          frames: scene.anims.generateFrameNumbers("PlayerM", {
            start: 131,
            end: 138,
          }),
          frameRate: 20,
        });
    
        scene.anims.create({
          key: "right",
          frames: scene.anims.generateFrameNumbers("PlayerM", {
            start: 144,
            end: 151,
          }),
          frameRate: 20,
        });
    
        scene.anims.create({
          key: "idle",
          frames: scene.anims.generateFrameNumbers("PlayerM", {
            start: 27,
            end: 29,
          }),
          frameRate: 5,
        });
    
        scene.anims.create({
          key: "cute",
          frames: scene.anims.generateFrameNumbers("PlayerM", {
            start: 50,
            end: 51,
          }),
          frameRate: 5,
          repeat: -1,
        });
    
        scene.anims.create({
          key: "sprint",
          frames: scene.anims.generateFrameNumbers("PlayerM", {
            start: 533,
            end: 540,
          }),
          frameRate: 20,
          repeat: -1,
        });
    
        scene.anims.create({
          key: "sprintUp",
          frames: scene.anims.generateFrameNumbers("PlayerM", {
            start: 494,
            end: 500,
          }),
          frameRate: 20,
          repeat: -1,
        });
    
        scene.anims.create({
          key: "sprintDown",
          frames: scene.anims.generateFrameNumbers("PlayerM", {
            start: 520,
            end: 527,
          }),
          frameRate: 20,
          repeat: -1,
        });
      }
    
      update(cursors) {
        let velocity = 160;
        let crawlVelocity = 300;
    
        const previousAnimation = this.animation;
        if (this.isLocalPlayer) {
          // Movement logic
          if (cursors.shift.isDown) {
            if (
              (cursors.a.isDown && cursors.w.isDown) ||
              (cursors.left.isDown && cursors.up.isDown)
            ) {
              this.setVelocity(-crawlVelocity, -crawlVelocity);
              this.flipX = true;
              this.anims.play("sprint", true);
              this.animation = "sprint";
            } else if (
              (cursors.a.isDown && cursors.s.isDown) ||
              (cursors.left.isDown && cursors.down.isDown)
            ) {
              this.setVelocity(-crawlVelocity, crawlVelocity);
              this.flipX = true;
              this.anims.play("sprint", true);
              this.animation = "sprint";
            } else if (
              (cursors.d.isDown && cursors.w.isDown) ||
              (cursors.right.isDown && cursors.up.isDown)
            ) {
              this.setVelocity(crawlVelocity, -crawlVelocity);
              this.flipX = false;
              this.anims.play("sprint", true);
              this.animation = "sprint";
            } else if (
              (cursors.d.isDown && cursors.s.isDown) ||
              (cursors.right.isDown && cursors.down.isDown)
            ) {
              this.setVelocity(crawlVelocity, crawlVelocity);
              this.flipX = false;
              this.anims.play("sprint", true);
              this.animation = "sprint";
            } else if (cursors.a.isDown || cursors.left.isDown) {
              this.setVelocityX(-crawlVelocity);
              this.flipX = true;
              this.anims.play("sprint", true);
              this.animation = "sprint";
            } else if (cursors.d.isDown || cursors.right.isDown) {
              this.setVelocityX(crawlVelocity);
              this.flipX = false;
              this.anims.play("sprint", true);
              this.animation = "sprint";
            } else if (cursors.w.isDown || cursors.up.isDown) {
              this.setVelocityY(-crawlVelocity);
              this.anims.play("sprintUp", true);
              this.animation = "sprintUp";
            } else if (cursors.s.isDown || cursors.down.isDown) {
              this.setVelocityY(crawlVelocity);
              this.anims.play("sprintDown", true);
              this.animation = "sprintDown";
            }
          }
          // Walk movement
          else if (
            (cursors.a.isDown && cursors.w.isDown) ||
            (cursors.left.isDown && cursors.up.isDown)
          ) {
            this.setVelocity(-velocity, -velocity);
            this.flipX = true;
            this.anims.play("up", true);
            this.animation = "up";
          } else if (
            (cursors.a.isDown && cursors.s.isDown) ||
            (cursors.left.isDown && cursors.down.isDown)
          ) {
            this.setVelocity(-velocity, velocity);
            this.flipX = true;
            this.anims.play("down", true);
            this.animation = "down";
          } else if (
            (cursors.d.isDown && cursors.w.isDown) ||
            (cursors.right.isDown && cursors.up.isDown)
          ) {
            this.setVelocity(velocity, -velocity);
            this.flipX = false;
            this.anims.play("up", true);
            this.animation = "up";
          } else if (
            (cursors.d.isDown && cursors.s.isDown) ||
            (cursors.right.isDown && cursors.down.isDown)
          ) {
            this.setVelocity(velocity, velocity);
            this.flipX = false;
            this.anims.play("down", true);
            this.animation = "down";
          }
          // Straight walk
          else if (cursors.a.isDown || cursors.left.isDown) {
            this.setVelocityX(-velocity);
            this.flipX = true;
            this.anims.play("right", true);
            this.animation = "right";
          } else if (cursors.d.isDown || cursors.right.isDown) {
            this.setVelocityX(velocity);
            this.flipX = false;
            this.anims.play("right", true);
            this.animation = "right";
          } else if (cursors.w.isDown || cursors.up.isDown) {
            this.setVelocityY(-velocity);
            this.anims.play("up", true);
            this.animation = "up";
          } else if (cursors.s.isDown || cursors.down.isDown) {
            this.setVelocityY(velocity);
            this.anims.play("down", true);
            this.animation = "down";
          }
          // Extra animations
          else if (cursors.space.isDown) {
            this.setVelocity(0, 0);
            this.anims.play("cute", true);
            this.animation = "cute";
          }
          // Idle animation
          else {
            this.setVelocity(0, 0);
            this.anims.play("idle", true);
            this.animation = "idle";
          }
    
          // **Fix: Explicitly stop movement when keys are released**
          if (
            !cursors.left.isDown &&
            !cursors.right.isDown &&
            !cursors.a.isDown &&
            !cursors.d.isDown
          ) {
            this.setVelocityX(0);
          }
    
          if (
            !cursors.up.isDown &&
            !cursors.down.isDown &&
            !cursors.w.isDown &&
            !cursors.s.isDown
          ) {
            this.setVelocityY(0);
          }
    
          // Emit the animation state to the server if it has changed
          if (this.animation !== previousAnimation) {
            this.socket.emit("setPlayerAnimation", this.animation);
          }
        }
      }
    }
    