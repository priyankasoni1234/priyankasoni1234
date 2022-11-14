var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

ctx.lineWidth = 2;

var PADDLE_WIDTH = 100;
var PADDLE_HEIGHT = 20; 
var PADDLE_MARGIN_BOTTOM = 50;
var BALL_RADIUS = 8;
var BACKGROUND = new Image;
BACKGROUND.src = "images/3.jpg";
var LIFE = 2;
var SCORE = 0;
var SCORE_UNIT = 5;
var LEVEL = 1;
var MAX_LEVEL = 5;
var GAME_OVER = false;
var BRICK_HIT = new Audio();
var PADDLE_HIT = new Audio();
var LIFE_LOST = new Audio();
var WALL_COLLISION = new Audio();
var WIN_SOUND = new Audio();

BRICK_HIT.src = "./sounds/sounds_brick_hit.mp3";
PADDLE_HIT.src = "./sounds/sounds_paddle_hit.mp3";
LIFE_LOST.src = "./sounds/sounds_life_lost.mp3";
WALL_COLLISION.src = "./sounds/sounds_wall_collision.mp3";
WIN_SOUND.src = "./sounds/sounds_win_sound.mp3";



var leftArrow = false;
var rightArrow = false;

var paddle = {
    x: cvs.width / 2 - PADDLE_WIDTH / 2,
    y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 5
}

function drawPaddle() {

    ctx.fillStyle = "red";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.strokeStyle = "white";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        leftArrow = true;
    }  if (event.key === "ArrowRight") {
        rightArrow = true;
    }
    console.log(event);
})



document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft") {
        leftArrow = false;
    }  if (event.key === "ArrowRight") {
        rightArrow = false;
    }

})

function movePaddle() {
    if (rightArrow && paddle.x + paddle.width < cvs.width) {
        paddle.x += paddle.dx;
    } else if (leftArrow && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

var ball = {
    x: cvs.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 5,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -3

}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fillStyle = "yellow";
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.stroke();

    ctx.closePath();
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function ballWallCollision() {
    if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        WALL_COLLISION.play();
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        WALL_COLLISION.play();
    }
    if (ball.y + ball.radius > cvs.height) {
        LIFE--;
        resetBall();
    }
}

function resetBall() {
    ball.x = cvs.width / 2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

function ballPaddleCollision() {
    if (ball.x < paddle.x + paddle.width &&
        ball.x > paddle.x &&
        ball.y < paddle.y + paddle.height &&
        ball.y > paddle.y
    ) {
        var collidePoint = ball.x - (paddle.x + paddle.width / 2);
        collidePoint = collidePoint / (paddle.width / 2);

        var angle = collidePoint * Math.PI / 3;

        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
        PADDLE_HIT.play();
    }
}

var brick = {
    row: 1,
    column: 5,
    width: 55,
    height: 20,
    offSetLeft: 20,
    offSetTop: 20,
    marginTop: 40,
    fillColor: "red",
    strokeColor: "white",

}

var bricks = [];

function createBricks() {
    for (var r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for (var c = 0; c < brick.column; c++) {
            bricks[r][c] = {
                x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
                y: r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop,
                status: true
            }
        }
    }
}

createBricks();

function drawBricks() {
    for (var r = 0; r < brick.row; r++) {
        for (var c = 0; c < brick.column; c++) {
            var b = bricks[r][c];
            if (b.status) {
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);

                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);

            }
        }
    }

}

function ballBrickCollision() {
    for (var r = 0; r < brick.row; r++) {
        for (var c = 0; c < brick.column; c++) {
            var b = bricks[r][c];
            if (b.status) {
                if (ball.x + ball.radius > b.x &&
                    ball.x + ball.radius < b.x + brick.width &&
                    ball.y + ball.radius > b.y &&
                    ball.y - ball.radius < b.y + brick.height
                ) {
                    ball.dy = -ball.dy;
                    b.status = false;
                    SCORE += SCORE_UNIT;
                    BRICK_HIT.play(); 
                }
            }
        }
    }
}

function showGamePoints(text, textX, textY){
    ctx.fillStyle = "yellow";
    ctx.font = "20px Arial";
    ctx.fillText(text, textX, textY);
}

function gameOver(){
    if(LIFE < 0){
        showYouLose();
        GAME_OVER = true;
        // showGamePoints("Game Over ", cvs.width/2 - 40 , cvs.height/2);
        // showGamePoints("Refresh to play Again!", cvs.width/2 - 100, cvs.height/2 + 30);
    }
}

function levelUp(){
    var levelDone = true;
    for(var r=0; r<brick.row; r++){
        for(var c=0; c<brick.column; c++){
            levelDone = levelDone && !bricks[r][c].status;  
        }  
    }
    if(levelDone){
     if(LEVEL >= MAX_LEVEL){
        showYouWin();
        GAME_OVER = true;
        WIN_SOUND.play();
        showGamePoints( cvs.width/2 - 45 , cvs.height/2);
        return;
     }

     brick.row++;
     createBricks();
     ball.speed += 0.5;
     resetBall();
     LEVEL++;
    }
}

function draw() {
    drawPaddle();
    drawBall();
    drawBricks();
    showGamePoints("Score: "+SCORE, 35, 25);
    showGamePoints("Life: "+LIFE, cvs.width-85, 25);
    showGamePoints("Level: "+LEVEL, cvs.width/2-40, 25);

}

function update() {
    movePaddle();
    moveBall();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    levelUp();
    gameOver();
}

function loop() {
    ctx.drawImage(BACKGROUND, 0, 0);

    draw();

    update();
   
    if(!GAME_OVER){
        requestAnimationFrame(loop);
    }
   
}

loop();

var gameover = document.getElementById("gameover");
var youwin = document.getElementById("youwin");
var youlose = document.getElementById("youlose");
var restart = document.getElementById("restart");

restart.addEventListener("click", function(){
    location.reload();
})

function showYouWin(){
    gameover.style.display = "block";
    youwin.style.display = "block";
}

function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}





// var soundElement = document.getElementById("sound");

// soundElement.addEventListener("click", audioManager);

// function audioManager(){
//     var imgSrc = soundElement.getAttribute("src");
//     var SOUND_IMG = imgSrc == "images/soundon.png" ? "images/soundoff.png" : "images/soundon.png";
//     soundElement.setAttribute("src", SOUND_IMG);

//     BRICK_HIT.muted = BRICK_HIT.muted ? false : true; 
//      PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
//     WALL_COLLISION.muted = WALL_COLLISION.muted ? false : true; 
//      WIN_SOUND.muted = WIN_SOUND.muted ? false : true; 
//      LIFE_LOST.muted = LIFE_LOST.muted ? false : true; 
    
// }