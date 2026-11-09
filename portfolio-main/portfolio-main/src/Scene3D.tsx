import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════
   SECTION PRESETS — each section drives camera, lights, fog
   ═══════════════════════════════════════════════════════════ */
interface SectionPreset {
  camPos: [number, number, number];
  camLookAt: [number, number, number];
  fov: number;
  ambientColor: string;
  ambientIntensity: number;
  dirColor: string;
  dirIntensity: number;
  dirPos: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  emissiveIntensity: number;
  envTint: [number, number, number]; // RGB multiplier on materials
}

const PRESETS: SectionPreset[] = [
  {
    // HOME — cool pink, centered, light fog
    camPos: [0, 0.5, 6],
    camLookAt: [0, 0, 0],
    fov: 50,
    ambientColor: "#e8788a",
    ambientIntensity: 0.15,
    dirColor: "#ffeef1",
    dirIntensity: 0.6,
    dirPos: [3, 5, 4],
    hemiSky: "#e8788a",
    hemiGround: "#1a0a10",
    hemiIntensity: 0.3,
    fogColor: "#0a0a0f",
    fogNear: 6,
    fogFar: 18,
    emissiveIntensity: 0.15,
    envTint: [1.0, 0.6, 0.7],
  },
  {
    // ABOUT — warm gold, camera slightly right
    camPos: [1.5, 0.3, 5.5],
    camLookAt: [0.5, -0.2, 0],
    fov: 48,
    ambientColor: "#f5c542",
    ambientIntensity: 0.2,
    dirColor: "#fff4d6",
    dirIntensity: 0.8,
    dirPos: [-3, 4, 3],
    hemiSky: "#f5c542",
    hemiGround: "#1a1008",
    hemiIntensity: 0.35,
    fogColor: "#0c0a06",
    fogNear: 5,
    fogFar: 16,
    emissiveIntensity: 0.2,
    envTint: [1.0, 0.85, 0.4],
  },
  {
    // TECH — electric blue, camera left, sparkly
    camPos: [-1, 0.8, 5.8],
    camLookAt: [-0.3, 0.2, 0],
    fov: 52,
    ambientColor: "#61dafb",
    ambientIntensity: 0.18,
    dirColor: "#d6f0ff",
    dirIntensity: 0.7,
    dirPos: [4, 3, 5],
    hemiSky: "#3776AB",
    hemiGround: "#060a14",
    hemiIntensity: 0.3,
    fogColor: "#060810",
    fogNear: 7,
    fogFar: 20,
    emissiveIntensity: 0.25,
    envTint: [0.4, 0.75, 1.0],
  },
  {
    // GITHUB — green, pulled back, soft
    camPos: [0.3, -0.2, 6.5],
    camLookAt: [0, -0.3, 0],
    fov: 46,
    ambientColor: "#22c55e",
    ambientIntensity: 0.15,
    dirColor: "#d6ffe8",
    dirIntensity: 0.5,
    dirPos: [-2, 6, 3],
    hemiSky: "#22c55e",
    hemiGround: "#061a0a",
    hemiIntensity: 0.25,
    fogColor: "#060f08",
    fogNear: 5,
    fogFar: 17,
    emissiveIntensity: 0.12,
    envTint: [0.3, 1.0, 0.5],
  },
];

/* ═══════════════════════════════════════════════════════════
   LERP HELPERS
   ═══════════════════════════════════════════════════════════ */
