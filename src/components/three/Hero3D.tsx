"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * Shared GLSL — simplex noise (Ashima) used by aurora + terrain.
 * ------------------------------------------------------------------ */
const SNOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  for(int i=0;i<5;i++){v+=a*snoise(p);p*=2.0;a*=0.5;}
  return v;
}
`;

/* ------------------------------------------------------------------ *
 * Aurora curtains — spectral, with vertical ray striations and two
 * parallax layers for depth. Bright tips cross the bloom threshold.
 * ------------------------------------------------------------------ */
function AuroraLayer({
  z,
  scaleArr,
  speed,
  intensity,
  colorA,
  colorB,
}: {
  z: number;
  scaleArr: [number, number, number];
  speed: number;
  intensity: number;
  colorA: string;
  colorB: string;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uIntensity: { value: intensity },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uColorTip: { value: new THREE.Color("#aaffcc") },
    }),
    [speed, intensity, colorA, colorB]
  );
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });

  return (
    <mesh position={[0, 1.7, z]} scale={scaleArr}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
        `}
        fragmentShader={
          SNOISE +
          /* glsl */ `
          varying vec2 vUv;
          uniform float uTime; uniform float uSpeed; uniform float uIntensity;
          uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorTip;
          void main(){
            vec2 uv=vUv;
            float t=uTime*uSpeed;
            float bands=fbm(vec2(uv.x*3.0, uv.y*1.2 - t*2.0));
            float curtain=fbm(vec2(uv.x*6.0 + bands*0.6 + t, uv.y*0.6));
            float intensity=smoothstep(0.0,1.0,curtain*0.5+0.5);
            // fine vertical ray striations
            float rays=0.5+0.5*sin((uv.x*120.0)+bands*6.0+t*3.0);
            rays=mix(1.0, rays, 0.35);
            intensity*=rays;
            // fade top & bottom into the void
            float vmask=smoothstep(0.0,0.4,uv.y)*smoothstep(1.0,0.5,uv.y);
            intensity*=vmask;
            // spectral gradient: base -> green -> bright teal tip with height
            vec3 col=mix(uColorB,uColorA,intensity);
            col=mix(col,uColorTip,pow(intensity,3.0)*0.8);
            float alpha=intensity*uIntensity;
            gl_FragColor=vec4(col,alpha);
          }
        `
        }
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * Boreal terrain — displaced wireframe ridges, glowing crest.
 * ------------------------------------------------------------------ */
function Terrain() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#15512e") },
      uRim: { value: new THREE.Color("#39ff14") },
    }),
    []
  );
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });

  return (
    <mesh rotation={[-Math.PI / 2.18, 0, 0]} position={[0, -1.7, -1]}>
      <planeGeometry args={[26, 22, 120, 120]} />
      <shaderMaterial
        ref={mat}
        wireframe
        transparent
        uniforms={uniforms}
        vertexShader={
          SNOISE +
          /* glsl */ `
          varying float vH;
          varying vec2 vUv;
          uniform float uTime;
          void main(){
            vUv=uv;
            vec3 p=position;
            float ridge=fbm(vec2(p.x*0.18, p.y*0.18 + uTime*0.04));
            float detail=fbm(vec2(p.x*0.6, p.y*0.6 - uTime*0.02))*0.35;
            float h=(ridge+detail);
            h*=smoothstep(0.0,5.0,abs(p.x))*1.6+0.4;
            p.z+=h*1.8;
            vH=h;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
          }
        `
        }
        fragmentShader={/* glsl */ `
          varying float vH;
          varying vec2 vUv;
          uniform vec3 uColor;
          uniform vec3 uRim;
          void main(){
            float peak=smoothstep(0.4,1.5,vH);
            // crest glows hot enough to catch bloom
            vec3 col=mix(uColor,uRim,peak)*(1.0+peak*1.4);
            float depthFade=smoothstep(0.0,0.55,vUv.y);
            float nearFade=smoothstep(1.0,0.7,vUv.y);
            float a=depthFade*nearFade*(0.16+peak*0.7);
            gl_FragColor=vec4(col,a);
          }
        `}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * Drifting snow / ember particle field with subtle twinkle.
 * ------------------------------------------------------------------ */
function Particles({ count = 1000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = Math.random() * 10 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      speeds[i] = 0.15 + Math.random() * 0.5;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt * 0.5;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.5 + i) * dt * 0.04;
      if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = -2.5;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y += dt * 0.01;
    const m = pts.material as THREE.PointsMaterial;
    m.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 1.5) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#d8f5e2"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ *
 * Camera rig — slow drift + mouse parallax + scroll dolly.
 * ------------------------------------------------------------------ */
function Rig() {
  const { camera, pointer } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const scroll =
      typeof window !== "undefined"
        ? Math.min(1, window.scrollY / Math.max(1, window.innerHeight))
        : 0;
    const targetX = pointer.x * 0.6 + Math.sin(t * 0.1) * 0.2;
    const targetY = 0.5 + pointer.y * 0.3 + Math.cos(t * 0.12) * 0.12 - scroll * 0.8;
    const targetZ = 6.2 - scroll * 1.6; // dolly forward on scroll
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.position.z += (targetZ - camera.position.z) * 0.04;
    camera.lookAt(0, 0.4 - scroll * 0.4, -3);
  });
  return null;
}

export default function Hero3D() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0.6, 6.2], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fogExp2 attach="fog" args={["#050505", 0.052]} />
      <ambientLight intensity={0.4} />

      <AuroraLayer
        z={-7}
        scaleArr={[20, 9, 1]}
        speed={0.06}
        intensity={0.55}
        colorA="#00ff41"
        colorB="#0b6b3a"
      />
      {/* second, slower, deeper curtain for parallax depth */}
      <AuroraLayer
        z={-10}
        scaleArr={[28, 11, 1]}
        speed={0.035}
        intensity={0.3}
        colorA="#23c0ff"
        colorB="#0a3b52"
      />

      <Terrain />
      <Particles />
      <Rig />

      {!reduced && (
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={0.85}
            luminanceThreshold={0.45}
            luminanceSmoothing={0.3}
            radius={0.72}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
