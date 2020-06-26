// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   attribute vec3 a_Normal;
   varying vec2 v_UV;
   varying vec3 v_Normal;
   varying vec4 v_VertPos;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_NormalMatrix;
   uniform mat4 u_GlobalRotation;
   uniform mat4 u_viewMatrix;
   uniform mat4 u_ProjectionMatrix;

   void main() {
      gl_Position = u_ProjectionMatrix*u_viewMatrix*u_GlobalRotation*u_ModelMatrix*a_Position;
      v_UV = a_UV;
      v_Normal=normalize(vec3(u_NormalMatrix*vec4(a_Normal,1)));
      v_VertPos = u_ModelMatrix*a_Position;
   }`

// Fragment shader program
var FSHADER_SOURCE =`
   precision mediump float;
   varying vec2 v_UV;
   varying vec3 v_Normal;
   varying vec4 v_VertPos;
   uniform vec3 u_lightPos;
   uniform vec3 u_cameraPos;
   uniform vec4 u_FragColor;
   uniform vec4 u_BaseColor;
   uniform sampler2D u_Sampler0;
   uniform sampler2D u_Sampler1;
   uniform int u_texColorWeight;
   uniform int u_whichTexture;
   uniform int u_specularOn;
   uniform bool u_lightOn;
   void main() {
      if(u_whichTexture==-4){
         gl_FragColor = vec4((v_Normal+1.0)/2.0,1.0);
      }else if(u_whichTexture==-3){
         gl_FragColor = float(1-u_texColorWeight)*(u_BaseColor)+float(u_texColorWeight)*(texture2D(u_Sampler0,v_UV));
      }else if (u_whichTexture==-2){
         gl_FragColor = vec4(v_UV,1.0,1.0);
      }else if (u_whichTexture==-1){
         gl_FragColor = texture2D(u_Sampler1,v_UV);
      }else if (u_whichTexture==0) {
         gl_FragColor = u_FragColor;
      }else {
         gl_FragColor = vec4(1,2,2,1);
      }

      vec3 lightVector = u_lightPos-vec3(v_VertPos);
      float r=length(lightVector);
      // if(r<1.0){
      //    gl_FragColor = vec4(1,0,0,1);
      // }else if(r<2.0){
      //    gl_FragColor = vec4(0,1,0,1);
      // }

      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L),0.0);

      vec3 R = reflect(-L,N);

      vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
      float specular = pow(max(dot(E,R),0.0),100.0);
      vec3 diffuse = vec3(gl_FragColor)*nDotL;
      vec3 ambient = vec3(gl_FragColor)*0.5;
      if(u_lightOn){
         if(u_specularOn>0){
            gl_FragColor= vec4(diffuse+ambient+specular,1.0);
         }else {
            gl_FragColor= vec4(diffuse+ambient,1.0);
         }
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
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotation;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_specularOn;
let u_texColorWeight;
let u_lightPos;
let u_cameraPos;
let u_NormalMatrix;
let g_lightOn=false;



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
let g_normalOn = false;

let mouseX;
let mouseY;

let g_moveMouse = false;
let g_lightPos = [0,1,-2];


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

   a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
   if (a_Normal < 0) {
     console.log('Failed to get the storage location of a_Normal');
     return;
   }

   u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
   if (u_NormalMatrix < 0) {
     console.log('Failed to get the storage location of u_NormalMatrix');
     return;
   }

   // Get the storage location of u_FragColor
   u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
   if (!u_FragColor) {
     console.log('Failed to get the storage location of u_FragColor');
     return;
   }

   // Get the storage location of u_FragColor
   u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
   if (!u_lightOn) {
     console.log('Failed to get the storage location of u_lightOn');
     return;
   }

   // Get the storage location of u_FragColor
   u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
   if (!u_cameraPos) {
     console.log('Failed to get the storage location of u_cameraPos');
     return;
   }

   // Get the storage location of u_FragColor
   u_BaseColor = gl.getUniformLocation(gl.program, 'u_BaseColor');
   if (!u_BaseColor) {
    console.log('Failed to get the storage location of u_BaseColor');
    return;
   }

   // Get the storage location of u_FragColor
   u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
   if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
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

   // Get the storage location of u_specularOn
   u_specularOn = gl.getUniformLocation(gl.program, 'u_specularOn');
   if (!u_specularOn) {
     console.log('Failed to get the storage location of u_specularOn');
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

   document.getElementById('angleSlide').addEventListener('mousemove',function(ev){if(ev.buttons==1){gAnimalGlobalRotation=this.value;renderScene();}});
   document.getElementById('lightSlideX').addEventListener('mousemove',function(ev){if(ev.buttons==1){g_lightPos[0]=this.value/100;renderScene();}});
   document.getElementById('lightSlideY').addEventListener('mousemove',function(ev){if(ev.buttons==1){g_lightPos[1]=this.value/100;renderScene();}});
   document.getElementById('lightSlideZ').addEventListener('mousemove',function(ev){if(ev.buttons==1){g_lightPos[2]=this.value/100;renderScene();}});


   document.getElementById('animationYellowOnButton').onclick = function(){g_Animation=true};
   document.getElementById('animationYellowOffButton').onclick = function(){g_Animation=false};

   document.getElementById('lightOn').onclick = function(){g_lightOn=true};
   document.getElementById('lightOff').onclick = function(){g_lightOn=false};

   document.getElementById('normalOn').onclick = function(){g_normalOn=true,g_lightOn=false;};
   document.getElementById('normalOff').onclick = function(){g_normalOn=false};
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
   g_lightPos[0]=Math.cos(g_seconds);
}


var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick(){
   g_seconds=performance.now()/1000.0-g_startTime;

   updateAnimationAngle();


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


   gl.uniform3f(u_lightPos,g_lightPos[0],g_lightPos[1],g_lightPos[2]);
   gl.uniform3f(u_cameraPos,cam.eye.elements[0],cam.eye.elements[1],cam.eye.elements[2]);
   gl.uniform1i(u_lightOn,g_lightOn);

   var light = new Cube();
   light.color = [2,2,0,1];
   light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
   light.matrix.scale(-.1,-.1,-.1)
   light.matrix.translate(-.5,-.5,-.5);
   light.render();


   var floor = new Cube();
   floor.textureNum = -1;
   floor.specOn=1;
   floor.color =  LIGHT_BROWN;
   floor.matrix.translate(0,-1,0);
   floor.matrix.scale(20,0,20);
   floor.matrix.translate(-0.5,-1,-0.5);
   floor.render();

   var sky = new Cube();
   sky.textureNum=-2;
   if(g_normalOn){sky.textureNum=-4;}
   sky.color = [0.25,0.25,1,1];
   sky.matrix.scale(50,50,50);
   sky.matrix.translate(-0.5,-0.2,-0.5);
   sky.normalMatrix.setInverseOf(sky.matrix).transpose();
   sky.render();

   var sphere = new Sphere();
   sphere.textureNum=-1;
   sphere.specOn=1;
   if(g_normalOn){sphere.textureNum=-4;}
   sphere.matrix.scale(.5,.5,.5);
   sphere.matrix.translate(-1,0,0);
   sphere.render();

   //Body
   var frontBody = new Cube();
   if(g_normalOn){frontBody.textureNum=-4;}
   frontBody.specOn=1;
   frontBody.color=LIGHT_BROWN;
   frontBody.matrix.translate(0.75,-0.25,0);
   frontBody.matrix.rotate(40,0,1,0)
   frontBody.matrix.rotate(0,1,0,0)
   frontBody.matrix.scale(0.4,0.4,0.5);
   var frontBodyMatrix = new Matrix4(frontBody.matrix);
   frontBody.normalMatrix.setInverseOf(frontBody.matrix).transpose();
   frontBody.render();



   // Front Half
   var torso = new Cube();
   if(g_normalOn){torso.textureNum=-4;}
   torso.color=DARK_BROWN;
   torso.specOn=1;
   torso.matrix = new Matrix4(frontBodyMatrix);
   torso.matrix.translate(0.4,0.2,-0.01);
   torso.matrix.rotate(-g_torsoRotation,0,0,1);
   torso.matrix.scale(1.75,.75,.8);
   var torsoMatrix = new Matrix4(torso.matrix);
   torso.normalMatrix.setInverseOf(torso.matrix).transpose();
   torso.render();

   // Head
   var face = new Cube();
   if(g_normalOn){face.textureNum=-4;}
   face.color = LIGHT_GREY;
   face.specOn = 1;
   face.matrix = new Matrix4(torsoMatrix);
   face.matrix.translate(0.6,0.7,0.3);
   face.matrix.rotate(20,0,0,1);
   face.matrix.scale(0.4,1,0.5);
   var faceMatrix = new Matrix4(face.matrix)
   face.normalMatrix.setInverseOf(face.matrix).transpose();
   face.render();


   var nose = new Cube();
   if(g_normalOn){nose.textureNum=-4;}
   nose.color = LIGHT_RED;
   nose.specOn=1;
   nose.matrix = new Matrix4(faceMatrix);
   nose.matrix.translate(0.2,0.7,0.15);
   nose.matrix.scale(0.5,0.5,0.7);
   nose.normalMatrix.setInverseOf(nose.matrix).transpose();
   nose.render();

   var earR = new Cube();
   if(g_normalOn){earR.textureNum=-4;}
   earR.color=LIGHT_BROWN;
   earR.specOn=1;
   earR.matrix = new Matrix4(torsoMatrix);
   earR.matrix.translate(1,0,0);
   earR.matrix.scale(0.2,0.2,0.2);
   earR.normalMatrix.setInverseOf(earR.matrix).transpose();
   earR.render();

   var earL = new Cube();
   if(g_normalOn){earL.textureNum=-4;}
   earL.color=LIGHT_BROWN;
   earL.specOn=1;
   earL.matrix = new Matrix4(torsoMatrix);
   earL.matrix.translate(1,0,0.8);
   earL.matrix.scale(0.2,0.2,0.2);
   earL.normalMatrix.setInverseOf(earL.matrix).transpose();
   earL.render();

   // Front Legs
   //top
   var topFrontLegRight = new Cube();
   if(g_normalOn){topFrontLegRight.textureNum=-4;}
   topFrontLegRight.color=DARK_BROWN;
   topFrontLegRight.specOn=1;
   topFrontLegRight.matrix= new Matrix4(torsoMatrix);
   topFrontLegRight.matrix.translate(-0.4,0,-0.2);
   topFrontLegRight.matrix.scale(.6,1.1,0.5);
   topFrontLegRight.matrix.rotate(-g_frontLegRRotation,0,0,1);
   rightFrontMat= new Matrix4(topFrontLegRight.matrix);
   topFrontLegRight.normalMatrix.setInverseOf(topFrontLegRight.matrix).transpose();
   topFrontLegRight.render();

   var topFrontLegLeft = new Cube();
   if(g_normalOn){topFrontLegLeft.textureNum=-4;}
   topFrontLegLeft.color=DARK_BROWN;
   topFrontLegLeft.specOn=1;
   topFrontLegLeft.matrix= new Matrix4(torsoMatrix);
   topFrontLegLeft.matrix.translate(-0.4,0,0.7);
   topFrontLegLeft.matrix.scale(.6,1.1,0.5);
   topFrontLegLeft.matrix.rotate(-g_frontLegLRotation,0,0,1);
   leftFrontMat= new Matrix4(topFrontLegLeft.matrix);
   topFrontLegLeft.normalMatrix.setInverseOf(topFrontLegLeft.matrix).transpose();
   topFrontLegLeft.render();

   //bottom
   var bottomFrontLegRight = new Cube();
   if(g_normalOn){bottomFrontLegRight.textureNum=-4;}
   bottomFrontLegRight.color=LIGHT_GREY;
   bottomFrontLegRight.specOn=1;
   bottomFrontLegRight.matrix= rightFrontMat;
   bottomFrontLegRight.matrix.rotate(g_bottomFrontLegRRotation,0,0,1);
   bottomFrontLegRight.matrix.translate(-1,0.25,0.001);
   bottomFrontLegRight.matrix.scale(1.5,0.6,0.9);
   bottomFrontLegRight.normalMatrix.setInverseOf(bottomFrontLegRight.matrix).transpose();
   bottomFrontLegRight.render();


   var bottomFrontLegLeft = new Cube();
   if(g_normalOn){bottomFrontLegLeft.textureNum=-4;}
   bottomFrontLegLeft.color=LIGHT_GREY;
   bottomFrontLegLeft.specOn=1;
   bottomFrontLegLeft.matrix= leftFrontMat;
   bottomFrontLegLeft.matrix.rotate(g_bottomFrontLegLRotation,0,0,1);
   bottomFrontLegLeft.matrix.translate(-1,0.25,0.001);
   bottomFrontLegLeft.matrix.scale(1.5,0.6,0.9);
   bottomFrontLegLeft.normalMatrix.setInverseOf(bottomFrontLegLeft.matrix).transpose();
   bottomFrontLegLeft.render();


   // Back Half
   var backBody = new Cube();
   if(g_normalOn){backBody.textureNum=-4;}
   backBody.color=DARK_BROWN;
   backBody.specOn=1;
   backBody.matrix= new Matrix4(frontBodyMatrix);
   backBody.matrix.rotate(g_backRotation,0,0,1);
   backBody.matrix.translate(1,-0.1,-0.1);
   backBody.matrix.scale(1.1,1.25,1.25);
   var backMatrix = new Matrix4(backBody.matrix)
   backBody.normalMatrix.setInverseOf(backBody.matrix).transpose();
   backBody.render();

   var tail = new Cube();
   if(g_normalOn){tail.textureNum=-4;}
   tail.color = LIGHT_BROWN;
   tail.specOn=1;
   tail.matrix = new Matrix4(backMatrix);
   tail.matrix.translate(.9,1,.4);
   tail.matrix.scale(0.3,0.3,0.3);
   tail.normalMatrix.setInverseOf(tail.matrix).transpose();
   tail.render();
   // Back Legs
   //top
   var topHindLegLeft = new Cube();
   if(g_normalOn){topHindLegLeft.textureNum=-4;}
   topHindLegLeft.color=DARK_BROWN;
   topHindLegLeft.specOn=1;
   topHindLegLeft.matrix= new Matrix4(backMatrix);
   topHindLegLeft.matrix.rotate(g_hindLegLRotation,0,0,1);
   topHindLegLeft.matrix.translate(.25,-0.4,0.7);
   topHindLegLeft.matrix.scale(.7,1,0.4);
   leftHindMat= new Matrix4(topHindLegLeft.matrix);
   topHindLegLeft.normalMatrix.setInverseOf(topHindLegLeft.matrix).transpose();
   topHindLegLeft.render();


   var topHindLegRight = new Cube();
   if(g_normalOn){topHindLegRight.textureNum=-4;}
   topHindLegRight.color=DARK_BROWN;
   topHindLegRight.specOn=1;
   topHindLegRight.matrix= new Matrix4(backMatrix);
   topHindLegRight.matrix.rotate(g_hindLegRRotation,0,0,1);
   topHindLegRight.matrix.translate(.25,-0.4,-0.1);
   topHindLegRight.matrix.scale(.7,1,0.4);
   rightHindMat= new Matrix4(topHindLegRight.matrix);
   topHindLegRight.normalMatrix.setInverseOf(topHindLegRight.matrix).transpose();
   topHindLegRight.render();

   //bottom
   var bottomHindLegLeft = new Cube();
   if(g_normalOn){bottomHindLegLeft.textureNum=-4;}
   bottomHindLegLeft.color=LIGHT_GREY;
   bottomHindLegLeft.specOn=1;
   bottomHindLegLeft.matrix = leftHindMat;
   bottomHindLegLeft.matrix.rotate(g_bottomHindLegLRotation,0,0,1);
   bottomHindLegLeft.matrix.translate(0.2,-0.7,0.001);
   bottomHindLegLeft.matrix.scale(0.65,1,0.9);
   bottomHindLegLeft.normalMatrix.setInverseOf(bottomHindLegLeft.matrix).transpose();
   bottomHindLegLeft.render();

   var bottomHindLegRight = new Cube();
   if(g_normalOn){bottomHindLegRight.textureNum=-4;}
   bottomHindLegRight.color=LIGHT_GREY;
   bottomHindLegRight.specOn=1;
   bottomHindLegRight.matrix = rightHindMat;
   bottomHindLegRight.matrix.rotate(g_bottomHindLegRRotation,0,0,1);
   bottomHindLegRight.matrix.translate(0.2,-0.7,0.001);
   bottomHindLegRight.matrix.scale(0.65,1,0.9);
   bottomHindLegRight.normalMatrix.setInverseOf(bottomHindLegRight.matrix).transpose();
   bottomHindLegRight.render();

}
