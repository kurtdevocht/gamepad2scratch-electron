const electron = require( 'electron' );
const ipc = electron.ipcRenderer;
let gamepadState;

ipc.on('gamepad-changed', (event, state) => {
    console.log( JSON.stringify( state ) );
    gamepadState = state;
} );



window.requestAnimationFrame( drawCanvas );

function drawCanvas(){

    const canvas = document.getElementById("controllerCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth=2.5;

    drawController( ctx );
/*
    
    ctx.beginPath();
    if( gamepadState && gamepadState['1']){
        ctx.fillStyle = "#ffff00";
    }
    else {
         ctx.fillStyle = "red";
    }
   
ctx.ellipse(100, 100, 20, 20, 0, 0, 2 * Math.PI);
ctx.fill();
ctx.stroke();
ctx.font = '30px Arial';
ctx.strokeText( '1', 20, 20);

ctx.beginPath();
    if( gamepadState && gamepadState['2']){
        ctx.fillStyle = "green";
    }
    else {
         ctx.fillStyle = "red";
    }
   
ctx.ellipse(200, 100, 20, 20, 0, 0, 2 * Math.PI);
ctx.fill();
ctx.stroke();
*/

    window.requestAnimationFrame( drawCanvas );
}

function drawController( ctx ){
    ctx.lineWidth=2.5;

    // X-mirror = 525 - x

    // Joystick area
    drawCircle( ctx, 200, 200, 50 );
    drawCircle( ctx, 325, 200, 50 );

    // Button area
    drawCircle( ctx, 140, 140, 75, 1.4, 6.45);
    drawCircle( ctx, 385, 140, 75, 3, 8);
   
    // Horizontal lines
    drawLine( ctx, 250, 200, 275, 200 );
    drawLine( ctx, 185, 80, 340, 80 );

    // Handles
    drawBezier( ctx, 65, 140, 155, 220, 0, 325, 100, 325);
    drawBezier( ctx, 460, 140, 370, 220, 525, 325, 425, 325);
   
    // Front burtton areas
    drawBezier( ctx, 95, 80, 185, 80, 110, 30, 170, 30);
    drawBezier( ctx, 430, 80, 340, 80, 415, 30, 355, 30);
   
   

    
}

function drawCircle( ctx, x, y, r, startAngle, endAngle ){
    if( !startAngle ){
        startAngle = 0.0;
    }

    if( !endAngle ){
        endAngle = 2 * Math.PI;
    }

    console.log(endAngle);
    ctx.beginPath();
    ctx.ellipse(x, y, r, r, 0, startAngle, endAngle );
    ctx.stroke();
}

function drawLine( ctx, x1, y1, x2, y2 ){
    
    ctx.beginPath();
    ctx.moveTo( x1, y1 );
    ctx.lineTo( x2, y2 );
    ctx.stroke();
    
}

function drawBezier( ctx, x1, y1, x2, y2, xc1, yc1, xc2, yc2 ){
    ctx.beginPath();
    ctx.moveTo( x1, y1 );
    ctx.bezierCurveTo( xc1, yc1, xc2, yc2, x2, y2 );
    ctx.stroke();
}