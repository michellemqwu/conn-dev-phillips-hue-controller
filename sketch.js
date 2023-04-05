let video;
let poseNet;
let pose;

let brightnessSlider;
let colorSlider;

let lastBrightness;
let lastHue;

let url = '172.22.151.226';
let username = '040OmdLSJi-A2bAmpBd9E0sgr3gD0j3Ft3gWMkO-';
let lightNumber = 3;
let result;

function setup() {
  createCanvas(640, 480);
  
  video = createCapture(VIDEO);
  video.hide();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotHumans);
  
  brightnessSlider = createSlider(1, 254, 127, 10);
  brightnessSlider.position(width/2, height/2);
  brightnessSlider.addClass("mySliders");
  
  colorSlider = createSlider(0, 65535, 32767, 2000);
  colorSlider.position(width/7, height/2);
  colorSlider.addClass("mySliders");
  
  connect(); 
}

function draw() {
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);
  
  if (pose) {
    let noseX = pose.keypoints[0].position.x;
    let noseY = pose.keypoints[0].position.y;
    circle(noseX, noseY, 30);
    
    if (withinBrightnessSlider(floor(noseX), floor(noseY))) {
      brightnessSlider.value(map(noseX, brightnessSlider.x, brightnessSlider.x - brightnessSlider.width, 1, 254));
    } 
    
    if (withinColorSlider(floor(noseX), floor(noseY))) {
      colorSlider.value(map(noseX, width - colorSlider.x, width - colorSlider.x - colorSlider.width, 0, 65535));
    }

    if (brightnessSlider.value() != lastBrightness) {
      changeBrightness();
      //console.log("brightness: ", brightnessSlider.value());
    }

    if (colorSlider.value() != lastHue) {
      changeHue();
      //console.log("hue: ", colorSlider.value());
    }

    lastBrightness = brightnessSlider.value();
    lastHue = colorSlider.value();
  }
  
  pop();
}

function withinBrightnessSlider(x, y) {
  if ((x >= brightnessSlider.x - brightnessSlider.width && x <= brightnessSlider.x) && (y >= brightnessSlider.y - brightnessSlider.height && y <= brightnessSlider.y)) {
    return true;
  } 
  return false;
}

function withinColorSlider(x, y) {
  if ((x >= width - colorSlider.x - colorSlider.width && x <= width - colorSlider.x) && (y >= colorSlider.y - colorSlider.height && y <= colorSlider.y)) {
    return true;
  } 
  return false;
}

function connect() {
  url = 'http://' + url + '/api/' + username + '/lights/';
  httpDo(url, 'GET', getLights);
}

function getLights(result) {
  result = result;
  console.log("api ready");
}

function changeBrightness() {
  let brightness = brightnessSlider.value(); // get the value of this slider
  let lightState = {             // make a JSON object with it
    bri: brightness,
    on: true
  }
  setLight(lightNumber, lightState);
}

function changeHue() {
  let hue = colorSlider.value(); // get the value of this slider
  let lightState = {             // make a JSON object with it
    hue: hue,
    on: true
  }
  setLight(lightNumber, lightState);
}

function setLight(whichLight, data) {
  let path =    url + whichLight + '/state/';
  let content = JSON.stringify(data);				 // convert JSON obj to string
  httpDo( path, 'PUT', content, 'text', getLights); //HTTP PUT the change
}

function gotHumans(humans) {
  if (humans.length > 0) {
    pose = humans[0].pose;
  }
}

function modelLoaded() {
  console.log("poseNet ready");
}