function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpColor(colA: THREE.Color, hex: string, t: number) {
  const target = new THREE.Color(hex);
  colA.lerp(target, t);
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED CAMERA
   ═══════════════════════════════════════════════════════════ */
interface MousePosition {
  x: number;
  y: number;
}

function AnimatedCamera({ preset, mouse, rewindArc }: { preset: SectionPreset; mouse: { current: MousePosition }; rewindArc: number }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...preset.camPos));
  const targetLookAt = useRef(new THREE.Vector3(...preset.camLookAt));
  const currentLookAt = useRef(new THREE.Vector3(...preset.camLookAt));
  const targetFov = useRef(preset.fov);

  useEffect(() => {
    targetPos.current.set(...preset.camPos);
    targetLookAt.current.set(...preset.camLookAt);
    targetFov.current = preset.fov;
  }, [preset]);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const spd = 0.04;

    // Mouse parallax offset
    const mx = mouse.current.x * 0.3;
    const my = mouse.current.y * 0.15;

    // Rewind arc: push camera up and slightly back
    const arcY = rewindArc * 1.5;
    const arcZ = rewindArc * 0.8;

    const tx = targetPos.current.x + mx;
    const ty = targetPos.current.y + my + arcY;
    const tz = targetPos.current.z + arcZ;

    cam.position.x = lerpN(cam.position.x, tx, spd);
    cam.position.y = lerpN(cam.position.y, ty, spd);
    cam.position.z = lerpN(cam.position.z, tz, spd);

    currentLookAt.current.x = lerpN(currentLookAt.current.x, targetLookAt.current.x, spd);
    currentLookAt.current.y = lerpN(currentLookAt.current.y, targetLookAt.current.y + arcY * 0.3, spd);
    currentLookAt.current.z = lerpN(currentLookAt.current.z, targetLookAt.current.z, spd);
    cam.lookAt(currentLookAt.current);

    cam.fov = lerpN(cam.fov, targetFov.current + rewindArc * 8, spd);
    cam.updateProjectionMatrix();
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED LIGHTS
   ═══════════════════════════════════════════════════════════ */
