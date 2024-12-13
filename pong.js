$(document).ready(function () {
    const $canvas = $("#gameCanvas");
    const canvas = $canvas[0];
    const ctx = canvas.getContext("2d");

    const paddleWidth = 10, paddleHeight = 100, ballSize = 10;
    let paddle1Y = 190, paddle2Y = 190;
    let ballX = 320, ballY = 240, ballSpeedX = 3, ballSpeedY = 3;
    let playerRole;
    
    const socket = new WebSocket("ws://127.0.0.1:8080/pong");

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.role) {
            playerRole = data.role;
            console.log(`Vous êtes : ${playerRole}`);
        } else {
            paddle1Y = data.paddle1Y;
            paddle2Y = data.paddle2Y;
            ballX = data.ballX;
            ballY = data.ballY;
        }
    };

    $canvas.on("mousemove", function (event) {
        const rect = canvas.getBoundingClientRect();
        if (playerRole === "player1") {
            paddle1Y = event.clientY - rect.top - paddleHeight / 2;
        } else if (playerRole === "player2") {
            paddle2Y = event.clientY - rect.top - paddleHeight / 2;
        }
        sendGameState();
    });

    function sendGameState() {
        if (socket.readyState === WebSocket.OPEN) {
            const gameState = { paddle1Y, paddle2Y, ballX, ballY };
            socket.send(JSON.stringify(gameState));
        }
    }

    function draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.fillRect(10, paddle1Y, paddleWidth, paddleHeight);
        
        ctx.fillStyle = "white";
        ctx.fillRect(canvas.width - 20, paddle2Y, paddleWidth, paddleHeight);
        
        ctx.fillStyle = "white";
        ctx.fillRect(ballX, ballY, ballSize, ballSize);
    }
    
    function updateBall() {
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        
        if (ballY <= 0 || ballY + ballSize >= canvas.height) {
            ballSpeedY *= -1;
        }
        
        if (ballX <= 20 && ballY >= paddle1Y && ballY <= paddle1Y + paddleHeight) {
            ballSpeedX *= -1;
        }
        if (ballX >= canvas.width - 30 && ballY >= paddle2Y && ballY <= paddle2Y + paddleHeight) {
            ballSpeedX *= -1;
        }
        
        if (ballX < 0 || ballX > canvas.width) {
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            ballSpeedX *= -1;
        }
    }
    
    function gameLoop() {
        draw();
        updateBall();
        sendGameState();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});
