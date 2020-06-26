class Camera {
   constructor() {
      this.type = 'Camera';
      this.eye = new Vector3([0,0,0]);
      this.at = new Vector3([0,0,-1]);
      this.up = new Vector3([0,1,0]);
      this.fov = 60;
      this.angle = 5;
      this.viewMatrix = new Matrix4();
      this.projMatrix = new Matrix4();
      this.canvas = document.getElementById('webgl');

   }
   moveFoward(){
      let d = new Vector3(this.at.elements);
      d.sub(this.eye);
      d.normalize();
      d.mul(0.1);
      this.eye.add(d);
      this.at.add(d);
   }

   moveBack(){
      let d = new Vector3(this.at.elements);
      d.sub(this.eye);
      d.normalize();
      d.mul(0.1);
      this.eye.sub(d);
      this.at.sub(d);
   }

   moveLeft(){
      let d = new Vector3(this.at.elements);
      d.sub(this.eye);
      let left = new Vector3();
      left = Vector3.cross(d,this.up);
      left.mul(0.05);
      this.eye.sub(left);
      this.at.sub(left);
   }

   moveRight(){
      let d = new Vector3(this.at.elements);
      d.sub(this.eye);
      let right = new Vector3();
      right = Vector3.cross(d,this.up);
      right.mul(0.05);
      this.eye.add(right);
      this.at.add(right);
   }

   panLeft(){
      let d = new Vector3(this.at.elements);
      d.sub(this.eye);
      let rotate = new Matrix4().setRotate(5,this.up.elements[0],this.up.elements[1],this.up.elements[2]);
      let newD = rotate.multiplyVector3(d);
      this.at.mul(0);
      this.at.add(this.eye);
      this.at.add(newD);
   }


   panRight(){
      let d = new Vector3(this.at.elements);
      d.sub(this.eye);
      let rotate = new Matrix4().setRotate(-5,this.up.elements[0],this.up.elements[1],this.up.elements[2]);
      let newD = rotate.multiplyVector3(d);
      this.at.mul(0);
      this.at.add(this.eye);
      this.at.add(newD);
   }

   panMouse(){
      let d = new Vector3(this.at.elements);
      d.sub(this.eye);
      let rotate = new Matrix4().setRotate(this.angle,this.up.elements[0],this.up.elements[1],this.up.elements[2]);
      let newD = rotate.multiplyVector3(d);
      this.at.mul(0);
      this.at.add(this.eye);
      this.at.add(newD);
   }

   setUpCamera(){
      gl.uniformMatrix4fv(u_viewMatrix,false,this.viewMatrix.elements);
      gl.uniformMatrix4fv(u_ProjectionMatrix,false,this.projMatrix.elements);

      this.viewMatrix.setLookAt(this.eye.elements[0],this.eye.elements[1],this.eye.elements[2],
                           this.at.elements[0],this.at.elements[1] , this.at.elements[2],
                           this.up.elements[0],this.up.elements[1],this.up.elements[2]);

      this.projMatrix.setPerspective(this.fov,this.canvas.width/this.canvas.height,.1,1000);
   }
}