function AnimatedLights({ preset }: { preset: SectionPreset }) {
  const ambRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  useFrame(() => {
    const spd = 0.03;
    if (ambRef.current) {
      lerpColor(ambRef.current.color, preset.ambientColor, spd);
      ambRef.current.intensity = lerpN(ambRef.current.intensity, preset.ambientIntensity, spd);
    }
    if (dirRef.current) {
      lerpColor(dirRef.current.color, preset.dirColor, spd);
      dirRef.current.intensity = lerpN(dirRef.current.intensity, preset.dirIntensity, spd);
      dirRef.current.position.x = lerpN(dirRef.current.position.x, preset.dirPos[0], spd);
      dirRef.current.position.y = lerpN(dirRef.current.position.y, preset.dirPos[1], spd);
      dirRef.current.position.z = lerpN(dirRef.current.position.z, preset.dirPos[2], spd);
    }
    if (hemiRef.current) {
      lerpColor(hemiRef.current.color, preset.hemiSky, spd);
      lerpColor(hemiRef.current.groundColor, preset.hemiGround, spd);
      hemiRef.current.intensity = lerpN(hemiRef.current.intensity, preset.hemiIntensity, spd);
    }
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.15} />
      <directionalLight ref={dirRef} position={[3, 5, 4]} intensity={0.6} />
      <hemisphereLight ref={hemiRef} args={["#e8788a", "#1a0a10", 0.3]} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED FOG
   ═══════════════════════════════════════════════════════════ */
function AnimatedFog({ preset, isDark }: { preset: SectionPreset; isDark: boolean }) {
  const { scene } = useThree();

  useEffect(() => {
    const fogCol = isDark ? preset.fogColor : "#f8f6f2";
    scene.fog = new THREE.Fog(fogCol, preset.fogNear, preset.fogFar);
    scene.background = null; // Keep transparent so HTML content shows through
  }, [isDark, scene]);

  useFrame(() => {
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      const targetCol = isDark ? preset.fogColor : "#f8f6f2";
      lerpColor(scene.fog.color, targetCol, 0.03);
      scene.fog.near = lerpN(scene.fog.near, preset.fogNear, 0.03);
      scene.fog.far = lerpN(scene.fog.far, preset.fogFar, 0.03);
    }
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
   FLOATING MESHES — few objects, animated materials
   ═══════════════════════════════════════════════════════════ */
interface MeshDef {
  pos: [number, number, number];
  scale: number;
  type: "sphere" | "torus" | "octa" | "box";
  speed: number;
  floatRange: number;
}

const MESHES: MeshDef[] = [
  { pos: [-3, 1.5, -2], scale: 0.5, type: "sphere", speed: 1.2, floatRange: 0.6 },
  { pos: [3.5, -0.8, -3], scale: 0.4, type: "torus", speed: 0.8, floatRange: 0.5 },
  { pos: [-1.5, -1.5, -1], scale: 0.35, type: "octa", speed: 1.5, floatRange: 0.4 },
  { pos: [2, 2, -4], scale: 0.6, type: "box", speed: 0.6, floatRange: 0.7 },
  { pos: [4, 0.5, -1.5], scale: 0.3, type: "sphere", speed: 1.0, floatRange: 0.5 },
  { pos: [-3.5, -1, -3.5], scale: 0.45, type: "torus", speed: 0.9, floatRange: 0.6 },
  { pos: [0.5, 2.5, -5], scale: 0.55, type: "octa", speed: 0.7, floatRange: 0.8 },
  { pos: [-2, 0, -4.5], scale: 0.3, type: "box", speed: 1.3, floatRange: 0.4 },
];

function FloatingMesh({ def, preset, isDark }: { def: MeshDef; preset: SectionPreset; isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15 * def.speed;
      meshRef.current.rotation.y += delta * 0.2 * def.speed;
    }
    if (matRef.current) {
      const spd = 0.03;
      const tintCol = new THREE.Color().setRGB(preset.envTint[0] * 0.3, preset.envTint[1] * 0.3, preset.envTint[2] * 0.3);
      matRef.current.emissive.lerp(tintCol, spd);
      matRef.current.emissiveIntensity = lerpN(matRef.current.emissiveIntensity, preset.emissiveIntensity, spd);
      matRef.current.opacity = lerpN(matRef.current.opacity, isDark ? 0.35 : 0.2, spd);
    }
  });

  const geometry = useMemo(() => {
    switch (def.type) {
      case "sphere": return <sphereGeometry args={[1, 24, 24]} />;
      case "torus": return <torusGeometry args={[1, 0.35, 16, 32]} />;
      case "octa": return <octahedronGeometry args={[1, 0]} />;
      case "box": return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [def.type]);

  return (
    <Float speed={def.speed} rotationIntensity={0.3} floatIntensity={def.floatRange} floatingRange={[-def.floatRange, def.floatRange]}>
      <mesh ref={meshRef} position={def.pos} scale={def.scale}>
        {geometry}
        <meshStandardMaterial
          ref={matRef}
          color="#888"
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.35}
          emissive={new THREE.Color(0.3, 0.15, 0.2)}
          emissiveIntensity={0.15}
          wireframe={def.type === "box" || def.type === "octa"}
        />
      </mesh>
    </Float>
  );
}

/* ═══════════════════════════════════════════════════════════
   SPARKLE POINTS
   ═══════════════════════════════════════════════════════════ */
function SparkleField({ preset }: { preset: SectionPreset }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 80;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    return pos;
  });

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.01;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      lerpColor(mat.color, preset.ambientColor, 0.03);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#e8788a" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════
   INNER SCENE (runs inside Canvas)
   ═══════════════════════════════════════════════════════════ */
function InnerScene({ sectionIdx, mouse, isDark, rewindArc }: {
  sectionIdx: number; mouse: { current: MousePosition }; isDark: boolean; rewindArc: number;
}) {
  const preset = PRESETS[sectionIdx] || PRESETS[0];

  return (
    <>
      <AnimatedCamera preset={preset} mouse={mouse} rewindArc={rewindArc} />
      <AnimatedLights preset={preset} />
      <AnimatedFog preset={preset} isDark={isDark} />
      {MESHES.map((m, i) => (
        <FloatingMesh key={i} def={m} preset={preset} isDark={isDark} />
      ))}
      <SparkleField preset={preset} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXPORTED COMPONENT + SCROLL-TO-TOP WITH REWIND
   ═══════════════════════════════════════════════════════════ */
export function Scene3DCanvas({ isDark }: { isDark: boolean }) {
  const [sectionIdx, setSectionIdx] = useState(0);
  const mouse = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const sections = ["home", "about", "tech", "projects"];
    const onScroll = () => {
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) {
          setSectionIdx(i);
          break;
        }
      }
    };
    const onMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
  }, []);

  // Rewind arc state — shared with ScrollToTopRewind
  const [rewindArc, setRewindArc] = useState(0);

  // Expose rewind trigger
  const triggerRewind = useCallback(() => {
    // Animate arc: 0 → 1 → 0 with overshoot
    let start: number | null = null;
    const duration = 1200;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      // Overshoot curve: quick up, slow settle
      const arc = t < 0.3
        ? t / 0.3 // ramp up
        : 1.0 - ((t - 0.3) / 0.7) * 1.0; // ease back down
      setRewindArc(Math.max(0, arc * (1 + Math.sin(t * Math.PI) * 0.3)));
      if (t < 1) requestAnimationFrame(animate);
      else setRewindArc(0);
    };
    requestAnimationFrame(animate);

    // Smooth scroll with easeOutExpo
    const scrollStart = window.scrollY;
    let scrollStartTime: number | null = null;
    const scrollDuration = 900;
    const easeOutExpo = (x: number) => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    const scrollAnim = (ts: number) => {
      if (!scrollStartTime) scrollStartTime = ts;
      const elapsed = ts - scrollStartTime;
      const t = Math.min(elapsed / scrollDuration, 1);
      window.scrollTo(0, scrollStart * (1 - easeOutExpo(t)));
      if (t < 1) requestAnimationFrame(scrollAnim);
    };
    requestAnimationFrame(scrollAnim);
  }, []);

  // Store trigger in window so ScrollToTop can call it
  useEffect(() => {
    (window as any).__rewind3D = triggerRewind;
    return () => { delete (window as any).__rewind3D; };
  }, [triggerRewind]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.5, 6], fov: 50, near: 0.1, far: 30 }}
        style={{ background: "transparent" }}
      >
        <InnerScene
          sectionIdx={sectionIdx}
          mouse={mouse}
          isDark={isDark}
          rewindArc={rewindArc}
        />
      </Canvas>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLL TO TOP — calls rewind on the 3D scene
   ═══════════════════════════════════════════════════════════ */
