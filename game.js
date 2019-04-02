var canvas = document.getElementById("game");
var originalHeight = 1080;
var originalWidth = 1920;
var scaleX;
var scaleY;
var context;
var fps = 60;
var score = 30000;
var sps = 1000;
var time = 50000;
var nextSpawn = -1000;

var navBar = 0; //Start bar offset
var fontcrease = 1; //Font size multiplier

var background = {};
background.image = new Image();
background.image.src = "img/bg.png";
background.scrollspeed = 8 / fps; //
background.x = 0;
background.y = 0;

var lives = {};
lives.lives = 3;
lives.image = new Image();
lives.image.src = "img/life.png";

background.draw = function() {
    this.x -= (this.image.width / (fps / this.scrollspeed));

    if (this.x < -((canvas.height / originalHeight * background.image.width) - canvas.width)) {
        if (this.x < -((canvas.height / originalHeight * background.image.width)))
            this.x += canvas.height / originalHeight * background.image.width;
        else
            scaleDrawByHeight(background.image, this.x + (canvas.height / originalHeight * this.image.width), background.y);
    }

    scaleDrawByHeight(background.image, background.x, background.y);
    //console.log("Drawing")


};

function clone(src) {
  return Object.assign({}, src);
}

var dogoos = [];
var bullets = [];

var dogoo = {};
dogoo.id = 0;
dogoo.x = 0;
dogoo.y = 0;
dogoo.type = 0;
dogoo.typeImages = ["img/dogoo_blue.png", "img/dogoo_orange.png", "img/dogoo_green.png", "img/dogoo_pink.png"];
dogoo.size = 1.0;
dogoo.health = 1; //How many hits till death
dogoo.alive = Math.random() * fps * 12;
dogoo.moveTime = 12;
dogoo.createImage = function() {
    this.image = new Image();
    this.image.src = this.typeImages[this.type];
};
dogoo.draw = function() {
    var drawX = this.x - ((this.image.width * this.size * scaleX) / 2);
    var drawY = this.y - ((this.image.height * this.size * scaleY) / 2);

    context.globalAlpha = (this.health > 1 ? 1 : this.health + 1);
    scaleDraw(this.image, drawX, drawY, this.size);
    context.globalAlpha = 1;
};
dogoo.fire = function() {};
dogoo.fireRate = 5.0;
dogoo.fireTicks = Math.random() * fps * 3;
dogoo.tick = function() {

    if (this.alive > fps * this.moveTime) {
        this.alive = 0;

        this.destX = Math.random() * (2 - this.size) * canvas.width * 0.2 - (canvas.width * 0.1) + this.x;
        this.destY = Math.random() * (2 - this.size) * canvas.height * 0.2 - (canvas.height * 0.1) + this.y;

		var attempts = 0;

        while (this.destX > canvas.width || this.destX < canvas.width * 0.4) {
            this.destX = Math.random() * canvas.width * 0.2 - (canvas.width * 0.1) + this.x;
			attempts += 1;
			if (attempts > 10) return;
		}
		attempts = 0;
        while (this.destY > canvas.height || this.destY < canvas.height * 0.05) {
            this.destY = Math.random() * canvas.height * 0.2 - (canvas.height * 0.1) + this.y;
			attempts += 1;
			if (attempts > 10) return;
		}

    }

    if (this.x == this.destX && this.y == this.destY) {
        this.fireTicks += 1;
        this.alive += 1;
    } else {
        var xd = this.destX - this.x;
        var yd = this.destY - this.y;
        var distance = Math.sqrt(xd * xd + yd * yd);

        if (distance < 5) {
            this.x = this.destX;
            this.y = this.destY;
            this.fire();
        } else {
            var distanceInThisTick = 200 / fps * (2 - this.size);
            if (distanceInThisTick > distance) distanceInThisTick = 1;

            var xMotion = xd / distance * distanceInThisTick;
            var yMotion = yd / distance * distanceInThisTick;

            this.x += xMotion;
            this.y += yMotion;
        }
    }

    if (this.fireTicks / fps > this.fireRate && this.health > 0) {
        this.fire();
        this.fireTicks -= fps * this.fireRate;
    }

    if (this.health <= 0) {
        this.health -= 15 / fps;

        if (this.health <= -1) {
            dogoos.splice(dogoos.indexOf(this), 1);
            return;
        }
    }

    this.draw();
};

var dogooBlue = clone(dogoo);
dogooBlue.size = 0.8;
dogooBlue.fire = function() {
    spawnBullet(180, this.x, this.y, 0);
};
dogooBlue.createImage();

var dogooOrange = clone(dogoo);
dogooOrange.size = 1.0;
dogooOrange.type = 1;
dogooOrange.fire = function() {
	spawnBullet(180, this.x, this.y, 0);
	spawnBullet(160, this.x, this.y, 0);
	spawnBullet(200, this.x, this.y, 0);

};
dogooOrange.createImage();

