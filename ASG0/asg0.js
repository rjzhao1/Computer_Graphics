 // DrawRectangle.js
 function main() {
    // Retrieve <canvas> element <- (1)
    canvas = document.getElementById("example");
    if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return;
    }

    // Get the rendering context for 2DCG <- (2)
    ctx = canvas.getContext('2d');
    let v1 = new Vector3([2.25,2.25,0]);

    // console.log(v1);

    // Draw a blue rectangle <- (3)
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color
    drawVector(v1,"red");
 }

//Taken and Modify from https://www.w3schools.com/tags/canvas_lineto.asp
function drawVector(v,color){
   ctx.beginPath();
   ctx.moveTo(canvas.height/2,canvas.width/2);
   ctx.lineTo(200+v.elements[0]*20,200-v.elements[1]*20);//Taken from piazza post @38
   ctx.strokeStyle = color;
   ctx.stroke();
}

function handleDrawEvent(){
   //Clearing and redrawing the canvas
   ctx.clearRect(0,0,canvas.width,canvas.height);
   ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
   ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color

   //getting coordinates for v1 and v2
   let x_coor1 = document.getElementById('x-coord1').value;
   let y_coor1 = document.getElementById('y-coord1').value;
   let v1 = new Vector3([x_coor1,y_coor1,0]);
   let x_coor2 = document.getElementById('x-coord2').value;
   let y_coor2 = document.getElementById('y-coord2').value;
   let v2 = new Vector3([x_coor2,y_coor2,0]);
   drawVector(v1,"red");
   drawVector(v2,"blue");
}

function handleDrawOperationEvent(){
   //Clearing and redrawing the canvas
   ctx.clearRect(0,0,canvas.width,canvas.height);
   ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
   ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color

   //getting coordinates for v1 and v2
   let x_coor1 = document.getElementById('x-coord1').value;
   let y_coor1 = document.getElementById('y-coord1').value;
   let v1 = new Vector3([x_coor1,y_coor1,0]);
   let x_coor2 = document.getElementById('x-coord2').value;
   let y_coor2 = document.getElementById('y-coord2').value;
   let v2 = new Vector3([x_coor2,y_coor2,0]);
   drawVector(v1,"red");
   drawVector(v2,"blue");

   let op = document.getElementById("ops").value;
   let v3 = new Vector3();
   let v4 = new Vector3();
   let scalar = document.getElementById("scalar").value;

   // cases for different Operations
   switch (op) {
      case "add":
         v3 = v1;
         v3.add(v2);
         drawVector(v3,"green");
         break;
      case "subtract":
         v3 = v1;
         v3.sub(v2);
         drawVector(v3,"green");
         break;
      case "multiply":
         v3 = v1;
         v4 = v2;
         v3.mul(scalar);
         v4.mul(scalar);
         drawVector(v3,"green");
         drawVector(v4,"green");
         break;
      case "divide":
         v3 = v1;
         v4 = v2;
         v3.div(scalar);
         v4.div(scalar);
         drawVector(v3,"green");
         drawVector(v4,"green");
         break;
      case "mag":
         console.log("Magnitude v1:",v1.magnitude());
         console.log("Magnitude v2:",v2.magnitude());
         break;
      case "norm":
         v3 = v1;
         v3.normalize();
         v4 = v2;
         v4.normalize();
         drawVector(v3,"green");
         drawVector(v4,"green");
         break;
      case "angle":
         console.log("Angle:",angleBetween(v1,v2));
         break;
      case "area":
         console.log("Area of the triangle:",areaTriangle(v1,v2));
         break;
      default:
         break;
   }
}

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


function areaTriangle(v1,v2){
   let v3 = Vector3.cross(v1,v2);
   let area = v3.magnitude()/2;
   return area;
}