export function ScrollToTopRewind({ T, theme }: { T: any; theme: string }) {
  const [show, setShow] = useState(false);
  const [rewinding, setRewinding] = useState(false);
  const isLight = theme === "light";

  useEffect(() => {
    const onScroll = () => { if (!rewinding) setShow(window.scrollY > 400); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [rewinding]);

  const handleRewind = () => {
    setRewinding(true);
    // Trigger the 3D camera rewind
    if ((window as any).__rewind3D) (window as any).__rewind3D();
    // Wait for scroll to finish
    const check = setInterval(() => {
      if (window.scrollY < 10) {
        clearInterval(check);
        setTimeout(() => { setRewinding(false); setShow(false); }, 400);
      }
    }, 50);
  };

  return (
    <>
      {/* Rewind overlay */}
      {rewinding && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: isLight
              ? `linear-gradient(180deg, ${T.rosa}12, transparent 30%, transparent 70%, ${T.rosa}08)`
              : `linear-gradient(180deg, ${T.rosa}1a, transparent 30%, transparent 70%, ${T.rosa}10)`,
            animation: "rewind-flash 1.2s ease-out forwards",
          }} />
          <div style={{
            position: "absolute", inset: 0, opacity: isLight ? 0.02 : 0.04,
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${T.text}15 2px, ${T.text}15 4px)`,
            animation: "rewind-lines 0.3s linear infinite",
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "3px",
            background: `linear-gradient(90deg, ${T.rosa}88, ${T.gold}88, ${T.rosa}88)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 0.4s linear infinite",
            opacity: 0.5,
          }} />
        </div>
      )}

      {/* Button */}
      {show && !rewinding && (
        <button
          onClick={handleRewind}
          aria-label="Scroll to top"
          style={{
            position: "fixed", bottom: "84px", right: "24px", zIndex: 54,
            width: "42px", height: "42px", borderRadius: "12px",
            background: T.card, border: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.3s ease",
            boxShadow: `0 2px 12px ${T.shadow}`,
            animation: "fadeInUp 0.3s ease",
            fontSize: "0.9rem", fontFamily: "'JetBrains Mono', monospace",
            color: T.muted,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = T.rosa;
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.color = T.rosa;
            e.currentTarget.style.boxShadow = `0 4px 18px ${T.rosa}22`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = T.border;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.color = T.muted;
            e.currentTarget.style.boxShadow = `0 2px 12px ${T.shadow}`;
          }}
        >
          ⏪
        </button>
      )}
    </>
  );
}
