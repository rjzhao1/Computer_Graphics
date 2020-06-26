// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
   attribute vec4 a_Position;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotation;
   void main() {
      gl_Position = u_GlobalRotation*u_ModelMatrix*a_Position;
   }`

// Fragment shader program
var FSHADER_SOURCE =`
   precision mediump float;
   uniform vec4 u_FragColor;
   void main() {
      gl_FragColor = u_FragColor;
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
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotation;

//Rotation variables to control the animal
let gAnimalGlobalRotation = 0;
let g_torsoRotation = -105;
let g_frontLegRRotation = 15;
let g_frontLegLRotation = 15;
let g_bottomFrontLegRRotation = 5;
let g_bottomFrontLegLRotation = 5;
let g_hindLegRRotation = -5;
let g_hindLegLRotation = -5;
let g_bottomHindLegRRotation = 10;
let g_bottomHindLegLRotation = 10;
let g_backRotation = 0;


let g_Animation = false;


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

   // Get the storage location of u_FragColor
   u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
   if (!u_FragColor) {
     console.log('Failed to get the storage location of u_FragColor');
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
   document.getElementById('angleSlide').addEventListener('mousemove',function(){gAnimalGlobalRotation=this.value;renderScene();});
   document.getElementById('torsoSlide').addEventListener('mousemove',function(){g_torsoRotation=this.value;renderScene();});
   document.getElementById('FrontLegRSlide').addEventListener('mousemove',function(){g_frontLegRRotation=this.value;renderScene();});
   document.getElementById('FrontLegLSlide').addEventListener('mousemove',function(){g_frontLegLRotation=this.value;renderScene();});

   document.getElementById('BottomFrontLegRSlide').addEventListener('mousemove',function(){g_bottomFrontLegRRotation=this.value;renderScene();});
   document.getElementById('BottomFrontLegLSlide').addEventListener('mousemove',function(){g_bottomFrontLegLRotation=this.value;renderScene();});

   document.getElementById('HindLegRSlide').addEventListener('mousemove',function(){g_hindLegRRotation=this.value;renderScene();});
   document.getElementById('HindLegLSlide').addEventListener('mousemove',function(){g_hindLegLRotation=this.value;renderScene();});

   document.getElementById('BottomHindLegRSlide').addEventListener('mousemove',function(){g_bottomHindLegRRotation=this.value;renderScene();});
   document.getElementById('BottomHindLegLSlide').addEventListener('mousemove',function(){g_bottomHindLegLRotation=this.value;renderScene();});


   document.getElementById('animationYellowOnButton').onclick = function(){g_Animation=true};
   document.getElementById('animationYellowOffButton').onclick = function(){g_Animation=false};




}
function main() {
   //set up canvas and gl variables
   setupWebGL();
   //Set up GLSL shader programs and connect GLSL variables
   connectVariableToGLSL();
   addActionsForHtmlUI();


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  renderScene();
  requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick(){
   g_seconds=performance.now()/1000.0-g_startTime;
   console.log(g_seconds);

   updateAnimationAngle();

   renderScene();

   requestAnimationFrame(tick);
}

function updateAnimationAngle(){
   if(g_Animation){
      g_torsoRotation=(10*Math.sin(2*g_seconds)-100);
      g_frontLegRRotation=(20*Math.sin(2*g_seconds)+15);
      g_bottomFrontLegRRotation=-(20*Math.sin(2*g_seconds)-10);

      g_frontLegLRotation=-(20*Math.sin(2*g_seconds)-15);
      g_bottomFrontLegLRotation=(20*Math.sin(2*g_seconds)+10);

      g_hindLegRRotation=-(10*Math.sin(2*g_seconds)+10);
      g_bottomHindLegRRotation=-(10*Math.sin(2*g_seconds)-15);

      g_hindLegLRotation=(5*Math.sin(2*g_seconds)-5);
      g_bottomHindLegLRotation=(15*Math.sin(2*g_seconds)+10);

      g_backRotation=(5*Math.sin(2*g_seconds));
   }
}

//Function that draws the
//class function .render() is used to draw the cube instead of a DrawCube Function
function renderScene(){

   var globalRotMatrix = new Matrix4().rotate(gAnimalGlobalRotation,0,1,0);
   gl.uniformMatrix4fv(u_GlobalRotation,false,globalRotMatrix.elements)
   // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


   //Body
   var frontBody = new Cube();
   frontBody.color=LIGHT_BROWN;
   frontBody.matrix.translate(-0.05,-0.25,0.0);
   frontBody.matrix.rotate(-40,0,1,0)
   frontBody.matrix.rotate(0,1,0,0)
   frontBody.matrix.scale(0.4,0.4,0.5);
   var frontBodyMatrix = new Matrix4(frontBody.matrix);
   frontBody.render();



   // Front Half
   var torso = new Cube();
   torso.color=DARK_BROWN;
   torso.matrix = new Matrix4(frontBodyMatrix);
   torso.matrix.translate(0.4,0.2,-0.01);
   torso.matrix.rotate(-g_torsoRotation,0,0,1);
   torso.matrix.scale(1.75,.75,.8);
   var torsoMatrix = new Matrix4(torso.matrix)
   torso.render();

   // Head
   var face = new Cube();
   face.color = LIGHT_GREY;
   face.matrix = new Matrix4(torsoMatrix);
   face.matrix.translate(0.6,0.7,0.3);
   face.matrix.rotate(20,0,0,1);
   face.matrix.scale(0.4,1,0.5);
   var faceMatrix = new Matrix4(face.matrix)
   face.render();


   var nose = new Cube();
   nose.color = LIGHT_RED;
   nose.matrix = new Matrix4(faceMatrix);
   nose.matrix.translate(0.2,0.7,0.15);
   nose.matrix.scale(0.5,0.5,0.7);
   nose.render();

   var earR = new Cube();
   earR.color=LIGHT_BROWN;
   earR.matrix = new Matrix4(torsoMatrix);
   earR.matrix.translate(1,0,0);
   earR.matrix.scale(0.2,0.2,0.2);
   earR.render();

   var earL = new Cube();
   earL.color=LIGHT_BROWN;
   earL.matrix = new Matrix4(torsoMatrix);
   earL.matrix.translate(1,0,0.8);
   earL.matrix.scale(0.2,0.2,0.2);
   earL.render();

   // Front Legs
   //top
   var topFrontLegRight = new Cube();
   topFrontLegRight.color=DARK_BROWN;
   topFrontLegRight.matrix= new Matrix4(torsoMatrix);
   topFrontLegRight.matrix.translate(-0.4,0,-0.2);
   topFrontLegRight.matrix.scale(.6,1.1,0.5);
   topFrontLegRight.matrix.rotate(-g_frontLegRRotation,0,0,1);
   rightFrontMat= new Matrix4(topFrontLegRight.matrix);
   topFrontLegRight.render();

   var topFrontLegLeft = new Cube();
   topFrontLegLeft.color=DARK_BROWN;
   topFrontLegLeft.matrix= new Matrix4(torsoMatrix);
   topFrontLegLeft.matrix.translate(-0.4,0,0.7);
   topFrontLegLeft.matrix.scale(.6,1.1,0.5);
   topFrontLegLeft.matrix.rotate(-g_frontLegLRotation,0,0,1);
   leftFrontMat= new Matrix4(topFrontLegLeft.matrix);
   topFrontLegLeft.render();

   //bottom
   var bottomFrontLegRight = new Cube();
   bottomFrontLegRight.color=LIGHT_GREY;
   bottomFrontLegRight.matrix= rightFrontMat;
   bottomFrontLegRight.matrix.rotate(g_bottomFrontLegRRotation,0,0,1);
   bottomFrontLegRight.matrix.translate(-1,0.25,0.001);
   bottomFrontLegRight.matrix.scale(1.5,0.6,0.9);
   bottomFrontLegRight.render();


   var bottomFrontLegLeft = new Cube();
   bottomFrontLegRight.color=LIGHT_GREY;
   bottomFrontLegRight.matrix= leftFrontMat;
   bottomFrontLegRight.matrix.rotate(g_bottomFrontLegLRotation,0,0,1);
   bottomFrontLegRight.matrix.translate(-1,0.25,0.001);
   bottomFrontLegRight.matrix.scale(1.5,0.6,0.9);
   bottomFrontLegRight.render();


   // Back Half
   var backBody = new Cube();
   backBody.color=DARK_BROWN;
   backBody.matrix= new Matrix4(frontBodyMatrix);
   backBody.matrix.rotate(g_backRotation,0,0,1);
   backBody.matrix.translate(1,-0.1,-0.1);
   backBody.matrix.scale(1.1,1.25,1.25);
   var backMatrix = new Matrix4(backBody.matrix)
   backBody.render();

   var tail = new Cube();
   tail.color = LIGHT_BROWN;
   tail.matrix = new Matrix4(backMatrix);
   tail.matrix.translate(.9,1,.4);
   tail.matrix.scale(0.3,0.3,0.3);
   tail.render();
   // Back Legs
   //top
   var topHindLegLeft = new Cube();
   topHindLegLeft.color=DARK_BROWN;
   topHindLegLeft.matrix= new Matrix4(backMatrix);
   topHindLegLeft.matrix.rotate(g_hindLegLRotation,0,0,1);
   topHindLegLeft.matrix.translate(.25,-0.4,0.7);
   topHindLegLeft.matrix.scale(.7,1,0.4);
   leftHindMat= new Matrix4(topHindLegLeft.matrix);
   topHindLegLeft.render();


   var topHindLegRight = new Cube();
   topHindLegRight.color=DARK_BROWN;
   topHindLegRight.matrix= new Matrix4(backMatrix);
   topHindLegRight.matrix.rotate(g_hindLegRRotation,0,0,1);
   topHindLegRight.matrix.translate(.25,-0.4,-0.1);
   topHindLegRight.matrix.scale(.7,1,0.4);
   rightHindMat= new Matrix4(topHindLegRight.matrix);
   topHindLegRight.render();

   //bottom
   var bottomHindLegLeft = new Cube();
   bottomHindLegLeft.color=LIGHT_GREY;
   bottomHindLegLeft.matrix = leftHindMat;
   bottomHindLegLeft.matrix.rotate(g_bottomHindLegLRotation,0,0,1);
   bottomHindLegLeft.matrix.translate(0.2,-0.7,0.001);
   bottomHindLegLeft.matrix.scale(0.65,1,0.9);
   bottomHindLegLeft.render();

   var bottomHindLegRight = new Cube();
   bottomHindLegRight.color=LIGHT_GREY;
   bottomHindLegRight.matrix = rightHindMat;
   bottomHindLegRight.matrix.rotate(g_bottomHindLegRRotation,0,0,1);
   bottomHindLegRight.matrix.translate(0.2,-0.7,0.001);
   bottomHindLegRight.matrix.scale(0.65,1,0.9);
   bottomHindLegRight.render();

}
