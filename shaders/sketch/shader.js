sketchFragmentShader = `
precision highp float;
	
varying vec2 vUv;
	
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform float u_time;

void main() {
    vec3 pX = vec3(vUv.x);
    vec3 pY = vec3(vUv.y);
	
	vec3 c1 = u_c1;
	vec3 c2 = u_c2;
	vec3 c3 = vec3(0.0, 1.0, 1.0); // aqua
	
    vec3 cmix1 = mix(c1, c2, pX + pY/2. + cos(u_time));
	vec3 cmix2 = mix(c2, c3, (pY - sin(u_time))*0.5);
	vec3 color = mix(cmix1, cmix2, pX * cos(u_time+2.));

    gl_FragColor = vec4(color, 1.0);
}

`;

sketchVertexShader = `
varying vec2 vUv;

    void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