var dogooGreen = clone(dogoo);
dogooGreen.size = 1.2;
dogooGreen.type = 2;
dogooGreen.moveTime = 7;
dogooGreen.fireRate = 6.0;
dogooGreen.fire = function() {
	var thos = this;
	for (var i = 0; i < 3; i += 1) {
		setTimeout(function() {
			spawnBullet(180, thos.x, thos.y, 0);
		    spawnBullet(160, thos.x, thos.y, 0);
		    spawnBullet(200, thos.x, thos.y, 0);
		}, 1000 * 0.5 * i);
	}
};
dogooGreen.createImage();

var dogooPink = clone(dogoo);
dogooPink.size = 0.5;
dogooPink.type = 3;
dogooPink.moveTime = 15;
dogooPink.fireRate = 5;
dogooPink.fire = function() {
    spawnBullet(90, this.x, this.y, 0);
    spawnBullet(120, this.x, this.y, 0);
    spawnBullet(150, this.x, this.y, 0);
    spawnBullet(180, this.x, this.y, 0);
    spawnBullet(210, this.x, this.y, 0);
    spawnBullet(240, this.x, this.y, 0);
    spawnBullet(270, this.x, this.y, 0);
};
dogooPink.createImage();

var gameover = new Image();
gameover.src = "img/gameover5.png";

var player = {};
player.x = 300;
player.y = 300;
player.destX = 300;
player.destY = 300;
player.mouseX = -1;
player.mouseY = -1;
player.image = new Image();
player.image.src = "img/nep.png";
player.draw = function() {
    var drawX = this.x - ((this.image.width * scaleX) / 2);
    var drawY = this.y - ((this.image.height * scaleY) / 2);

    scaleDraw(this.image, drawX, drawY, 1);
};
player.click = function() {
    var bullet = spawnBullet(0, this.x, this.y, 1);
    bullet.speed = 400;
};
player.tick = function() {
    if (this.mouseX > (this.image.width * scaleX) / 2 && this.mouseX < canvas.width - (this.image.width * scaleX) / 2) this.destX = this.mouseX;
    if (this.mouseY > (this.image.height * scaleY) / 2 && this.mouseY < canvas.height - (this.image.height * scaleY) / 2) this.destY = this.mouseY;

    var xd = this.destX - this.x;
    var yd = this.destY - this.y;
    var distance = Math.sqrt(xd * xd + yd * yd);

    if (distance < 5) {
        this.x = this.destX;
        this.y = this.destY;
    } else {
        var distanceInThisTick = 300 / fps;
        if (distanceInThisTick > distance) distanceInThisTick = 1;

        var xMotion = xd / distance * distanceInThisTick;
        var yMotion = yd / distance * distanceInThisTick;

        this.x += xMotion;
        this.y += yMotion;
    }

    this.draw();
};

function spawnDogoo(x, y, dogoo) {
    var dogooClone = clone(dogoo);
    dogooClone.id = dogoos.length;
    dogooClone.x = x;
    dogooClone.y = y;
	dogooClone.alive = Math.random() * fps * 12;
	dogooClone.fireTicks = Math.random() * fps * 3;
    dogooClone.destX = Math.random() * canvas.width * 0.3 + canvas.width * 0.55;
    dogooClone.destY = Math.random() * 0.7 * canvas.height + (canvas.height * 0.1);
    dogoos.push(dogooClone);
}

function spawnBullet(angle, x, y, type) {
    var bullet = {};
    bullet.id = bullets.length;
    bullet.x = x;
    bullet.y = y;
    bullet.type = type; //Dogoo one
    bullet.image = new Image();
    bullet.image.src = "img/energyball.png";
    if (type == 1) bullet.image.src = "img/bullet.png";
    bullet.draw = function() {
        var drawX = this.x - ((this.image.width * scaleX) / 2);
        var drawY = this.y - ((this.image.height * scaleY) / 2);
        //console.log(this.image);

        scaleDraw(this.image, drawX, drawY, 1);
    };
    bullet.angle = angle;
    bullet.speed = 250;
    bullet.tick = function() {
        if (this.type == 1) {
            for (var d in dogoos) {
                var dogoo = dogoos[d];
                if (Math.abs(dogoo.x - this.x) < (this.image.width * scaleX) && Math.abs(dogoo.y - this.y) < (this.image.height * scaleY) && dogoo.health > 0) {
                    dogoo.health -= 1;
                    bullets.splice(bullets.indexOf(this), 1);
                    console.log("Collided");
                    return;
                }
            }
        } else if (type == 0) {
            if (Math.abs(player.x - this.x) < ((this.image.width * scaleX)) && Math.abs(player.y - this.y) < this.image.height * scaleY) {
                lives.lives -= 1;
                bullets.splice(bullets.indexOf(this), 1);
                return;
            }
        }

        if (this.x > canvas.width + (this.image.width * scaleX) || this.x < 0 || this.y > canvas.height + (this.image.height * scaleY)|| this.y < 0) {
            bullets.splice(bullets.indexOf(this), 1);
            return;
        }

        var xMotion = Math.cos(this.angle * Math.PI / 180) * this.speed / fps;
        var yMotion = Math.sin(this.angle * Math.PI / 180) * this.speed / fps;

        this.x += xMotion;
        this.y += yMotion;

        this.draw();
    };

    bullets.push(bullet);
    return bullet;
}


