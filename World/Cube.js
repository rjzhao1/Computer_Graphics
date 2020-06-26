class Cube {
   constructor() {
      this.type = 'cube';
      this.color = [1.0,1.0,1.0];
      this.matrix = new Matrix4();
      this.textureNum = -2;
      this.texColorWeight = 0;
      this.baseColor = [0.25,0.25,1,1];

   }

   render(){
      // var xy = this.position;
      var rgba = this.color;
      var baseColor = this.baseColor;
      // var size = this.size;

      gl.uniform1i(u_whichTexture,this.textureNum);
      gl.uniform1i(u_texColorWeight,this.texColorWeight);

      //Pass the color of point to u_FragColor variable
      gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3]);

      gl.uniform4f(u_BaseColor,baseColor[0],baseColor[1],baseColor[2],baseColor[3]);


      gl.uniformMatrix4fv(u_ModelMatrix,false,this.matrix.elements);

      //Front
      drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0],[0,0, 1,1, 1,0]);
      drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0],[0,0, 0,1, 1,1]);

      //Top
      drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1],[0,0, 0,1, 1,1]);
      drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0],[0,0, 1,1, 1,0]);


      //Back
      drawTriangle3DUV([0,0,1,  1,1,1,  1,0,1],[0,0, 1,1, 1,0]);
      drawTriangle3DUV([0,0,1,  0,1,1,  1,1,1],[0,0, 0,1, 1,1]);

      //left
      drawTriangle3DUV([0,0,0,  0,1,1, 0,0,1],[0,0, 1,1, 1,0]);
      drawTriangle3DUV([0,0,0,  0,1,0,  0,1,1],[0,0, 0,1, 1,1]);

      //Right
      drawTriangle3DUV([1,0,0,  1,1,1, 1,0,1],[0,0, 1,1, 1,0]);
      drawTriangle3DUV([1,0,0,  1,1,0,  1,1,1],[0,0, 0,1, 1,1]);


      gl.uniform4f(u_FragColor,rgba[0]*.9,rgba[1]*.9,rgba[2]*.9,rgba[3]);
      drawTriangle3DUV([0,0,0,  0,0,1,  1,0,1],[0,0, 0,1, 1,1]);
      drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0],[0,0, 1,1, 1,0]);
   }
}
