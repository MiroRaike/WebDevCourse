
/* Core mechanics taken from here yep yep https://github.com/photonstorm/phaser3-examples/blob/master/public/src/physics/arcade/topdown%20shooter%20combat%20mechanics.js */ 
const gameOptions = {
    dudeGravity: 0,
    dudeSpeed: 300,
    dudeSprint: 600,
}
let game;

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1080,
            height: 1080,
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                },
                /* Need to specify fps otherwise sprites stutter */
                fps: 120,
            }
            
        },
        plugins: {
            scene: [
                {
                    key: "PhaserNavMeshPlugin", // Key to store the plugin class under in cache
                    plugin: PhaserNavMeshPlugin, // Class that constructs plugins
                    mapping: "navMeshPlugin", // Property mapping to use for the scene, e.g. this.navMeshPlugin
                    start: true
                }
            ]
        },
        scene: PlayGame,
    }

    game = new Phaser.Game(gameConfig)
    window.focus();
}

class PlayGame extends Phaser.Scene {

    time = 0;
    timer = 0;
    enemyBullets;
    playerBullets;
    bulletText;
    ammocount = 0; 
    moveKeys;
    reticle;
    healthpoints;
    lastFired = 0;
    player;
    enemy;
    hp1;
    hp2;
    hp3;
    timeText;
    timerEvent;
    invincibilityTime = 4;
    score = 0;
    scoreText;
    baseballBat;
    melee;
    ranged;
    gunshotSound;
    swingSound;
    gunSwitchS;
    zombieDeathS;
    gunIcon;
    meleeIcon;
    pickuprange = 75;

    preload() {
        this.load.image("ground", "assets/sprites/platform.png")
        this.load.image("bullet", "assets/sprites/bullet.png")
        this.load.image("reticle", "assets/sprites/sight.png")
        this.load.image('heart', 'assets/sprites/heart.png');
        this.load.image('background', 'assets/sprites/leveltest.png');
        this.load.image("tiles", "assets/sprites/SpriteWallsUpOrderStairs.png")
        this.load.image("healthkit", "assets/sprites/healthkit.png")
        this.load.image("gunIcon", "assets/sprites/gun.png")
        this.load.image("baseballbat","assets/sprites/longbat.png")
        this.load.image("baseballbatIcon","assets/sprites/batSideways.png")
        // I have no idea why ammo box won't load
        this.load.image("ammoBox", "assets/sprites/ammobox.png")

        this.load.tilemapTiledJSON("map","assets/maps/untitledArena.json")

        this.load.spritesheet("zombie","assets/sprites/zombie.png", {frameWidth: 64, frameHeight: 64})
        this.load.spritesheet("orb", "assets/sprites/theorbSprite.png", {frameWidth: 50, frameHeight: 50})
        this.load.spritesheet('player_handgun', 'assets/sprites/player_handgun.png',
        { frameWidth: 66, frameHeight: 60 })

        this.load.audio("zombieDeathS","assets/audio/zombieDeath.wav")
        this.load.audio("gunShotS","assets/audio/gunshot.mp3")
        this.load.audio("gunSwitchS","assets/audio/gunswitch.mp3")
        this.load.audio("swingSound","assets/audio/swingSound.mp3")
    }

