const electron = require( 'electron' );
const path = require( 'path' );

const ipc = electron.ipcRenderer;
const shell = electron.shell;
const config = {
    lineWidth: 2.5,

    strokeConnected: '#000000',
    strokeNotConnected: '#C0C0C0',

    fillPushed: '#D8FF00',
    fillNotPushed: '#ffffff',
    
    fillShadow: '#A0A0A0',
    fillTextConnected: '#303030',
    fillTextNotConnected: '#E0E0E0',
    fillTextWarning: '#FF7700',

    fillActive: '#FF5D00',
    fillInactive: '#FFFFFF',

    pushOffset: 3,

    fontButton: '16px Arial',
    fontButtonSmall: '10px Arial',
    fontButtonMedium: '12px Arial',
}

let gamepadState;

const scratchDir =  __dirname + path.sep + 'scratch' + path.sep;


ipc.on('gamepad-changed', (event, state) => {
    // state will always be onther instance
    gamepadState = state;
} );

document.getElementById('linkExtScratchOffline').onclick = e => {
    e.preventDefault();
    shell.openExternal ( 'https://scratch.mit.edu/scratch2download/' );
}

var linkDirScratch1 = document.getElementById('linkDirScratch1');
linkDirScratch1.innerText = scratchDir;
linkDirScratch1.onclick = e => {
    e.preventDefault();
    shell.showItemInFolder ( scratchDir + 'bestuur_een_aap.sb2' );
}

var linkDirScratch2 = document.getElementById('linkDirScratch2');
linkDirScratch2.innerText = scratchDir;
linkDirScratch2.onclick = e => {
    e.preventDefault();
    shell.showItemInFolder ( scratchDir + 'leeg_project.sb2' );
}

document.getElementById('btnOpenAlleKnoppen').onclick = _ => shell.openItem( scratchDir + 'test_alle_knoppen.sb2') ;
document.getElementById('btnBestuurEenDing').onclick = _ => shell.openItem( scratchDir + 'bestuur_een_aap.sb2') ;
document.getElementById('btnOpenLeegProject').onclick = _ => shell.openItem( scratchDir + 'leeg_project.sb2') ;

window.requestAnimationFrame( drawCanvas );

