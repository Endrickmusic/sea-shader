const vertexShader = `
attribute vec4 vertexPosition;

uniform float uTime;
uniform float uBigWaveElevation;
uniform vec2 uBigWaveFrequency;
uniform float uBigWaveSpeed;

varying vec2 vUv;
varying vec3 vColor;
varying float vElevation;

float PI = 3.141592;


void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    float elevation = sin(modelPosition.x * uBigWaveFrequency.x + uTime * uBigWaveSpeed) * 
                      cos(modelPosition.y * uBigWaveFrequency.y + uTime * uBigWaveSpeed * 0.5) * 
                      uBigWaveElevation;

    modelPosition.y = elevation; 

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Varyings
    vUv = uv;
    vElevation = elevation;
}

`

export default vertexShader