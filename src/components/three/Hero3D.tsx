"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * Shared GLSL — simplex noise (Ashima) used by aurora + fog + terrain.
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
  for(int i=0;i<6;i++){v+=a*snoise(p);p*=2.0;a*=0.5;}
  return v;
}
`;

/* Soft circular sprite so particles read as luminous motes, never squares. */
function makeSpriteTexture() {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(216,245,226,0.7)");
  g.addColorStop(1, "rgba(216,245,226,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ *
 * Aurora curtains — spectral, ray-striated, MOUSE-REACTIVE (the field
 * flows and brightens toward the cursor). Two parallax layers.
 * ------------------------------------------------------------------ */
function AuroraLayer({
  z,
  scaleArr,
  speed,
  intensity,
  colorA,
  colorB,
  mouse,
  focus = [0.5, 0.5],
}: {
  z: number;
  scaleArr: [number, number, number];
  speed: number;
  intensity: number;
  colorA: string;
  colorB: string;
  mouse: React.MutableRefObject<THREE.Vector2>;
  focus?: [number, number];
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uIntensity: { value: intensity },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uColorTip: { value: new THREE.Color("#b8ffd6") },
      uMouse: { value: new THREE.Vector2(0.5, 0.6) },
      uFocus: { value: new THREE.Vector2(focus[0], focus[1]) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [speed, intensity, colorA, colorB, focus]
  );
  const { size, gl } = useThree();
  useFrame((_, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += dt;
    const dpr = gl.getPixelRatio ? gl.getPixelRatio() : 1;
    const res = mat.current.uniforms.uResolution.value as THREE.Vector2;
    res.set(size.width * dpr, size.height * dpr);
    // map mouse (-1..1) to screen uv (y up) and smooth-follow
    const tx = mouse.current.x * 0.5 + 0.5;
    const ty = mouse.current.y * 0.5 + 0.5;
    const u = mat.current.uniforms.uMouse.value as THREE.Vector2;
    u.x += (tx - u.x) * 0.06;
    u.y += (ty - u.y) * 0.06;
  });

  return (
    <mesh position={[0, 1.7, z]} scale={scaleArr}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={
          SNOISE +
          /* glsl */ `
          varying vec2 vUv;
          uniform float uTime; uniform float uSpeed; uniform float uIntensity;
          uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorTip;
          uniform vec2 uMouse; uniform vec2 uFocus; uniform vec2 uResolution;
          void main(){
            // true screen-space uv (y up) for focus + mouse, decoupled from geometry
            vec2 sUv = gl_FragCoord.xy / uResolution;
            vec2 uv=vUv;
            float t=uTime*uSpeed;
            // mouse pulls the flow toward the cursor and adds a glow bloom there
            // cursor field — the aurora gathers toward and blooms around the cursor
            vec2 toM = uMouse - sUv;
            float md = length(toM);
            float pull = exp(-md*md*3.2);
            uv += toM * pull * 0.16; // flow curls in toward the cursor
            float bands=fbm(vec2(uv.x*3.0, uv.y*1.2 - t*2.0 + pull*0.9));
            float curtain=fbm(vec2(uv.x*6.0 + bands*0.6 + t, uv.y*0.6));
            float intensity=smoothstep(0.0,1.0,curtain*0.5+0.5);
            float rays=0.5+0.5*sin((uv.x*120.0)+bands*6.0+t*3.0);
            rays=mix(1.0, rays, 0.32);
            intensity*=rays;
            float vmask=smoothstep(-0.15,0.32,vUv.y)*smoothstep(1.28,0.55,vUv.y);
            intensity*=vmask;
            // Fill the whole frame with aurora; the focus only ADDS a gentle
            // brightening behind the logo. High floor => no dark corners.
            vec2 d = (sUv - uFocus) * vec2(1.15, 1.0);
            float fd = length(d);
            float fmask = 0.62 + 0.38 * exp(-fd*fd*2.6);
            intensity*=fmask;
            // cursor bloom ON TOP of the focus mask, so hovering anywhere lights it
            intensity += pull * 0.6 * vmask;
            vec3 col=mix(uColorB,uColorA,intensity);
            col=mix(col,uColorTip,pow(intensity,3.0)*0.85);
            gl_FragColor=vec4(col, intensity*uIntensity);
          }
        `
        }
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * Drifting motes — soft round sprites (no square pixels), gentle rise.
 * ------------------------------------------------------------------ */
function Motes({ count = 850 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const tex = useMemo(() => makeSpriteTexture(), []);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = Math.random() * 10 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
      speeds[i] = 0.1 + Math.random() * 0.4;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt * 0.45;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.5 + i) * dt * 0.05;
      if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = -2.5;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y += dt * 0.008;
    const m = pts.material as THREE.PointsMaterial;
    m.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
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
        map={tex}
        size={0.07}
        color="#d8f5e2"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        alphaTest={0.01}
      />
    </points>
  );
}

/* Camera rig — drift + mouse parallax + scroll dolly. Tracks the cursor at the
 * window level so the aurora reacts everywhere, even over the headline/logo. */
function Rig({ mouse }: { mouse: React.MutableRefObject<THREE.Vector2> }) {
  const { camera } = useThree();
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mouse]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const mx = mouse.current.x;
    const my = mouse.current.y;
    const scroll =
      typeof window !== "undefined"
        ? Math.min(1, window.scrollY / Math.max(1, window.innerHeight))
        : 0;
    const targetX = mx * 0.5 + Math.sin(t * 0.1) * 0.18;
    const targetY = 0.5 + my * 0.25 + Math.cos(t * 0.12) * 0.1 - scroll * 0.7;
    const targetZ = 6.2 - scroll * 1.4;
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
  const mouse = useRef(new THREE.Vector2(0, 0));

  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0.6, 6.2], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.4} />

      {/* aurora borealis CONCENTRATED behind the logo (right), mouse-reactive */}
      <AuroraLayer z={-7} scaleArr={[22, 10, 1]} speed={0.05} intensity={0.82} colorA="#00ff41" colorB="#0b6b3a" mouse={mouse} focus={[0.74, 0.54]} />
      <AuroraLayer z={-10} scaleArr={[30, 12, 1]} speed={0.03} intensity={0.4} colorA="#23c0ff" colorB="#0a3b52" mouse={mouse} focus={[0.74, 0.54]} />

      <Motes count={520} />
      <Rig mouse={mouse} />

      {!reduced && (
        <EffectComposer multisampling={4}>
          <Bloom
            mipmapBlur
            intensity={0.7}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.4}
            kernelSize={KernelSize.HUGE}
            radius={0.85}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
