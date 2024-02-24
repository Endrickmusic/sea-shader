import { RGBADepthPacking, MeshDepthMaterial, MathUtils, Vector2 } from "three"
import { useEffect, useMemo } from "react"
import { useFrame } from '@react-three/fiber'

export default function modMaterial( {planeRef, onDepthMaterialUpdate, hovered} ) {

    const customUniforms = useMemo(() => ({
        uTime: { value: 0 },
        uDisplay: { value: 1.0 },
        uMouse: { type: 'vec2', value: new Vector2() },
        uResolution: { type: "v2", value: new Vector2(4, 3) },

        uBigWaveElevation: { type: "f", value: options.BigWaveElevation },
        uBigWaveFrequency: { type: "vec2", value: new Vector2(options.BigWaveFrequencyX, options.BigWaveFrequencyY), },
        uBigWaveSpeed: { type: "f", value: options.BigWaveSpeed },

        uSmallWaveElevation: { type: "f", value: options.SmallWaveElevation },
        uSmallWaveFrequency: { type: "f", value: options.SmallWaveFrequency, },
        uSmallWaveSpeed: { type: "f", value: options.SmallWaveSpeed, },
        uSmallWaveIteration: { type: "f", value: options.SmallWaveIteration, },

        uDepthColor: { type: "color", value: new Color(debugObject.depthColor), },
        uSurfaceColor: { type: "color", value: new Color(debugObject.surfaceColor), },
        uColorOffset: { type: "f", value: options.colorOffset, },
        uColorMultiplier: { type: "f", value: options.colorMultiplier,
        }
      }),[])

    useFrame((state, delta) => {
        customUniforms.uTime.value += 0.01
        const transValue = hovered.current ? 3.0 : 1.0
        customUniforms.uDisplay.value = MathUtils.lerp(customUniforms.uDisplay.value, transValue, 0.075)
      })

    useEffect(() => {

    planeRef.current.material.onBeforeCompile = (shader) => {

    console.log('Shader compilation triggered')
    shader.uniforms = {...customUniforms, ...shader.uniforms }  

    shader.vertexShader = shader.vertexShader.replace(

        '#include <common>',
        `
            #include <common>

            uniform float uTime;
            uniform float uDisplay;
            uniform vec2 uMouse;

            uniform float uBigWaveElevation;
            uniform vec2 uBigWaveFrequency;
            uniform float uBigWaveSpeed;

            uniform float uSmallWaveElevation;
            uniform float uSmallWaveFrequency;
            uniform float uSmallWaveSpeed;
            uniform float uSmallWaveIteration;

            varying vec2 vUv;
            varying vec3 vColor;
            varying float vElevation;

            float PI = 3.141592;

    //	Classic Perlin 3D Noise 
    //	by Stefan Gustavson
    //
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

    float cnoise(vec3 P){
      vec3 Pi0 = floor(P); // Integer part for indexing
      vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
      Pi0 = mod(Pi0, 289.0);
      Pi1 = mod(Pi1, 289.0);
      vec3 Pf0 = fract(P); // Fractional part for interpolation
      vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;

      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);

      vec4 gx0 = ixy0 / 7.0;
      vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);

      vec4 gx1 = ixy1 / 7.0;
      vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);

      vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
      vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
      vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
      vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
      vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
      vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
      vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
      vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

      vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;
      vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;

      float n000 = dot(g000, Pf0);
      float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
      float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
      float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
      float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
      float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
      float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
      float n111 = dot(g111, Pf1);

      vec3 fade_xyz = fade(Pf0);
      vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
      vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
      float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
      return 2.2 * n_xyz;
      }

      float distorted_pos(vec3 position){
        float elevation = sin(modelPosition.x * uBigWaveFrequency.x + uTime * uBigWaveSpeed) * 
                          cos(modelPosition.y * uBigWaveFrequency.y + uTime * uBigWaveSpeed * 0.5) * 
                          uBigWaveElevation;

        for(float i = 1.0; i <= uSmallWaveIteration; i++)
            {
             elevation -= abs(cnoise(vec3(modelPosition.xz * uSmallWaveFrequency * i, uTime * uSmallWaveSpeed)) * uSmallWaveElevation / i);
            }
        return elevation;
      }

      vec3 orthogonal(vec3 n){
        return normalize(
            abs(n.x) > abs(n.z) ? vec3(n.y, n.x, 0) : vec3(0., -n.z, n.y)
        );
      }

        ` 
        )

    shader.vertexShader = shader.vertexShader.replace(
            '#include <beginnormal_vertex>',
           
            `
                #include <beginnormal_vertex>
               
                vec3 eps = vec3(0.001, 0., 0.);    

                vec3 tangent = orthogonal(normal);
                vec3 bitangent = normalize(cross(tangent, normal));

                vec3 neighbor1 = position + tangent * 0.0001;
                vec3 neighbor1 = position + bitangent * 0.0001;

                vec3 displacedN1 = neughbour1 + normal * distorted_pos(neighbor1);
                vec3 displacedN2 = neughbour1 + normal * distorted_pos(neighbor2);

                vec3 displacedTangent = diplacedN1 - displacedPosition;
                vec3 displacedBitangent = diplacedN2 - displacedPosition;

                vec3 displacedNormal = normalize(cross(displacedTangent, displacesBitangent));

                objectNormal = displacedNormal; 

            `
        )

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>

            transformed.y = distorted_pos(position); 

        `
     )
    }
  
  const depthMaterial = new MeshDepthMaterial({
    depthPacking: RGBADepthPacking
  })

  depthMaterial.onBeforeCompile = (shader) =>
   {
    shader.uniforms = {...customUniforms, ...shader.uniforms }  

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
          #include <common>

          uniform float uTime;
          uniform float uDisplay;
          uniform vec2 uMouse;

          
          uniform float uBigWaveElevation;
          uniform vec2 uBigWaveFrequency;
          uniform float uBigWaveSpeed;

          uniform float uSmallWaveElevation;
          uniform float uSmallWaveFrequency;
          uniform float uSmallWaveSpeed;
          uniform float uSmallWaveIteration;

          varying vec2 vUv;
          varying vec3 vColor;
          varying float vElevation;

          float PI = 3.141592;

          //	Classic Perlin 3D Noise 
          //	by Stefan Gustavson
          //
          vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
          vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
      
          float cnoise(vec3 P){
            vec3 Pi0 = floor(P); // Integer part for indexing
            vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P); // Fractional part for interpolation
            vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;
      
            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);
      
            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);
      
            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);
      
            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
      
            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;
      
            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);
      
            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
            return 2.2 * n_xyz;
            }
      `
      )

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>

            float elevation = sin(modelPosition.x * uBigWaveFrequency.x + uTime * uBigWaveSpeed) * 
            cos(modelPosition.y * uBigWaveFrequency.y + uTime * uBigWaveSpeed * 0.5) * 
            uBigWaveElevation;

            for(float i = 1.0; i <= uSmallWaveIteration; i++)
              {
                elevation -= abs(cnoise(vec3(modelPosition.xz * uSmallWaveFrequency * i, uTime * uSmallWaveSpeed)) * uSmallWaveElevation / i);
              }

              transformed.y = elevation; 

      `
      )  

}

planeRef.current.customDepthMaterial = depthMaterial
onDepthMaterialUpdate(depthMaterial.current)
}, [planeRef, onDepthMaterialUpdate])


return null
}


