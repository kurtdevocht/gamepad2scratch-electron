/*
    GamepadState represents the cached state of a Gamepad + some additional logic:

        - The state can be converted to a string that is understood by the Scratch 2.0 hhtp interface

        - Some specific calculations are added to allow a more streamlined user experience for both analog and non-alaog mode
*/

var Gamepad = require('./Gamepad.js');
var EventEmitter = require( 'events' ).EventEmitter;
var util = require( 'util' );

// make sure the constructor inherits the properites necessary for EventEmitter to work
util.inherits( GamepadState, EventEmitter );

function GamepadState(type, index){
   EventEmitter.call( this );
   this._type = type;
   this._index = index;
   this.init();
}

GamepadState.prototype.init = function(){
    try {
        this._gamepad = new Gamepad(this._type);
        this._state = {"joystick_left":{},"joystick_right":{}};
        this._hookUpEvents();
        this._gamepad.connect();
        this._state.connected = true;
        this.emit('changed');
        console.log( "Connected to device!");
    }
    catch( error ) {
        console.log( "Failed to connect to device...");
        this.dispose();
        setTimeout( () => this.init(), 2000);
    }
}

GamepadState.prototype.dispose = function(){
    if( this._gamepad ){
        this._gamepad.dispose();
        this._gamepad.removeAllListeners;
        this._gamepad = null;
    }

    this._state = null;
}

GamepadState.prototype.scratchState = function(){
    
    if( !this._state ){
        return null;
    }

     // Calculate right joystick values
    // => In non-analog mode: emulate joystick movement when buttons 1..4 are pressed
    let joystick_left_x = this._analogXyToScratch(this._state.joystick_left.x, false, this._state.analog ? 128 : 127 );
    let joystick_left_y = this._analogXyToScratch(this._state.joystick_left.y, true, this._state.analog ? 128 : 127 );

    let joystick_right_x = 0;
    if( this._state.analog ){
        joystick_right_x = this._analogXyToScratch(this._state.joystick_right.x, false, this._state.analog ? 128 : 127);
    }
    else if( this._state['2'] && !this._state['4']){
        joystick_right_x = 100;
    }
    else if( this._state['4'] &&! this._state['2']){
        joystick_right_x = -100;
    }
    
    let joystick_right_y = 0;
    if( this._state.analog ){
        joystick_right_y = this._analogXyToScratch(this._state.joystick_right.y, true, this._state.analog ? 128 : 127);
    }
    else if( this._state['1'] && !this._state['3']){
        joystick_right_y = 100;
    }
    else if( this._state['3'] &&! this._state['1']){
        joystick_right_y = -100;
    }

    return {
        buttonUp: this._state.up || ( !this._state.analog && this._state.joystick_left.y === 0 ),
        buttonRight: this._state.right || ( !this._state.analog && this._state.joystick_left.x === 255 ),
        buttonDown: this._state.down || ( !this._state.analog && this._state.joystick_left.y === 255 ),
        buttonLeft: this._state.left || ( !this._state.analog && this._state.joystick_left.x === 0 ),

        button1: this._state['1'],
        button2: this._state['2'],
        button3: this._state['3'],
        button4: this._state['4'],

        buttonl1: this._state.l1,
        buttonl2: this._state.l2,
        buttonr1: this._state.r1,
        buttonr2: this._state.r2,

        button_joystick_left: this._state.joystick_left_button,
        button_joystick_right: this._state.joystick_right_button,

        buttonSelect: this._state.select,
        buttonStart: this._state.start,

        joystick_left_x: joystick_left_x,
        joystick_left_y: joystick_left_y,
        joystick_left_angle: this._xyToAngle(joystick_left_x, joystick_left_y),

        joystick_right_x: joystick_right_x,
        joystick_right_y: joystick_right_y,
        joystick_right_angle: this._xyToAngle(joystick_right_x, joystick_right_y),

        analog: this._state.analog,

        connected: this._state.connected
    };
}

