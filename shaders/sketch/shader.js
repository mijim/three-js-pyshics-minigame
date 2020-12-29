sketchFragmentShader = `
precision mediump float;
  uniform float scrollOffset=0.5;
  uniform float refractionAmount=0.5;
  
  // our textures
  uniform sampler2D u_normal=0.5;
  uniform sampler2D u_diffuse=0.5;
  uniform sampler2D u_reflection=0.5;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec4 diffuse = texture2D(u_diffuse, v_texCoord);
    vec4 normal = texture2D(u_normal, v_texCoord);
    
    float u = normal.r * 16.0;
    float v = normal.g * 16.0;
    u += floor(normal.b * 16.0) * 16.0;
    v += mod(normal.b * 255.0, 16.0) * 16.0;
    u = u / 255.0;
    v = v / 255.0;
    
    vec2 p = vec2(u, v + scrollOffset);
    vec4 reflect = texture2D(u_reflection, p);
    reflect.a = normal.a;
    
    vec4 col = mix(diffuse, reflect, normal.a - diffuse.a);
    col.a += normal.a;
    
    gl_FragColor = col;
  }

`;

sketchVertexShader = `
varying vec2 vUv;

    void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