function drawText() {
    var oldFill = context.fillStyle;
    context.textAlign = "start";
    context.font = (fontcrease * 40) + "px Arcade";
    context.fillStyle = "#FFFFFF";
    context.fillText("HI   SCORE", canvas.width / 100 * 2, canvas.height / 100 * 8);
    context.textAlign = "end";
    context.fillText("x " + lives.lives, canvas.width - (canvas.width / 100 * 3), canvas.height - (canvas.height / 100 * 3) - navBar);
    scaleDraw(lives.image, canvas.width - (canvas.width / 100 * 18), canvas.height - (canvas.height / 100 * 13) - navBar, 1);
    context.fillText(Math.floor(score), canvas.width - (canvas.width / 100 * 4), canvas.height / 100 * 8);
    context.font = (fontcrease * 20) + "px Arcade";
    context.textAlign = "start";
    context.fillText("\u00A92019   IDEA   FACTORY   INTERNATIONAL", canvas.width / 100 * 2, canvas.height - (canvas.height / 100 * 5) - navBar);

    context.fillStyle = oldFill;
}

function scaleDraw(image, x, y) {
    context.drawImage(image, x, y, canvas.width / originalWidth * image.width, canvas.height / originalHeight * image.height);
}

function scaleDrawByWidth(image, x, y) {
    context.drawImage(image, x, y, canvas.width / originalWidth * image.width, canvas.width / originalWidth * image.height);
}

function scaleDrawByHeight(image, x, y) {
    context.drawImage(image, x, y, canvas.height / originalHeight * image.width, canvas.height / originalHeight * image.height);
}

function scaleDraw(image, x, y, scale) {
    context.drawImage(image, x, y, canvas.width / originalWidth * image.width * scale, canvas.height / originalHeight * image.height * scale);
}

function drawAll() {
    if (lives.lives == 0) {
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        scaleDraw(gameover, canvas.width / 2 - (gameover.width * scaleX), canvas.height / 2 - (gameover.height * scaleY), 2);
        clearInterval(thread);
		setTimeout(function() {
			startGame();
		}, 3000);
        return;
    }

    background.draw();

    for (var b in bullets) {
        var bu = bullets[b];
        bu.tick();
    }

    for (var d in dogoos) {
        var dogoo = dogoos[d];
        dogoo.tick();
    }

    player.tick();

    score += sps / fps;
    time += 1000 / fps;

    drawText();
    spawner();
}

function spawner() {
    nextSpawn -= 1000 / fps;

    if (nextSpawn < 0) {
        var amount = Math.floor(Math.random() * (2 + (time / 20000)));
        if (amount > 10) amount = 10;
        while (amount > 0) {
            amount -= 1;
            var rand = Math.random() * (10 + (time / 8000));
            var dogoo = dogooBlue;
            if (rand > 20)
                dogoo = dogooPink;
            else if (rand >= 15)
                dogoo = dogooGreen;
            else if (rand >= 10)
                dogoo = dogooOrange;

            spawnDogoo(canvas.width + 100, canvas.height / 2 + (Math.random() * canvas.height * 0.5) - canvas.height / 4, dogoo);
            console.log("Spawning");
        }

        nextSpawn = 1600 + Math.random() * 2000;

        console.log("Next spawn in " + nextSpawn);
    }
}

function startGame() {
	score = 0;
	sps = 1000;
	time = 0;
	nextSpawn = -1000;
	lives.lives = 3;
	dogoos = [];
	bullets = [];
	player.x = canvas.width / 2;
	player.y = canvas.height / 2;
	
	thread = setInterval(drawAll, 1000 / fps);
}

var thread;

window.onload = function() {
    console.log("Loaded");

    canvas = document.getElementById("game");
    context = canvas.getContext('2d');

    dogoo.destX = canvas.width / 2;
    dogoo.destY = canvas.width / 2;

    scaleX = canvas.width / originalWidth;
    scaleY = canvas.height / originalHeight;

    document.onmousemove = function(e) {
        player.mouseX = e.clientX;
        player.mouseY = e.clientY;
    };

    document.onclick = function() {
        player.click();
    };

    startGame();
    //setInterval(spawner, 100);
};
