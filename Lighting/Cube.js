class Cube {
   constructor() {
      this.type = 'cube';
      this.color = [1.0,1.0,1.0];
      this.matrix = new Matrix4();
      this.normalMatrix = new Matrix4();
      this.textureNum = 0;
      this.specOn = 0;
      this.texColorWeight = 0;
      this.baseColor = [0.25,0.25,1,1];

   }

   render(){
      // var xy = this.position;
      var rgba = this.color;
      var baseColor = this.baseColor;
      // var size = this.size;

      gl.uniform1i(u_whichTexture,this.textureNum);
      gl.uniform1i(u_specularOn,this.specOn);
      gl.uniform1i(u_texColorWeight,this.texColorWeight);

      //Pass the color of point to u_FragColor variable
      gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3]);

      gl.uniform4f(u_BaseColor,baseColor[0],baseColor[1],baseColor[2],baseColor[3]);


      gl.uniformMatrix4fv(u_ModelMatrix,false,this.matrix.elements);
      gl.uniformMatrix4fv(u_NormalMatrix,false,this.normalMatrix.elements);

      //Back
      drawTriangle3DUVNormal([0,0,0,  1,1,0,  1,0,0],[0,0, 1,1, 1,0],[0,0,-1,0,0,-1,0,0,-1]);
      drawTriangle3DUVNormal([0,0,0,  0,1,0,  1,1,0],[0,0, 0,1, 1,1],[0,0,-1,0,0,-1,0,0,-1]);


      //Top
      drawTriangle3DUVNormal([0,1,0,  0,1,1,  1,1,1],[0,0, 0,1, 1,1],[0,1,0, 0,1,0, 0,1,0]);
      drawTriangle3DUVNormal([0,1,0,  1,1,1,  1,1,0],[0,0, 1,1, 1,0],[0,1,0, 0,1,0, 0,1,0]);



      // Front
      drawTriangle3DUVNormal([0,0,1,  1,1,1,  1,0,1],[0,0, 1,1, 1,0],[0,0,1, 0,0,1, 0,0,1]);
      drawTriangle3DUVNormal([0,0,1,  0,1,1,  1,1,1],[0,0, 0,1, 1,1],[0,0,1, 0,0,1, 0,0,1]);



      //left
      drawTriangle3DUVNormal([0,0,0,  0,1,1, 0,0,1],[0,0, 1,1, 1,0],[-1,0,0, -1,0,0, -1,0,0]);
      drawTriangle3DUVNormal([0,0,0,  0,1,0,  0,1,1],[0,0, 0,1, 1,1],[-1,0,0, -1,0,0, -1,0,0]);

      //Right
      drawTriangle3DUVNormal([1,0,0,  1,1,1, 1,0,1],[0,0, 1,1, 1,0],[1,0,0, 1,0,0, 1,0,0]);
      drawTriangle3DUVNormal([1,0,0,  1,1,0,  1,1,1],[0,0, 0,1, 1,1],[1,0,0, 1,0,0, 1,0,0]);


      // Bottom
      drawTriangle3DUVNormal([0,0,0,  0,0,1,  1,0,1],[0,0, 0,1, 1,1],[0,-1,0, 0,-1,0, 0,-1,0]);
      drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0],[0,0, 1,1, 1,0],[0,-1,0, 0,-1,0, 0,-1,0]);


   }
}
