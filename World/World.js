// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   varying vec2 v_UV;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotation;
   uniform mat4 u_viewMatrix;
   uniform mat4 u_ProjectionMatrix;

   void main() {
      gl_Position = u_ProjectionMatrix*u_viewMatrix*u_GlobalRotation*u_ModelMatrix*a_Position;
      v_UV = a_UV;
   }`

// Fragment shader program
var FSHADER_SOURCE =`
   precision mediump float;
   varying vec2 v_UV;
   uniform vec4 u_FragColor;
   uniform vec4 u_BaseColor;
   uniform sampler2D u_Sampler0;
   uniform sampler2D u_Sampler1;
   uniform int u_texColorWeight;
   uniform int u_whichTexture;
   void main() {
      if(u_whichTexture==-3){
         gl_FragColor = u_FragColor;
      }else if (u_whichTexture==-2){
         gl_FragColor = vec4(v_UV,1.0,1.0);
      }else if (u_whichTexture==-1){
         gl_FragColor = texture2D(u_Sampler1,v_UV);
      }else if (u_whichTexture==0) {
         gl_FragColor = float(1-u_texColorWeight)*(u_BaseColor)+float(u_texColorWeight)*(texture2D(u_Sampler0,v_UV));
      }else {
         gl_FragColor = vec4(1,2,2,1);
      }
   }`


//Color variables for the animal
const LIGHT_BROWN = [0.54,0.27,0.07,1.0];
const DARK_BROWN = [0.17,0.11,0.05,1.0];
const LIGHT_GREY = [0.8,0.8,0.8,1.0];
const LIGHT_RED = [0.78,0.08,0.24,1.0];




//Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotation;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_texColorWeight;


//Rotation variables to control the animal
let gAnimalGlobalRotation = 0;

let mouseX;
let mouseY;

let g_moveMouse = false;


function setupWebGL(){
   // Retrieve <canvas> element
   canvas = document.getElementById('webgl');

   // Get the rendering context for WebGL
   // gl = getWebGLContext(canvas);
   gl = canvas.getContext('webgl',{preserveDrawingBuffer:true});
   if (!gl) {
     console.log('Failed to get the rendering context for WebGL');
     return;
   }
   gl.enable(gl.DEPTH_TEST);

   }

function connectVariableToGLSL(){
   // Initialize shaders
   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
     console.log('Failed to intialize shaders.');
     return;
   }

   // // Get the storage location of a_Position
   a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0) {
     console.log('Failed to get the storage location of a_Position');
     return;
   }

   a_UV = gl.getAttribLocation(gl.program, 'a_UV');
   if (a_UV < 0) {
     console.log('Failed to get the storage location of a_UV');
     return;
   }

   // Get the storage location of u_FragColor
   u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
   if (!u_FragColor) {
     console.log('Failed to get the storage location of u_FragColor');
     return;
   }

   // Get the storage location of u_FragColor
   u_BaseColor = gl.getUniformLocation(gl.program, 'u_BaseColor');
   if (!u_BaseColor) {
    console.log('Failed to get the storage location of u_BaseColor');
    return;
   }

   u_ModelMatrix =gl.getUniformLocation(gl.program,'u_ModelMatrix');
   if (!u_ModelMatrix) {
     console.log('Failed to get the storage location of u_ModelMatrix');
     return;
   }

   u_GlobalRotation =gl.getUniformLocation(gl.program,'u_GlobalRotation');
   if (!u_GlobalRotation) {
     console.log('Failed to get the storage location of u_GlobalRotation');
     return;
   }

   // Get the storage location of u_Sampler0
   u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   if (!u_Sampler0) {
     console.log('Failed to get the storage location of u_Sampler0');
     return false;
   }

   // Get the storage location of u_Sampler1
   u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
   if (!u_Sampler1) {
     console.log('Failed to get the storage location of u_Sampler1');
     return false;
   }

   // Get the storage location of u_whichTexture
   u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
   if (!u_whichTexture) {
     console.log('Failed to get the storage location of u_whichTexture');
     return false;
   }

   u_viewMatrix =gl.getUniformLocation(gl.program,'u_viewMatrix');
   if (!u_viewMatrix) {
     console.log('Failed to get the storage location of u_viewMatrix');
     return;
   }

   u_ProjectionMatrix =gl.getUniformLocation(gl.program,'u_ProjectionMatrix');
   if (!u_ProjectionMatrix) {
     console.log('Failed to get the storage location of u_ProjectionMatrix');
     return;
   }

   // Get the storage location of u_texColorWeight
   u_texColorWeight = gl.getUniformLocation(gl.program,'u_texColorWeight');
   if (!u_texColorWeight) {
     console.log('Failed to get the storage location of u_texColorWeight');
     return false;
   }
   var identityM = new Matrix4();
   gl.uniformMatrix4fv(u_ModelMatrix,false,identityM.elements);
}

function convertCoordinatesEventToGL(ev){
   var x = ev.clientX; // x coordinate of a mouse pointer
   var y = ev.clientY; // y coordinate of a mouse pointer
   var rect = ev.target.getBoundingClientRect();

   x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
   y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
   return ([x,y])
}


function addActionsForHtmlUI(){
   document.getElementById('mouseButton').onclick = function(ev){g_moveMouse=!g_moveMouse;};
}


function main() {
   //set up canvas and gl variables
   setupWebGL();
   //Set up GLSL shader programs and connect GLSL variables
   connectVariableToGLSL();
   addActionsForHtmlUI();
   initTextures(gl);

   // Specify the color for clearing <canvas>
   gl.clearColor(0.0, 0.0, 0.0, 1.0);

  document.onkeydown = keydown;

   // if g_moveMouse is true move with mouse
   canvas.onmousemove = function(ev){
     if(g_moveMouse){
        onMove(ev);
     }
  }

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  renderScene();
  requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick(){
   g_seconds=performance.now()/1000.0-g_startTime;

   renderScene();

   requestAnimationFrame(tick);

}

//function to handle moving with the mouse
function onMove(ev){
   if(!mouseX||!mouseY){
      let [x,y]= convertCoordinatesEventToGL(ev);
      mouseX=[x,y][0];
      mouseY=[x,y][1];
   }else{
      let [newX,newY]=convertCoordinatesEventToGL(ev);
      let oldVec = new Vector3([mouseX,mouseY,cam.at.elements[2]]);
      let newVec = new Vector3([newX,newY][0],[newX,newY][1],cam.at.elements[2]);
      oldVec.sub(cam.at);
      newVec.sub(cam.at);

      let angle = angleBetween(oldVec,newVec);
      console.log(angle);
      if([newX,newY][0]>mouseX){
         cam.angle=-angle*0.25;
      }else if ([newX,newY][0]<mouseX) {
         cam.angle=angle*0.25;
      }else{
         cam.angle=0;
      }
      cam.panMouse();
      mouseX = [newX,newY][0];
      mouseY = [newX,newY][1];
   }
}

// calculates angle between two vectors
function angleBetween(v1,v2){
   let angle = 0;
   let d = Vector3.dot(v1,v2);
   let mag1 = v1.magnitude();
   let mag2 = v2.magnitude();
   let pi = Math.PI;
   angle = d/(mag1*mag2);
   angle = Math.acos(angle);
   angle =angle*(180/pi);
   return angle;
}

function keydown(ev){
   if (ev.keyCode==87) { //W key
      cam.moveFoward();
   }else if(ev.keyCode==65){ //A key
      cam.moveLeft();
   }else if (ev.keyCode==83){//S key
      cam.moveBack();
   }else if (ev.keyCode==68) { //D key
      cam.moveRight();
   }else if(ev.keyCode==81){ //Q key
      cam.panLeft();
   }else if(ev.keyCode==69){ //E key
      cam.panRight();
   }
   else{
      console.log("some other key");
   }
   renderScene();
}

function initTextures(gl) {
  // Create a texture object
  var texture0 = gl.createTexture();
  var texture1 = gl.createTexture();
  if (!texture0 || !texture1) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler0 and u_Sampler1
  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler0 || !u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  // Create the image object
  var image0 = new Image();
  var image1 = new Image();
  if (!image0 || !image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called when image loading is completed
  image0.onload = function(){ loadTexture(gl, texture0, u_Sampler0, image0, 0); };
  image1.onload = function(){ loadTexture(gl, texture1, u_Sampler1, image1, 1); };
  // Tell the browser to load an Image
  image0.src = 'blocks.png';
  image1.src = 'brick.jpg';

  return true;
}


// Specify whether the texture unit is ready to use
function loadTexture(gl, texture, u_Sampler, image, texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
  // Make the texture unit active
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
  } else {
    gl.activeTexture(gl.TEXTURE1);
  }
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler, texUnit);   // Pass the texure unit to u_Sampler

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}




var cam = new Camera();

//map to draw the walls
var g_map =[
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,3,0,0,1,1,1,1,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,1,1,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];


function drawMap(){
   for(x=0;x<32;x++){
      for(y=0;y<32;y++){
         if(g_map[x][y]>0){
            for(z=0;z<g_map[x][y];z++){
               var wall = new Cube();
               wall.color = [1.0,1.0,1.0,1.0];
               wall.matrix.translate(x-4,z-.75,y-4);
               wall.textureNum=0;
               wall.texColorWeight=1;
               wall.render();
            }
         }
      }
   }
}

//Function that draws the
//class function .render() is used to draw the cube instead of a DrawCube Function
function renderScene(){

   cam.setUpCamera();

   var globalRotMatrix = new Matrix4().rotate(-gAnimalGlobalRotation,0,1,0);
   gl.uniformMatrix4fv(u_GlobalRotation,false,globalRotMatrix.elements);

   // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.clear(gl.COLOR_BUFFER_BIT );


   var floor = new Cube();
   floor.textureNum = -1;
   floor.color =  LIGHT_BROWN;
   floor.matrix.translate(0,-0.75,0);
   floor.matrix.scale(100,0,100);
   floor.matrix.translate(-0.5,0,-0.5);
   floor.render();

   var sky = new Cube();
   sky.textureNum=-3;
   sky.color = [0.25,0.25,1,1];
   sky.matrix.scale(1000,1000,1000);
   sky.matrix.translate(-0.5,-0.5,-0.5);
   sky.render();

   drawMap();

}
