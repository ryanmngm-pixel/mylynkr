
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import "../LoadingScreen.css";

const PARTICLE_COUNT = 2400;
const INTRO_DURATION = 3400;
const EXIT_DURATION = 1750;
const TAU = Math.PI * 2;

const RINGS = [
  {
    radius: 1.08,
    tube: 0.065,
    rotation: [0.5, 0.2, -0.35],
    speed: 0.32,
  },
  {
    radius: 1.53,
    tube: 0.048,
    rotation: [-0.4, 0.45, 0.35],
    speed: -0.24,
  },
  {
    radius: 1.96,
    tube: 0.035,
    rotation: [0.2, -0.4, -0.2],
    speed: 0.18,
  },
];

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(start, end, value) {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

/* ==========================================
   PARTICLE ABSORPTION
========================================== */

function ParticleField({
  phase,
  reducedMotion,
  onAbsorbed,
}) {
  const { viewport } = useThree();

  const elapsed = useRef(0);
  const completed = useRef(false);

  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(
      PARTICLE_COUNT * 3
    );

    const sizes = new Float32Array(
      PARTICLE_COUNT
    );

    const alphas = new Float32Array(
      PARTICLE_COUNT
    );

    const seeds = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      seeds.push({
        nx: Math.random() * 2 - 1,
        ny: Math.random() * 2 - 1,
        depth: (Math.random() - 0.5) * 0.8,
        delay: Math.random() * 0.48,
        duration: 0.4 + Math.random() * 0.12,
        curve: (Math.random() - 0.5) * 1.4,
        size: 1.2 + Math.random() * 2.1,
      });
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(sizes, 1)
    );

    geometry.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(alphas, 1)
    );

    return { geometry, seeds };
  }, []);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame((state, delta) => {
    if (phase === "loading" && !reducedMotion) {
      elapsed.current += Math.min(delta, 0.05);
    }

    const introProgress = reducedMotion
      ? 1
      : clamp01(
          elapsed.current / (INTRO_DURATION / 1000)
        );

    const positions =
      geometry.attributes.position.array;

    const sizes =
      geometry.attributes.aSize.array;

    const alphas =
      geometry.attributes.aAlpha.array;

    const halfWidth = viewport.width / 2;
    const halfHeight = viewport.height / 2;

    let remaining = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const seed = seeds[i];

      const startX = seed.nx * halfWidth;
      const startY = seed.ny * halfHeight;

      const localProgress = clamp01(
        (introProgress - seed.delay) /
          seed.duration
      );

      // Accelerating inward attraction.
      const attraction = Math.pow(
        localProgress,
        2.7
      );

      const distance = Math.hypot(
        startX,
        startY
      );

      const directionX =
        distance > 0.001
          ? startX / distance
          : 1;

      const directionY =
        distance > 0.001
          ? startY / distance
          : 0;

      // Curved trajectory into the signal.
      const tangentX = -directionY;
      const tangentY = directionX;

      const swirl =
        Math.sin(localProgress * Math.PI) *
        seed.curve *
        Math.min(distance * 0.23, 1.2);

      const x =
        startX * (1 - attraction) +
        tangentX * swirl;

      const y =
        startY * (1 - attraction) +
        tangentY * swirl;

      const z =
        seed.depth * (1 - attraction);

      let alpha = 0;

      if (
        phase === "loading" &&
        localProgress < 1
      ) {
        remaining++;

        alpha =
          1 -
          smoothstep(
            0.86,
            1,
            localProgress
          );
      }

      // Once absorbed, particles never return.
      // No burst particles are generated.
      if (phase !== "loading") {
        alpha = 0;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      sizes[i] = seed.size;
      alphas[i] = alpha;
    }

    geometry.attributes.position.needsUpdate =
      true;

    geometry.attributes.aSize.needsUpdate =
      true;

    geometry.attributes.aAlpha.needsUpdate =
      true;

    if (
      phase === "loading" &&
      remaining === 0 &&
      !completed.current
    ) {
      completed.current = true;
      onAbsorbed();
    }
  });

  return (
    <points
      geometry={geometry}
      frustumCulled={false}
    >
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float aSize;
          attribute float aAlpha;

          varying float vAlpha;

          void main() {
            vAlpha = aAlpha;

            vec4 mv =
              modelViewMatrix *
              vec4(position, 1.0);

            gl_PointSize = clamp(
              aSize * 24.0 /
              max(1.0, -mv.z),
              1.0,
              8.0
            );

            gl_Position =
              projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          varying float vAlpha;

          void main() {
            float d = length(
              gl_PointCoord - vec2(0.5)
            );

            float glow =
              1.0 -
              smoothstep(0.05, 0.5, d);

            float alpha = glow * vAlpha;

            if (alpha < 0.01) {
              discard;
            }

            gl_FragColor = vec4(
              0.95,
              0.97,
              1.0,
              alpha
            );
          }
        `}
      />
    </points>
  );
}

/* ==========================================
   LIQUID METAL SIGNAL
========================================== */

function ChromeSignal({
  phase,
  reducedMotion,
}) {
  const groupRef = useRef();
  const coreRef = useRef();
  const ringRefs = useRef([]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const dt = Math.min(delta, 0.05);

    // The orb remains at its original size.
    // CSS handles the gentle exit transition.
    groupRef.current.scale.setScalar(1);

    if (!reducedMotion) {
      ringRefs.current.forEach(
        (ring, index) => {
          if (!ring) return;

          const speedMultiplier =
            phase === "ready"
              ? 0.22
              : phase === "burst"
                ? 0.12
                : 1;

          ring.rotation.z +=
            dt *
            RINGS[index].speed *
            speedMultiplier;

          ring.rotation.x +=
            dt *
            0.045 *
            speedMultiplier;
        }
      );
    }

    if (coreRef.current) {
      const pulse =
        phase === "loading" &&
        !reducedMotion
          ? 1 +
            Math.sin(
              state.clock.elapsedTime * 2
            ) *
              0.025
          : 1;

      coreRef.current.scale.setScalar(
        pulse
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <sphereGeometry
          args={[0.68, 80, 64]}
        />

        <meshPhysicalMaterial
          color="#c6d0da"
          metalness={1}
          roughness={0.075}
          clearcoat={1}
          clearcoatRoughness={0.045}
          envMapIntensity={2.8}
        />
      </mesh>

      {RINGS.map((ring, index) => (
        <mesh
          key={index}
          ref={(node) => {
            ringRefs.current[index] = node;
          }}
          rotation={ring.rotation}
        >
          <torusGeometry
            args={[
              ring.radius,
              ring.tube,
              20,
              192,
            ]}
          />

          <meshPhysicalMaterial
            color="#d4dfe9"
            metalness={1}
            roughness={0.11}
            clearcoat={1}
            envMapIntensity={2.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ==========================================
   THREE.JS SCENE
========================================== */

function Scene({
  phase,
  reducedMotion,
  onAbsorbed,
}) {
  return (
    <>
      <ambientLight intensity={0.8} />

      <directionalLight
        position={[-4, 5, 7]}
        intensity={3.8}
      />

      <directionalLight
        position={[5, -3, 4]}
        intensity={2.5}
        color="#b8d5ef"
      />

      <Environment preset="studio" />

      <ParticleField
        phase={phase}
        reducedMotion={reducedMotion}
        onAbsorbed={onAbsorbed}
      />

      <ChromeSignal
        phase={phase}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

/* ==========================================
   LOADING SCREEN
========================================== */

export default function LoadingScreen({
  onComplete,
}) {
  const [phase, setPhase] =
    useState("loading");

  const [reducedMotion, setReducedMotion] =
    useState(() =>
      typeof window !== "undefined" &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    );

  const [absorbed, setAbsorbed] =
    useState(false);

  const [pageReady, setPageReady] =
    useState(() =>
      typeof document !== "undefined" &&
      document.readyState === "complete"
    );

  const handleAbsorbed = useCallback(() => {
    setAbsorbed(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => {
      setReducedMotion(media.matches);
    };

    const updateReady = () => {
      setPageReady(true);
    };

    updateMotion();

    media.addEventListener(
      "change",
      updateMotion
    );

    window.addEventListener(
      "load",
      updateReady
    );

    if (document.readyState === "complete") {
      updateReady();
    }

    return () => {
      media.removeEventListener(
        "change",
        updateMotion
      );

      window.removeEventListener(
        "load",
        updateReady
      );
    };
  }, []);

  useEffect(() => {
    if (
      phase === "loading" &&
      absorbed &&
      pageReady
    ) {
      setPhase("ready");
    }
  }, [phase, absorbed, pageReady]);

  useEffect(() => {
    if (phase !== "burst") return;

    const timeout = window.setTimeout(
      onComplete,
      reducedMotion
        ? 150
        : EXIT_DURATION
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    phase,
    reducedMotion,
    onComplete,
  ]);

  function enterWebsite() {
    if (phase !== "ready") return;

    // "burst" is retained as the phase name
    // for compatibility with existing CSS.
    // It now means a cinematic fade.
    setPhase("burst");
  }

  return (
    <div
      className={`mylynkr-loader loader-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="MyLynkr introduction"
    >
      <div className="loader-grid" />

      <div className="loader-atmosphere" />

      <header className="loader-top">
        <span className="loader-brand">
          mylynkr.
        </span>

        <span className="loader-top-right">
          A NEW ERA OF CONNECTION
        </span>
      </header>

      <div className="loader-visual">
        <Canvas
          camera={{
            position: [0, 0, 13.5],
            fov: 46,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 1.5]}
          gl={{
            alpha: true,
            antialias: true,
          }}
        >
          <Scene
            phase={phase}
            reducedMotion={reducedMotion}
            onAbsorbed={handleAbsorbed}
          />
        </Canvas>
      </div>

      <div
        className="loader-content"
        aria-live="polite"
      >
        {phase === "loading" ? (
          <div className="loader-loading-content">
            <div className="loader-status">
              <span className="loader-status-dot" />
              ESTABLISHING CONNECTION
            </div>

            <p>
              Bringing everything together.
            </p>
          </div>
        ) : (
          <div className="loader-ready-content">
            <div className="loader-status">
              <span className="loader-status-dot" />
              CONNECTION ESTABLISHED
            </div>

            <h1>
              YOUR WORLD IS READY.
            </h1>

            <p>
              Something extraordinary begins here.
            </p>

            <button
              className="loader-enter"
              type="button"
              onClick={enterWebsite}
              disabled={phase === "burst"}
            >
              Enter MyLynkr

              <span aria-hidden="true">
                ↗
              </span>
            </button>
          </div>
        )}
      </div>

      <footer className="loader-bottom">
        <span>
          MYLYNKR / THE BEGINNING
        </span>

        <span>
          DESIGNED TO CONNECT
        </span>
      </footer>
    </div>
  );
}
