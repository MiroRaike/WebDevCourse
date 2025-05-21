class Zombie extends Phaser.GameObjects.Image 
{
    constructor (scene, cordinateX, cordinateY)
    {
        super(scene, cordinateX, cordinateY, 'zombie');
        this.zombieSpeed = 200;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.attackRange = 60;
        this.active = false;
        scene.add.existing(this)
        scene.physics.world.enableBody(this);
        // Makes it so that the zombie doesn't spin around the player 
        scene.physics.add.collider(this, this.scene.zombieList)
    }

    update (time, delta)
    {
        var distanceX = Math.abs(this.scene.player.x - this.x)
        var distanceY = Math.abs(this.scene.player.y - this.y)

        if(this.active){
            // Props a way to not make path every update but oh well
            const path = this.scene.navMesh.findPath({ x: this.x, y: this.y }, { x: this.scene.player.x, y: this.scene.player.y });
        
            // Apparently the path plugin doesn't make the same results all the time or the movement is screwing with it, zombie gets "stuck" close to walls sometimes due to making different pathing routes every millisecond
            // Path plugin props wasn't needed at all z.z
            // Zombie also kinda stutters
            if(path){
                if(path[1].x < this.x){
                    this.body.velocity.x = -this.zombieSpeed
                }else if(path[1].x > this.x){
                    this.body.velocity.x = this.zombieSpeed
                }else{
                    this.body.velocity.x = 0
                }
                if(path[1].y < this.y){
                    this.body.velocity.y = -this.zombieSpeed
                }else if(path[1].y > this.y){
                    this.body.velocity.y = this.zombieSpeed
                }else{
                    this.body.velocity.y = 0
                }
            }
            if(distanceX <= this.attackRange && distanceY <= this.attackRange ){
                this.attack(this.scene.player)
            }
        }
        this.rotation = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            this.scene.player.x,
            this.scene.player.y,
        );

        if(!this.active){
            if(distanceX < 800 || distanceY < 800 ){
                // Makes the zombie active 
                // Currently doesn't really do anything in the arena, props usable in bigger levels if you want the zombie to be doormat 
                this.active = true
            }
        }
    }

    attack(playerHit){
        // Add invincibility frames to player 
        if(playerHit.active === true && playerHit.iFrames <= 0)
        {
            playerHit.health = playerHit.health - 1;
            console.log('Player hp: ', playerHit.health);

            // Kill hp sprites and kill player if health <= 0
            if (playerHit.health === 2)
            {
                this.scene.hp3.destroy();
            }
            else if (playerHit.health === 1)
            {
                this.scene.hp2.destroy();
            }
            else
            {
                this.scene.hp1.destroy();

                var deathTime = this.scene.scene.score
                // Game over state should execute here
                this.scene.scene.restart()
            }
            // Destroy bullet
            playerHit.iFrames = this.scene.invincibilityTime
        }
    }
}