function drawCanvas(){

    const canvas = document.getElementById("controllerCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.textAlign = 'center';

    drawControllerOutline( ctx, gamepadState );

    var buttonOffset = 35;
    drawStateButton( ctx, 385, 140 - buttonOffset, gamepadState, 'button1', '1' );
    drawStateButton( ctx, 385 + buttonOffset, 140, gamepadState, 'button2', '2' );
    drawStateButton( ctx, 385, 140 + buttonOffset, gamepadState, 'button3', '3' );
    drawStateButton( ctx, 385 - buttonOffset, 140, gamepadState, 'button4', '4' );

    drawStateButton( ctx, 140, 140 - buttonOffset, gamepadState, 'buttonUp', '^' );
    drawStateButton( ctx, 140 + buttonOffset, 140, gamepadState, 'buttonRight', '>' );
    drawStateButton( ctx, 140, 140 + buttonOffset, gamepadState, 'buttonDown', 'v' );
    drawStateButton( ctx, 140 - buttonOffset, 140, gamepadState, 'buttonLeft', '<' );

    drawJoystick( ctx, 200, 200, gamepadState, 'joystick_left_x', 'joystick_left_y', 'button_joystick_left' );
    drawJoystick( ctx, 325, 200, gamepadState, 'joystick_right_x', 'joystick_right_y', 'button_joystick_right' );

    drawAnalogButton( ctx, 262.5, 180, gamepadState );

    drawStateButtonRoundRect( ctx, 240, 130, gamepadState, 'buttonSelect', 'SELECT', null );
    drawStateButtonRoundRect( ctx, 285, 130, gamepadState, 'buttonStart', 'START', null );

    drawStateButtonRoundRect( ctx, 140, 52, gamepadState, 'buttonl1', null, 'L1' );
    drawStateButtonRoundRect( ctx, 140, 30, gamepadState, 'buttonl2', null, 'L2' );
    drawStateButtonRoundRect( ctx, 385, 52, gamepadState, 'buttonr1', null, 'R1' );
    drawStateButtonRoundRect( ctx, 385, 30, gamepadState, 'buttonr2', null, 'R2' );
    

    window.requestAnimationFrame( drawCanvas );
}

function drawControllerOutline( ctx, gamepadState ){
    setStrokeProps( ctx, gamepadState );

    // X-mirror = 525 - x

    // Joystick area
    drawCircle( ctx, 200, 200, 40 );
    drawCircle( ctx, 325, 200, 40 );

    // Button area
    drawCircle( ctx, 140, 140, 75, 1.4, 6.45);
    drawCircle( ctx, 385, 140, 75, 3, 8);
   
    // Horizontal lines
    drawLine( ctx, 250, 200, 275, 200 );
    drawLine( ctx, 195, 80, 330, 80 );

    // Handles
    drawBezier( ctx, 65, 140, 155, 220, 0, 325, 100, 325);
    drawBezier( ctx, 460, 140, 370, 220, 525, 325, 425, 325);
   
    // Front burtton areas
    drawBezier( ctx, 95, 80, 185, 80, 110, 10, 170, 10);
    drawBezier( ctx, 430, 80, 340, 80, 415, 10, 355, 10);

    let connected = gamepadState && gamepadState.connected;
    if( !connected && new Date().getMilliseconds() > 500 ) {
        ctx.fillStyle = config.fillTextWarning;
        ctx.font = config.fontButtonMedium;
        ctx.fillText( 'Geen controller verbonden...', 262.5, 40 );
    }
}



function drawStateButton( ctx, x, y, gamepadState, property, text ){
    
    setStrokeProps( ctx, gamepadState );
    const pushed = gamepadState && gamepadState[property]

    // shadow
    ctx.beginPath();
    ctx.ellipse( x + config.pushOffset, y + config.pushOffset, 20, 20, 0, 0, 2 * Math.PI);
    ctx.fillStyle = config.fillShadow;
    ctx.fill();

    // button
    ctx.beginPath();
    if( pushed ){
        ctx.fillStyle = config.fillPushed;
        x += config.pushOffset;
        y += config.pushOffset;
    }
    else{
        
        ctx.fillStyle = config.fillNotPushed;
    }
    ctx.ellipse( x, y, 20, 20, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Button text
    setTextFill( ctx, gamepadState );
    ctx.font = config.fontButton;
    ctx.fillText( text, x, y + 6 );
}

function drawJoystick( ctx, x, y, gamepadState, propX, propY, propButton ){
    setStrokeProps( ctx, gamepadState );

    let joyX = 0;
    if( gamepadState && gamepadState[propX] ){
        joyX = gamepadState[propX] / 7.0;
    }

    let joyY = 0;
    if( gamepadState && gamepadState[propY] ){
        joyY = -gamepadState[propY] / 7.0;
    }

    let joyBtn = gamepadState && gamepadState[propButton]

    // shadow
    ctx.beginPath();
    ctx.ellipse( x + joyX + config.pushOffset, y + joyY + config.pushOffset, 30, 30, 0, 0, 2 * Math.PI);
    ctx.fillStyle = config.fillShadow;
    ctx.fill();

    // button
    ctx.beginPath();
    if( joyBtn ){
        ctx.fillStyle = config.fillPushed;
        x += config.pushOffset;
        y += config.pushOffset;
    }
    else {
        ctx.fillStyle = config.fillNotPushed;
    }
    ctx.ellipse( x + joyX, y + joyY, 30, 30, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawAnalogButton( ctx, x, y, gamepadState ){
    var h = 10.0;
    var w = 15.0;

    let analog = gamepadState && gamepadState.analog;
    if( analog ){
        ctx.fillStyle = config.fillActive;
    }
    else {
        ctx.fillStyle = config.fillInactive;
    }

    setStrokeProps( ctx, gamepadState );
    drawRoundRect( ctx, x, y, w, h );
    
    ctx.beginPath();
    setTextFill( ctx, gamepadState );
    ctx.font = config.fontButtonSmall;
    ctx.fillText( 'ANALOG', x, y - 8 );
}

function drawStateButtonRoundRect( ctx, x, y, gamepadState, prop, textBelow, textIn ){
    setStrokeProps( ctx, gamepadState );

    let pushed = gamepadState && gamepadState[prop];
    var h = textIn ? 16.0 : 10.0;
    var w = 15.0;

    ctx.fillStyle = config.fillShadow;
    drawRoundRect( ctx, x + config.pushOffset, y + config.pushOffset, w, h, false );

    if( textBelow ){
        ctx.beginPath();
        setTextFill( ctx, gamepadState );
        ctx.font = config.fontButtonSmall,
        ctx.fillText( textBelow, x, y + 18 );
    }

    if( pushed ){
        ctx.fillStyle = config.fillPushed;
        x += config.pushOffset;
        y += config.pushOffset;
    }
    else {
        ctx.fillStyle = config.fillNotPushed;
    }
    drawRoundRect( ctx, x, y, w, h );

    if( textIn ){
        ctx.beginPath();
        setTextFill( ctx, gamepadState );
        ctx.font = config.fontButtonMedium;
        ctx.fillText( textIn, x, y + 4);
    }
}

function setStrokeProps( ctx, gamepadState ) {
    ctx.lineWidth = config.lineWidth;    
    if( gamepadState && gamepadState.connected ) {
        ctx.strokeStyle = config.strokeConnected;
    }
    else {
        ctx.strokeStyle = config.strokeNotConnected;
    }
}

function drawCircle( ctx, x, y, r, startAngle, endAngle ){
    if( !startAngle ){
        startAngle = 0.0;
    }

    if( !endAngle ){
        endAngle = 2 * Math.PI;
    }

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

function drawRoundRect( ctx, x, y, w, h, stroke = true ){
    ctx.beginPath();
    ctx.moveTo( x - w / 2, y - h / 2);
    ctx.lineTo( x + w / 2, y - h / 2 );
    ctx.arc( x + w/2, y, h / 2, -Math.PI / 2, Math.PI / 2 );
    ctx.lineTo( x - w / 2, y + h / 2 );
    ctx.arc( x - w/2, y, h / 2, Math.PI / 2, -Math.PI / 2 );
    ctx.fill();
    if(stroke ){
        ctx.stroke();
    }
}

function setTextFill( ctx, gamepadState ) {
    if( gamepadState && gamepadState.connected ){
        ctx.fillStyle = config.fillTextConnected;
    }
    else{
        ctx.fillStyle = config.fillTextNotConnected;
    }
}