// Converts the state to a string that can be understood by the Scratch 2.0 http interface
GamepadState.prototype.scratchify = function(){
    var result = "";

    var state = this.scratchState();
    if( !state ){
        return result;
    }

    // Non-analog mode: emulate button press when left joystick is moved
    result += "button/˄/" + this._index.toString() + " " + state.buttonUp + "\n";
    result += "button/˃/" + this._index.toString() + " " + state.buttonRight + "\n";
    result += "button/˅/" + this._index.toString() + " " + state.buttonDown + "\n";
    result += "button/˂/" + this._index.toString() + " " + state.buttonLeft + "\n";
    
    // Nothing special about these buttons...
    result += "button/1/" + this._index.toString() + " " + state.button1 + "\n";
    result += "button/2/" + this._index.toString() + " " + state.button2 + "\n";
    result += "button/3/" + this._index.toString() + " " + state.button3 + "\n";
    result += "button/4/" + this._index.toString() + " " + state.button4 + "\n";

    result += "button/l1/" + this._index.toString() + " " + state.buttonl1 + "\n";
    result += "button/l2/" + this._index.toString() + " " + state.buttonl2 + "\n";
    result += "button/r1/" + this._index.toString() + " " + state.buttonr1 + "\n";
    result += "button/r2/" + this._index.toString() + " " + state.buttonr2 + "\n";

    result += "button/joystick_left/" + this._index.toString() + " " + state.button_joystick_left + "\n";
    result += "button/joystick_right/" + this._index.toString() + " " + state.button_joystick_right + "\n";
    result += "button/select/" + this._index.toString() + " " + state.buttonSelect + "\n";
    result += "button/start/" + this._index.toString() + " " + state.buttonStart + "\n";

    // joystick values
    result += "joystick/x/left/" + this._index.toString() + " " + state.joystick_left_x + "\n";
    result += "joystick/y/left/" + this._index.toString() + " " + state.joystick_left_y + "\n";
    result += "joystick_angle/left/" + this._index.toString() + " " + state.joystick_left_angle + "\n";
    
    
    result += "joystick/x/right/" + this._index.toString() + " " + state.joystick_right_x + "\n";
    result += "joystick/y/right/" + this._index.toString() + " " + state.joystick_right_y + "\n";
    result += "joystick_angle/right/" + this._index.toString() + " " + state.joystick_right_angle + "\n";

    // Calculated value to indicate that the gamepad is in analog mode
    result += "analog/" + this._index.toString() + " " + state.analog + "\n";
    
    return result;
}
GamepadState.prototype._xyToAngle = function(x, y){
    if( x == 0 && y == 0) {
        return 90;
    }
    var result = 180 * Math.atan2(x, y) / Math.PI;
    return isNaN(result) ? 90 : result;
    
}

GamepadState.prototype._analogXyToScratch = function( value, negate, mid ){
    
    // 'mid' depends on analog mode of controller...

    var result = 0;
    
    // Map [mid ... 255] => [0 ... 100]
    if( value > mid ){
        result = 0 + 100 * (value - mid) / (255 - mid);
    }

    // Map [0 ... mid ] => [-100 ... 0]
    if( value < mid){
        result = -100 + 100 * value / mid;
    }

    if( negate ){
        result *= -1;
    }
    return result;
}

GamepadState.prototype._hookUpEvents = function(){
    this._gamepad.on('up:press', function(){
        this._state.up = true;
        this.emit('changed');
    }.bind(this));

    this._gamepad.on('up:release',function(){
        this._state.up = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('right:press', function(){
        this._state.right = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('right:release',function(){
        this._state.right = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('down:press', function(){
        this._state.down = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('down:release',function(){
        this._state.down = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('left:press', function(){
        this._state.left = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('left:release',function(){
        this._state.left = false;
        this.emit('changed');        
    }.bind(this));

     this._gamepad.on('1:press', function(){
        this._state['1'] = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('1:release',function(){
        this._state['1'] = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('2:press', function(){
        this._state['2'] = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('2:release',function(){
        this._state['2'] = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('3:press', function(){
        this._state['3'] = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('3:release',function(){
        this._state['3'] = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('4:press', function(){
        this._state['4'] = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('4:release',function(){
        this._state['4'] = false;
        this.emit('changed');        
    }.bind(this));

     this._gamepad.on('l1:press', function(){
        this._state.l1 = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('l1:release',function(){
        this._state.l1 = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('l2:press', function(){
        this._state.l2 = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('l2:release',function(){
        this._state.l2 = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('r1:press', function(){
        this._state.r1 = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('r1:release',function(){
        this._state.r1 = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('r2:press', function(){
        this._state.r2 = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('r2:release',function(){
        this._state.r2= false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('select:press', function(){
        this._state.select = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('select:release',function(){
        this._state.select = false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('start:press', function(){
        this._state.start = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('start:release',function(){
        this._state.start= false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('joystick_left_button:press', function(){
        this._state.joystick_left_button = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('joystick_left_button:release',function(){
        this._state.joystick_left_button= false;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('joystick_right_button:press', function(){
        this._state.joystick_right_button = true;
        this.emit('changed');        
    }.bind(this));

    this._gamepad.on('joystick_right_button:release',function(){
        this._state.joystick_right_button= false;
        this.emit('changed');        
    }.bind(this));

     this._gamepad.on('joystick_right:move',function(data){
        this._state.joystick_right.x = data.x;
        this._state.joystick_right.y = data.y;
        this.emit('changed');        
    }.bind(this));

     this._gamepad.on('joystick_left:move',function(data){
        this._state.joystick_left.x = data.x;
        this._state.joystick_left.y = data.y;

        // Hack to detect if the gamepad is in analog or digital mode:
        // When the left joystick is in idle position, it returns 128 when in analog mode
        // and 127 when in non-analog mode
        // => Will fail if the left joystick is not idle while analog mode is switched
        if( data.x === 128 ){
            this._state.analog = true;
        }
        if( data.x === 127 ){
            this._state.analog = false;
        }

        this.emit('changed');        
    }.bind(this));

    this._gamepad.on( 'error', (error)=> {
        console.log("Something is kaput... - " + error);
        this.dispose();
        this.init();
        this.emit('changed');        
    });
}

module.exports = GamepadState