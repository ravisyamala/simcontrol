

const sharp = require('sharp');
var curMainView = 'mainViewMap'; 
var io = require('socket.io')(http);
let robot = require("robotjs");

var mainView = {
  X: 3126,
  Y: 954,
  W: 797,
  H: 1400
};

var mainViewMap = {
  X: 3126,
  Y: 954,
  W: 797,
  H: 1400
};

var mainViewHole = {
  X: 1459,
  Y: 635,
  W: 900,
  H: 1866
};

var mainViewOptions = {
  X: 2311,
  Y: 17,
  W: 559,
  H: 636
};

function changeMainView(changeToView, cmd){
    mainView= changeToView; 
    curMainView = cmd; 
    robot.setMouseDelay(50); 
    robot.moveMouse(getCord(changeToView.X+changeToView.W/2),getCord(changeToView.Y+changeToView.H/2));
  }



  function broadcastRegion(emitName,x,y,width,height){
    let image = robot.screen.capture(x,y,width,height);
    swapRedAndBlueChannel(image); 
    const data =sharp(image.image,{raw: {width: image.width, height: image.height, channels: 4}})
    .toFormat('png')
    .removeAlpha()
    .resize(Math.round(image.width/2),Math.round(image.height/2))
    .toBuffer((err, data, info) => {io.emit(emitName,data); }); 
  
    if(curMainView === 'optionsView'){
        if(robot.getPixelColor(getCord(2571), getCord(301)) === '000000')
          console.log('I would have tried to go back to map view'); 
    }
  }
  
  function broadcastMap(){
    broadcastRegion('update-map',mainView.X,mainView.Y,mainView.W,mainView.H);
  }
  
  
  function broadcastScoreboard(){
    broadcastRegion('update-scoreboard',0,0,990,240);
  }
  