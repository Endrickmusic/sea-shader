import { OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
import { DoubleSide, Vector2, Color } from "three"
import { useControls } from "leva"

import vertexShader from "./shader/vertexShader.js"
import fragmentShader from "./shader/fragmentShader.js"


export default function Shader(){

    const meshRef = useRef()
    const materialRef = useRef()
    const debugObject = {}

    debugObject.depthColor = '#0000ff'
    debugObject.surfaceColor = '#8888ff'

    const options = useControls("Waves",{
      BigWaveElevation: { value: 0.15, min: 0, max: 1, step: 0.001 },
      BigWaveFrequencyX: { value: 18, min: 0, max: 100, step: 0.01 },
      BigWaveFrequencyY: { value: 15, min: 0, max: 100, step: 0.01 },
      BigWaveSpeed: { value: 0.75, min: -1.5, max: 1.5, step: 0.01 },
      DepthColor: { value: debugObject.depthColor },
      SurfaceColor: { value: debugObject.surfaceColor },
      })

    useFrame((state) => {
      let time = state.clock.getElapsedTime()
  
      // start from 20 to skip first 20 seconds ( optional )
      meshRef.current.material.uniforms.uTime.value = time
      
    
    })
  
      // Define the shader uniforms with memoization to optimize performance
      const uniforms = useMemo(
        () => ({
          uTime: {
            type: "f",
            value: 1.0,
              },
          uResolution: {
            type: "v2",
            value: new Vector2(4, 3),
            },
          uBigWaveElevation: {
              type: "f",
              value: options.BigWaveElevation,
              },
          uBigWaveFrequency: {
              type: "vec2",
              value: new Vector2(options.BigWaveFrequencyX, options.BigWaveFrequencyY),
              },
          uBigWaveSpeed: {
              type: "f",
              value: options.BigWaveSpeed,
              },
          uDepthColor: {
              type: "color",
              value: new Color(debugObject.depthColor),
              },
          uSurfaceColor: {
              type: "color",
              value: new Color(debugObject.surfaceColor),
              }
         }),[]
      )   

      useEffect(
        (state, delta) => {

          console.log(materialRef.current.uniforms)
          if (materialRef.current.uniforms) {
            materialRef.current.uniforms.uBigWaveElevation.value = options.BigWaveElevation
            materialRef.current.uniforms.uBigWaveFrequency.value.x = options.BigWaveFrequencyX
            materialRef.current.uniforms.uBigWaveFrequency.value.y = options.BigWaveFrequencyY
            materialRef.current.uniforms.uBigWaveSpeed.value = options.BigWaveSpeed
            materialRef.current.uniforms.uDepthColor.value.set(options.DepthColor)
            materialRef.current.uniforms.uSurfaceColor.value.set(options.SurfaceColor)
          }
        },
        [options]
      )

  const viewport = useThree(state => state.viewport)
  
  return (
    <>
      <OrbitControls />    
      <mesh 
      ref={meshRef}
      scale={1}
      rotation={[0.6*Math.PI, 0, 0]}
      >
          <planeGeometry args={[1, 1, 128, 128]} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            wireframe={true}
          />
        </mesh>
   </>
  )}