    create() {

        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })

        this.zombiesGroup = this.physics.add.group({ classType: Zombie, runChildUpdate: true })

        /* https://youtu.be/lmJdFa3-BIo?si=vmWN0VD_e2-08dfY Series about tilemaps */
        var map = this.make.tilemap({ key: "map", tileWidth: 64, tileHeight: 64});
        var tileset = map.addTilesetImage("SpriteWallsUpOrderStairs","tiles")
        this.floor = map.createLayer("Floor", tileset, 0, 0)
        this.wall = map.createLayer("Wall", tileset, 0, 0);
        // Pathing that the zombie will use probably  https://www.dynetisgames.com/2018/03/06/pathfinding-easystar-phaser-3/ 
        // Easystar sucks so much can't make it work in the project instead lets try this https://stackoverflow.com/questions/74377198/best-solution-for-phaser-3-pathfinding
        this.wall.setCollisionBetween(0,16);

        this.navMesh = this.navMeshPlugin.buildMeshFromTilemap("mesh", map, [this.wall]);

        this.melee = true
        this.ranged = false
        //const path = navMesh.findPath({ x: 390, y: 334 }, { x: 700, y: 334 });

        this.physics.world.setBounds({width: 3000, height: 3000});

        this.player = this.physics.add.sprite(this.floor.width/2, this.floor.height/2, "orb")
        this.baseballBat = this.physics.add.sprite(this.floor.width/2, this.floor.height/2, "baseballbat")
        //this.enemy = this.physics.add.sprite(600, 600, 'player_handgun');
        this.zombieList = []

        var timeTextStyle = {font: "24px Roboto", fill: '#E43AA4', stroke: '#000', strokeThickness: 4}; 
        this.timeText =  this.add.text(16, 16, "Time survived: 0:00 ", timeTextStyle)

        this.scoreText = this.add.text(16, 16, "Score: 00000000", timeTextStyle)
        this.bulletText = this.add.text(16, 16, "Ammo: 014", timeTextStyle)

        this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        this.zombieGroup = this.physics.add.group({ classType: Zombie, runChildUpdate: true })

        this.cursors = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D', restart: 'R', weapon1: 'Q', weapon2: 'E'})
        this.reticle = this.physics.add.sprite(800, 800, 'reticle');

        this.player.health = 3;
        this.player.iFrames = this.invincibilityTime;
        //this.enemy.health = 3;
        //this.enemy.lastFired = 0;

        this.ammocount = 14

        this.ammoGroup = this.physics.add.group({})
        this.physics.add.overlap(this.player, this.ammoGroup, this.collectAmmo, null, this)

        this.gunSwitchS = this.sound.add("gunSwitchS")
        this.zombieDeathS = this.sound.add("zombieDeathS")
        this.swingSound = this.sound.add("swingSound")
        this.gunshotSound = this.sound.add("gunShotS")

        this.player.setCollideWorldBounds(true).setDrag(0, 0);
        this.reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);

        this.hp1 = this.add.image(0, 0, 'heart');
        this.hp2 = this.add.image(0, 25, 'heart');
        this.hp3 = this.add.image(0, 50, 'heart');
        this.gunIcon = this.add.image(0, 50, 'gunIcon')
        this.meleeIcon = this.add.image(0, 50, 'baseballbatIcon')

        this.hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
        this.hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
        this.hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
        this.gunIcon.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
        this.meleeIcon.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

        /* Physics */
        this.physics.add.collider(this.player, this.wall)
        this.physics.add.collider(this.enemyBullets, this.wall)
        this.physics.add.collider(this.playerBullets, this.wall)
        this.physics.add.collider(this.zombiesGroup);


        /* https://github.com/photonstorm/phaser3-examples/blob/master/public/src/physics/arcade/topdown%20shooter%20average%20focus.js shooting */

        this.cameras.main.zoom = 1;
        
        this.spawnZombie = this.time.addEvent({
            callback: this.makeZombie,
            callbackScope: this,
            delay: 2500,
            loop: true
        })

        this.timer = 0;

        this.inGameTimer = this.time.addEvent({
            callback: this.setTime,
            callbackScope: this,
            delay: 1000,
            loop: true
        })


        this.input.on('pointerdown', (pointer, time, lastFired) =>
        {
            if (this.player.active === false) { return; }

            // Get bullet from bullets group
            if(this.ranged && this.ammocount != 0){
                const bullet = this.playerBullets.get().setActive(true).setVisible(true);
                this.gunshotSound.play()
                this.ammocount -= 1
                this.updateBulletsCount()

                if (bullet)
                {
                    bullet.fire(this.player, this.reticle);
                    //this.physics.add.collider(this.enemy, bullet, (enemyHit, bulletHit) => this.enemyHitCallback(enemyHit, bulletHit));
                    for (let zombies = 0; zombies < this.zombieList.length; zombies++) {
                        this.physics.add.collider(this.zombieList[zombies], bullet, (enemyHit, bulletHit) => this.enemyHitCallback(enemyHit, bulletHit));
                    }
                    this.physics.add.collider(this.wall, bullet, (enemyHit, bulletHit) => this.objectHitCallback(enemyHit, bulletHit));
                }
            }
            if(this.melee){
                this.swingSound.play()
                for (let zombies = 0; zombies < this.zombieList.length; zombies++) {
                    this.physics.add.collider(this.zombieList[zombies], this.baseballBat, (enemyHit, bulletHit) => this.enemyHitCallback(enemyHit, bulletHit));
                }
            }
        });

        this.game.canvas.addEventListener('mousedown', () => {
            this.game.input.mouse.requestPointerLock();
        });

        this.input.on(
            'pointermove',
            function (pointer)
            {
                if (this.input.mouse.locked)
                {
                    // Move reticle with mouse
                    this.reticle.x += pointer.movementX;
                    this.reticle.y += pointer.movementY;

                    // Only works when camera follows player
                    const distX = this.reticle.x - this.player.x;
                    const distY = this.reticle.y - this.player.y;

                    // Ensures reticle cannot be moved offscreen
                    if (distX > 800) { this.reticle.x = this.player.x + 800; }
                    else if (distX < -800) { this.reticle.x = this.player.x - 800; }

                    if (distY > 600) { this.reticle.y = this.player.y + 600; }
                    else if (distY < -600) { this.reticle.y = this.player.y - 600; }
                }
            },
            this
        );

        

    }
    
    update(time, delta) {

        //console.log(this.player.body.x)
        //console.log(this.player.body.y)

        if(this.cursors.left.isDown) {
            this.player.body.velocity.x = -gameOptions.dudeSpeed
        }
        else if(this.cursors.right.isDown) {
            this.player.body.velocity.x = gameOptions.dudeSpeed
        }
        else{
            this.player.body.velocity.x = 0
        }
        if(this.cursors.up.isDown) {
            this.player.body.velocity.y = -gameOptions.dudeSpeed
        }
        else if(this.cursors.down.isDown) {
            this.player.body.velocity.y = gameOptions.dudeSpeed
        } else{
            this.player.body.velocity.y = 0
        }

        if(this.cursors.weapon1.isDown) {
            console.log("1 is down")
            this.melee = false
            this.ranged = true
            this.baseballBat.setActive(false).setVisible(false);
        }

        if(this.cursors.weapon2.isDown) {
            console.log("2 is down")
            this.melee = true
            this.ranged = false
            this.baseballBat.setActive(true).setVisible(true);
        }

        if(this.cursors.restart.isDown){
            this.scene.restart()
        }

        // Rotates player to face towards reticle
        this.player.rotation = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            this.reticle.x,
            this.reticle.y
        );

        this.baseballBat.x = this.player.x;
        this.baseballBat.y = this.player.y;
        
        this.baseballBat.rotation = this.player.rotation

        // Camera position is average between reticle and player positions
        const avgX = (this.player.x + this.reticle.x) / 2 - 540;
        const avgY = (this.player.y + this.reticle.y) / 2 - 540;
        this.cameras.main.scrollX = avgX;
        this.cameras.main.scrollY = avgY;

        this.timeText.x = this.cameras.main.scrollX + (this.game.config.width)/2.40
        this.timeText.y = this.cameras.main.scrollY + 40

        this.scoreText.x = this.cameras.main.scrollX + (this.game.config.width)/1.25
        this.scoreText.y = this.cameras.main.scrollY + 40

        this.hp1.x = this.cameras.main.scrollX + 50
        this.hp2.x = this.cameras.main.scrollX + 100
        this.hp3.x = this.cameras.main.scrollX + 150

        this.hp1.y = this.cameras.main.scrollY + 50
        this.hp2.y = this.cameras.main.scrollY + 50
        this.hp3.y = this.cameras.main.scrollY + 50

        if(this.melee){
            this.meleeIcon.x = this.cameras.main.scrollX + 50
            this.meleeIcon.y = this.cameras.main.scrollY + (this.game.config.height) - 50
            this.meleeIcon.setActive(true).setVisible(true);
            this.bulletText.setActive(false).setVisible(false);
            this.gunIcon.setActive(false).setVisible(false);
        }

        if(this.ranged){
            this.bulletText.x = this.cameras.main.scrollX + 100
            this.bulletText.y = this.cameras.main.scrollY + (this.game.config.height) - 60
            this.gunIcon.x = this.cameras.main.scrollX + 50
            this.gunIcon.y = this.cameras.main.scrollY + (this.game.config.height) - 50
            this.gunIcon.setActive(true).setVisible(true);
            this.bulletText.setActive(true).setVisible(true);
            this.meleeIcon.setActive(false).setVisible(false);
        }

        // Make reticle move with player
        this.reticle.body.velocity.x = this.player.body.velocity.x;
        this.reticle.body.velocity.y = this.player.body.velocity.y;

        // Constrain velocity of player
        this.constrainVelocity(this.player, 500);

        // Constrain position of reticle
        this.constrainReticle(this.reticle, 550);

        //this.enemyFire(time);

        for (let zombies = 0; zombies < this.zombieList.length; zombies++) {
            this.zombieList[zombies].update()
        }
    }

    updateScore(){
        // Seems better than doing a bunch of if statements for adding zeroes
        var scoreString = this.score.toString()
        var score = scoreString;
        for(let i = scoreString.length; i < 8; i++){
            score = "0" + score
        }
        this.scoreText.setText("Score: " + score);
    }

    updateBulletsCount(){
        // Seems better than doing a bunch of if statements for adding zeroes
        var ammoString = this.ammocount.toString()
        var ammo = ammoString;
        for(let i = ammoString.length; i < 3; i++){
            ammo = "0" + ammo
        }
        this.bulletText.setText("Ammo: " + ammo);
    }

    setTime(){
        this.timer = this.timer + 1
        var minutes  = Math.floor(this.timer / 60);
        var seconds = Math.round(this.timer % 60);
        if(seconds < 10){
            this.timeText.setText("Time survived: " + minutes + ":0" + seconds);
        }else{
            this.timeText.setText("Time survived: " + minutes + ":" + seconds);
        }
        
        if(this.player.iFrames != 0){
            this.player.iFrames = this.player.iFrames - 1
        }
    }

    collectAmmo(player, ammo) {
        console.log("Collecting ammo")
        ammo.disableBody(true, true)
        var chance = Math.random()
        if(chance < 0.5){
            this.ammocount += 2
        }else if(chance < 0.75){
            this.ammocount += 3
        }else{
            this.ammocount += 5
        }
        console.log(this.ammocount)
        this.updateBulletsCount()
    }


    makeZombie(){
        var spawnPoint = Phaser.Math.Between(0, this.floor.culledTiles.length)
        var zombie = new Zombie(this, this.floor.culledTiles[spawnPoint].pixelX, this.floor.culledTiles[spawnPoint].pixelY);
        this.physics.add.collider(zombie, this.wall)
        for(let i = 0; i < this.zombieList.length; i++){
            this.physics.add.collider(zombie, this.zombieList[i])
        }
        zombie.health = 2
        zombie.type = "Zombie"
        this.zombieGroup.add(zombie)
        this.physics.add.collider(zombie, this.zombieGroup)
        this.physics.add.collider(zombie, this.player)
        this.zombieList.push(zombie)
        // Get floor tile coordinates so that the zombies don't keep spawning in walls
    }

    objectHitCallback (objectHit, bulletHit){
        //&& objectHit.active === true
        if (bulletHit.active === true)
        {
            bulletHit.setActive(false).setVisible(false);
        }
    }

    enemyHitCallback (enemyHit, bulletHit)
    {
        // Reduce health of enemy
        if(this.ranged){
            if (bulletHit.active === true && enemyHit.active === true)
            {
                enemyHit.health = enemyHit.health - 1;
                console.log('Enemy hp: ', enemyHit.health);
                // Kill enemy if health <= 0
                if (enemyHit.health <= 0)
                {
                    // For some reason won't spawn the ammo image
                    this.ammoGroup.create(enemyHit.x, enemyHit.y, 0, "ammobox")
                    this.deactiveEnemy(enemyHit)
                }
                // Destroy bullet
                bulletHit.setActive(false).setVisible(false);
            }
        }
        if(this.melee){
            if (bulletHit.active === true && enemyHit.active === true)
            {
                enemyHit.health = enemyHit.health - 3;
                console.log('Enemy hp: ', enemyHit.health);
                // Kill enemy if health <= 0
                if (enemyHit.health <= 0)
                {
                    this.deactiveEnemy(enemyHit)
                }
            }
        }
    }

    deactiveEnemy(enemyHit){
        this.zombieDeathS.play()
        console.log(this.zombieList.length)
        var index = this.zombieList.indexOf(enemyHit)
        this.zombieList.pop(index)
        this.score += 100;
        this.updateScore()
        console.log("Zombie down")
        console.log(this.zombieList.length)
        enemyHit.setActive(false).setVisible(false);
    }

    constrainVelocity (sprite, maxVelocity)
    {
        if (!sprite || !sprite.body) { return; }

        let angle, currVelocitySqr, vx, vy;
        vx = sprite.body.velocity.x;
        vy = sprite.body.velocity.y;
        currVelocitySqr = vx * vx + vy * vy;

        if (currVelocitySqr > maxVelocity * maxVelocity)
        {
            angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;
            sprite.body.velocity.x = vx;
            sprite.body.velocity.y = vy;
        }
    }

    constrainReticle (reticle, radius)
    {
        const distX = reticle.x - this.player.x; // X distance between player & reticle
        const distY = reticle.y - this.player.y; // Y distance between player & reticle

        // Ensures reticle cannot be moved offscreen
        if (distX > 800) { reticle.x = this.player.x + 800; }
        else if (distX < -800) { reticle.x = this.player.x - 800; }

        if (distY > 600) { reticle.y = this.player.y + 600; }
        else if (distY < -600) { reticle.y = this.player.y - 600; }

        // Ensures reticle cannot be moved further than dist(radius) from player
        const distBetween = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            reticle.x,
            reticle.y
        );
        if (distBetween > radius)
        {
            // Place reticle on perimeter of circle on line intersecting player & reticle
            const scale = distBetween / radius;

            reticle.x = this.player.x + (reticle.x - this.player.x) / scale;
            reticle.y = this.player.y + (reticle.y - this.player.y) / scale;
        }
    }
}
