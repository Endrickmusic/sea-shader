import { OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
import { DoubleSide, Vector2 } from "three"
import { useControls } from "leva"

import vertexShader from "./shader/vertexShader.js"
import fragmentShader from "./shader/fragmentShader.js"


export default function Shader(){

    const meshRef = useRef()
    const materialRef = useRef()

    const options = useControls("What is this",{
      BigWaveElevation: { value: 0.03, min: 0, max: 1, step: 0.001 },
      BigWaveFrequency: { value: [4, 1.5] }
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
              value: new Vector2(options.BigWaveFrequency),
              }
         }),[]
      )   

      useEffect(
        (state, delta) => {

          console.log(materialRef.current.uniforms)
          if (materialRef.current.uniforms) {
            materialRef.current.uniforms.uBigWaveElevation.value = options.BigWaveElevation
            materialRef.current.uniforms.uBigWaveFrequency.value = options.BigWaveFrequency
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
