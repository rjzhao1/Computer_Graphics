class Cube {
   constructor() {
      this.type = 'cube';
      // this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0];
      // this.size = 5.0;
      // this.segments = 10;
      this.matrix = new Matrix4();
   }

   render(){
      // var xy = this.position;
      var rgba = this.color;
      // var size = this.size;
      //Pass the color of point to u_FragColor variable
      gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3]);

      gl.uniformMatrix4fv(u_ModelMatrix,false,this.matrix.elements);

      //Front
      drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
      drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);

      gl.uniform4f(u_FragColor,rgba[0]*.9,rgba[1]*.9,rgba[2]*.9,rgba[3]);

      //Top
      drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
      drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

      //Back
      drawTriangle3D([0,0,1,  1,1,1,  1,0,1]);
      drawTriangle3D([0,0,1,  0,1,1,  1,1,1]);

      //left
      gl.uniform4f(u_FragColor,rgba[0]*.8,rgba[1]*.8,rgba[2]*.8,rgba[3]);
      drawTriangle3D([0,0,0,  0,1,1, 0,0,1]);
      drawTriangle3D([0,0,0,  0,1,0,  0,1,1]);

      //Right
      gl.uniform4f(u_FragColor,rgba[0]*.7,rgba[1]*.7,rgba[2]*.7,rgba[3]);
      drawTriangle3D([1,0,0,  1,1,1, 1,0,1]);
      drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);

      gl.uniform4f(u_FragColor,rgba[0]*.9,rgba[1]*.9,rgba[2]*.9,rgba[3]);
      drawTriangle3D([0,0,0,  0,0,1,  1,0,1]);
      drawTriangle3D([0,0,0, 1,0,1, 1,0,0]);


   }
}
