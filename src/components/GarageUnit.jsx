
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

const TAU = Math.PI * 2;
const COUNT = 1500;
const INNER = 0.48;
const OUTER = 5.2;

function createParticleData() {
  const positions = new Float32Array(COUNT * 3);
  const progress = new Float32Array(COUNT);
  const sizes = new Float32Array(COUNT);
  const seeds = [];

  for (let i = 0; i < COUNT; i++) {
    const seed = {
      phase: Math.random(),
      angle: Math.random() * TAU,
      speed: 0.055 + Math.random() * 0.055,
      turns: 1.2 + Math.random() * 1.8,
      height: (Math.random() - 0.5) * 2.2,
      brightness: 0.4 + Math.random() * 0.6,
    };

    seeds.push(seed);
    progress[i] = seed.phase;
    sizes[i] = 1.2 + Math.random() * 2.2;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    "aProgress",
    new THREE.BufferAttribute(progress, 1)
  );

  geometry.setAttribute(
    "aSize",
    new THREE.BufferAttribute(sizes, 1)
  );

  return { geometry, seeds };
}

/* ========================================
   INWARD GRAVITATIONAL PARTICLES
======================================== */

function ParticleField({ reducedMotion }) {
  const material = useRef();

  const { geometry, seeds } = useMemo(
    createParticleData,
    []
  );

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(({ clock }) => {
    const time = reducedMotion ? 0 : clock.elapsedTime;
    const positions = geometry.attributes.position.array;
    const progress = geometry.attributes.aProgress.array;

    for (let i = 0; i < COUNT; i++) {
      const seed = seeds[i];

      const t =
        (seed.phase + time * seed.speed) % 1;

      // Accelerating radial collapse.
      const collapse = Math.pow(t, 2.3);

      const radius =
        OUTER - (OUTER - INNER) * collapse;

      // More orbital motion near the center.
      const angle =
        seed.angle +
        seed.turns * TAU * Math.pow(t, 1.45);

      const height =
        seed.height * Math.pow(1 - collapse, 1.6);

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] =
        Math.sin(angle) * radius * 0.78 +
        height * 0.3;
      positions[i * 3 + 2] =
        Math.sin(angle * 1.7) * height * 0.65;

      progress[i] = t;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aProgress.needsUpdate = true;

    if (material.current) {
      material.current.uniforms.uTime.value = time;
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
        }}
        vertexShader={`
          attribute float aProgress;
          attribute float aSize;

          varying float vProgress;

          void main() {
            vProgress = aProgress;

            vec4 mvPosition =
              modelViewMatrix * vec4(position, 1.0);

            gl_PointSize = clamp(
              aSize * (12.0 / max(1.0, -mvPosition.z)),
              1.0,
              5.0
            );

            gl_Position =
              projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying float vProgress;

          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);

            float glow =
              1.0 - smoothstep(0.05, 0.5, d);

            float appear =
              smoothstep(0.0, 0.13, vProgress);

            float disappear =
              1.0 - smoothstep(
                0.84,
                1.0,
                vProgress
              );

            float energy =
              0.65 +
              0.35 * sin(
                uTime * 2.0 + vProgress * 20.0
              );

            float alpha =
              glow *
              appear *
              disappear *
              energy *
              0.82;

            if (alpha < 0.01) discard;

            vec3 color = mix(
              vec3(0.48, 0.60, 0.72),
              vec3(0.94, 0.97, 1.0),
              vProgress
            );

            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </points>
  );
}

/* ========================================
   CHROME SPHERE
======================================== */

function SignalCore({ reducedMotion }) {
  const core = useRef();

  useFrame(({ clock }) => {
    if (!core.current || reducedMotion) return;

    const time = clock.elapsedTime;

    // Gentle response to incoming energy.
    const pulse =
      1 +
      Math.pow(
        Math.max(0, Math.sin(time * 1.35)),
        8
      ) * 0.045;

    core.current.scale.setScalar(pulse);
  });

  return (
    <group ref={core}>
      <mesh castShadow>
        <sphereGeometry args={[0.69, 96, 64]} />

        <meshPhysicalMaterial
          color="#b9c5d0"
          metalness={1}
          roughness={0.075}
          clearcoat={1}
          clearcoatRoughness={0.045}
          envMapIntensity={2.8}
        />
      </mesh>

      <mesh scale={1.07}>
        <sphereGeometry args={[0.69, 48, 32]} />

        <meshBasicMaterial
          color="#c5ddf2"
          transparent
          opacity={0.025}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/* ========================================
   LIQUID METAL SIGNAL RINGS
======================================== */

function SignalRing({
  radius,
  thickness,
  tilt,
  speed,
  phase,
  reducedMotion,
}) {
  const ring = useRef();

  useFrame(({ clock }) => {
    if (!ring.current || reducedMotion) return;

    const time = clock.elapsedTime;

    ring.current.rotation.z =
      tilt[2] + time * speed;

    ring.current.rotation.x =
      tilt[0] + Math.sin(time * 0.24 + phase) * 0.1;

    ring.current.rotation.y =
      tilt[1] + Math.cos(time * 0.2 + phase) * 0.12;

    const pulse =
      1 + Math.sin(time * 1.35 + phase) * 0.025;

    ring.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={ring} rotation={tilt} castShadow>
      <torusGeometry
        args={[radius, thickness, 20, 192]}
      />

      <meshPhysicalMaterial
        color="#c8d2db"
        metalness={1}
        roughness={0.12}
        clearcoat={1}
        clearcoatRoughness={0.07}
        envMapIntensity={2.5}
      />
    </mesh>
  );
}

/* ========================================
   ENERGY STREAMS
======================================== */

function EnergyStreams({ reducedMotion }) {
  const group = useRef();

  const geometries = useMemo(() => {
    return Array.from({ length: 22 }, (_, index) => {
      const count = 180;
      const positions = new Float32Array((count + 1) * 3);
      const opacity = new Float32Array(count + 1);

      const startAngle = (index / 22) * TAU;
      const turns = 1.3 + (index % 4) * 0.3;

      for (let i = 0; i <= count; i++) {
        const t = i / count;

        const collapse = Math.pow(t, 1.7);
        const radius =
          OUTER - (OUTER - 0.62) * collapse;

        const angle =
          startAngle + t * turns * TAU;

        positions[i * 3] =
          Math.cos(angle) * radius;

        positions[i * 3 + 1] =
          Math.sin(angle) * radius * 0.78;

        positions[i * 3 + 2] =
          Math.sin(startAngle * 3) *
          (1 - collapse) *
          0.55;

        const fadeIn =
          THREE.MathUtils.smoothstep(t, 0, 0.22);

        const fadeOut =
          1 -
          THREE.MathUtils.smoothstep(
            t,
            0.72,
            1
          );

        opacity[i] = fadeIn * fadeOut;
      }

      const geometry = new THREE.BufferGeometry();

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      geometry.setAttribute(
        "aOpacity",
        new THREE.BufferAttribute(opacity, 1)
      );

      return geometry;
    });
  }, []);

  useEffect(() => {
    return () => geometries.forEach((g) => g.dispose());
  }, [geometries]);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;

    group.current.rotation.z =
      clock.elapsedTime * 0.025;
  });

  return (
    <group ref={group}>
      {geometries.map((geometry, index) => (
        <line key={index} geometry={geometry}>
          <shaderMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            vertexShader={`
              attribute float aOpacity;
              varying float vOpacity;

              void main() {
                vOpacity = aOpacity;

                gl_Position =
                  projectionMatrix *
                  modelViewMatrix *
                  vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying float vOpacity;

              void main() {
                float alpha = vOpacity * 0.18;

                gl_FragColor = vec4(
                  0.68,
                  0.79,
                  0.91,
                  alpha
                );
              }
            `}
          />
        </line>
      ))}
    </group>
  );
}

/* ========================================
   COMPLETE MYLYNKR SIGNAL
======================================== */

function SignalAssembly({ reducedMotion }) {
  const group = useRef();

  useFrame(({ clock, pointer }, delta) => {
    if (!group.current || reducedMotion) return;

    const time = clock.elapsedTime;

    const targetX =
      0.13 - pointer.y * 0.045;

    const targetY =
      -0.2 +
      pointer.x * 0.065 +
      Math.sin(time * 0.18) * 0.045;

    group.current.rotation.x =
      THREE.MathUtils.damp(
        group.current.rotation.x,
        targetX,
        1.5,
        delta
      );

    group.current.rotation.y =
      THREE.MathUtils.damp(
        group.current.rotation.y,
        targetY,
        1.5,
        delta
      );
  });

  return (
    <group ref={group} rotation={[0.13, -0.2, 0]}>
      <ParticleField reducedMotion={reducedMotion} />

      <EnergyStreams reducedMotion={reducedMotion} />

      <Float
        speed={reducedMotion ? 0 : 0.7}
        rotationIntensity={0}
        floatIntensity={reducedMotion ? 0 : 0.14}
      >
        <SignalCore reducedMotion={reducedMotion} />

        <SignalRing
          radius={1.2}
          thickness={0.07}
          tilt={[0.45, 0.25, -0.3]}
          speed={0.12}
          phase={0}
          reducedMotion={reducedMotion}
        />

        <SignalRing
          radius={1.65}
          thickness={0.05}
          tilt={[-0.35, 0.35, 0.45]}
          speed={-0.085}
          phase={1.4}
          reducedMotion={reducedMotion}
        />

        <SignalRing
          radius={2.12}
          thickness={0.035}
          tilt={[0.2, -0.4, -0.18]}
          speed={0.065}
          phase={2.6}
          reducedMotion={reducedMotion}
        />
      </Float>
    </group>
  );
}

/* ========================================
   STUDIO LIGHTING
======================================== */

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.65} />

      <hemisphereLight
        args={["#e8f2ff", "#111821", 1.3]}
      />

      <directionalLight
        position={[-4, 6, 7]}
        intensity={3.8}
        color="#ffffff"
      />

      <directionalLight
        position={[5, -3, 4]}
        intensity={2.4}
        color="#b5d0e9"
      />

      <spotLight
        position={[0, 5, 6]}
        angle={0.65}
        penumbra={1}
        intensity={40}
        color="#ffffff"
      />

      <Environment
        preset="studio"
        environmentIntensity={1.15}
      />
    </>
  );
}

/* ========================================
   MAIN COMPONENT
======================================== */

export default function GarageUnit() {
  const [reducedMotion, setReducedMotion] =
    useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () =>
      setReducedMotion(media.matches);

    update();

    media.addEventListener("change", update);

    return () =>
      media.removeEventListener("change", update);
  }, []);

  return (
    <div
      className="garage-unit-stage"
      role="img"
      aria-label="The MyLynkr Signal, a floating liquid-metal sphere surrounded by three chrome rings, drawing streams of silver particles inward"
    >
      <div className="signal-ambient-glow" />
      <div className="signal-gravity-field" />

      <Canvas
        
        camera={{
          position: [0, 0, 16
          ],
          fov: 46,
          near: 0.1,
          far: 100,
        }}

        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <Lighting />
        <SignalAssembly reducedMotion={reducedMotion} />
      </Canvas>

      <div className="signal-caption">
        <span className="signal-caption-line" />
        <span>THE MYLYNKR SIGNAL</span>
        <span className="signal-caption-line" />
      </div>
    </div>
  );
}
