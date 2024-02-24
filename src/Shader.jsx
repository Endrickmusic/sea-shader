import { OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
import { DoubleSide, Vector2, Color } from "three"
import { useControls, Leva } from "leva"

import vertexShader from "./shader/vertexShader.js"
import fragmentShader from "./shader/fragmentShader.js"


export default function Shader(){

    const meshRef = useRef()
    const materialRef = useRef()
    const debugObject = {}

    debugObject.depthColor = '#4242c1'
    debugObject.surfaceColor = '#ffb700'

    const options = useControls("Ocean",{

      'Big Waves': folder({
      BigWaveElevation: { value: 0.13, min: 0, max: 1, step: 0.001 },
      BigWaveFrequencyX: { value: 6.17, min: 0, max: 100, step: 0.01 },
      BigWaveFrequencyY: { value: 8.46, min: 0, max: 100, step: 0.01 },
      BigWaveSpeed: { value: 0.75, min: -1.5, max: 1.5, step: 0.01 }}),
      
      'Small Waves': folder({
      SmallWaveElevation: { value: 0.06, min: 0, max: 1, step: 0.0001 },
      SmallWaveFrequency: { value: 7.26, min: 0, max: 100, step: 0.001 },
      SmallWaveSpeed: { value: 0.64, min: -4, max: 4, step: 0.01 },
      SmallWaveIteration: { value: 4, min: 0, max: 7, step: 1 }}),
      'Colors': folder({
      DepthColor: { value: debugObject.depthColor },
      SurfaceColor: { value: debugObject.surfaceColor },
      ColorOffset: { value: 0.2, min: -1.0, max: 1, step: 0.01 },
      ColorMultiplier: { value: 2.9, min: 0.0, max: 15, step: 0.1 }}),

      Wireframe: false,
      Linewidth: { value: 1, min: 0.5, max: 10, step: 0.1 }
      
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

          uSmallWaveElevation: {
              type: "f",
              value: options.SmallWaveElevation,
              },
          uSmallWaveFrequency: {
              type: "f",
              value: options.SmallWaveFrequency,
              },
          uSmallWaveSpeed: {
              type: "f",
              value: options.SmallWaveSpeed,
              },
          uSmallWaveIteration: {
              type: "f",
              value: options.SmallWaveIteration,
              },

          uDepthColor: {
              type: "color",
              value: new Color(debugObject.depthColor),
              },
          uSurfaceColor: {
              type: "color",
              value: new Color(debugObject.surfaceColor),
              },
          uColorOffset: {
              type: "f",
              value: options.colorOffset,
              },
          uColorMultiplier: {
              type: "f",
              value: options.colorMultiplier,
          }
         }),[]
      )   

      useEffect(
        (state, delta) => {

          console.log(materialRef.current)
          if (materialRef.current.uniforms) {
            materialRef.current.uniforms.uBigWaveElevation.value = options.BigWaveElevation
            materialRef.current.uniforms.uBigWaveFrequency.value.x = options.BigWaveFrequencyX
            materialRef.current.uniforms.uBigWaveFrequency.value.y = options.BigWaveFrequencyY
            materialRef.current.uniforms.uBigWaveSpeed.value = options.BigWaveSpeed
            
            materialRef.current.uniforms.uSmallWaveElevation.value = options.SmallWaveElevation
            materialRef.current.uniforms.uSmallWaveFrequency.value = options.SmallWaveFrequency
            materialRef.current.uniforms.uSmallWaveSpeed.value = options.SmallWaveSpeed
            materialRef.current.uniforms.uSmallWaveIteration.value = options.SmallWaveIteration

            materialRef.current.uniforms.uDepthColor.value.set(options.DepthColor)
            materialRef.current.uniforms.uSurfaceColor.value.set(options.SurfaceColor)
            materialRef.current.uniforms.uColorOffset.value = options.ColorOffset
            materialRef.current.uniforms.uColorMultiplier.value = options.ColorMultiplier
            
            materialRef.current.wireframe = options.Wireframe
            materialRef.current.wireframeLinewidth = options.Linewidth
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
          <planeGeometry args={[1, 1, 512, 512]} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            wireframe={true}
            wireframeLinewidth={5}
          />
        </mesh>
   </>
  )}
