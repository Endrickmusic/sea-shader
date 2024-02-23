const fragmentShader = `

uniform float uTime;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 uResolution;
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vColor;
varying float vElevation;

float PI = 3.1415926;


void main() {

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(uTime+vUv.xyx + vec3(0,2,4));

    // Output to screen
    // gl_FragColor = vec4(col, 1.0);
    // col = mix(vec3(0.0), vec3(1.0), vElevation * 5.0 + 0.5);
    col = mix(uDepthColor, uSurfaceColor, vElevation * 5.0 + 0.5);
    gl_FragColor = vec4(col, 1.0);
	#include <colorspace_fragment>
}

`

export default fragmentShader