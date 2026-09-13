import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';

const HALF_X = 6;
const DEPTH = 6;
const BASE_Y = -5;

/** TRANQ-anchor geometry: the null-candidate default view. */
const ANCHOR = { TUBE_Y: -2.6, TUBE_R: 1.15, SHAFT_HALF: 0.7 } as const;

export interface CutawayGeometry {
  TUBE_Y: number;
  TUBE_R: number;
  SHAFT_HALF: number;
  CEIL_Y: number;
  FLOOR_Y: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Derive cutaway geometry from candidate depth/span. Sqrt-span tube radius keeps
 * wide benches readable; ceiling depth scales linearly with depth; the floor is
 * anchored inside the block. Anchor inputs (105 m / 80 m) reproduce the original
 * constants exactly.
 */
export function deriveGeometry(depthMeters: number, spanMeters: number): CutawayGeometry {
  const TUBE_R = clamp(ANCHOR.TUBE_R * Math.sqrt(clamp(spanMeters, 20, 250) / 80), 0.4, 2.2);
  const CEIL_Y = -1.45 * clamp(depthMeters / 105, 0.2, 1.2);
  const TUBE_Y = CEIL_Y - TUBE_R;
  const SHAFT_HALF = Math.max(0.15, Math.min(ANCHOR.SHAFT_HALF, TUBE_R - 0.45));
  return { TUBE_R, TUBE_Y, SHAFT_HALF, CEIL_Y, FLOOR_Y: TUBE_Y - TUBE_R };
}

/**
 * Cross-section block: the front plane (z = 0) is the cut face, with a circular
 * bore for the conduit and a vertical slot for the skylight shaft.
 */
function SectionBlock({ geo }: { geo: CutawayGeometry }) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-HALF_X, BASE_Y);
    shape.lineTo(HALF_X, BASE_Y);
    shape.lineTo(HALF_X, 0);
    shape.lineTo(-HALF_X, 0);
    shape.closePath();

    const bore = new THREE.Path();
    bore.absarc(0, geo.TUBE_Y, geo.TUBE_R, 0, Math.PI * 2, true);
    shape.holes.push(bore);

    const shaft = new THREE.Path();
    shaft.moveTo(-geo.SHAFT_HALF, geo.CEIL_Y - 0.02);
    shaft.lineTo(geo.SHAFT_HALF, geo.CEIL_Y - 0.02);
    shaft.lineTo(geo.SHAFT_HALF, 0.01);
    shaft.lineTo(-geo.SHAFT_HALF, 0.01);
    shaft.closePath();
    shape.holes.push(shaft);

    const g = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
    g.translate(0, 0, -DEPTH);
    return g;
  }, [geo]);

  // Imperatively-built geometry passed as a prop is not auto-disposed by R3F.
  useEffect(() => () => geom.dispose(), [geom]);

  return (
    <mesh geometry={geom}>
      {/* 0: cut-face caps, 1: rock walls */}
      <meshStandardMaterial attach="material-0" color="#a49a89" roughness={1} metalness={0} />
      <meshStandardMaterial attach="material-1" color="#6a645b" roughness={1} metalness={0} />
    </mesh>
  );
}

/** Regolith cap sitting on top of the section so the surface reads as terrain. */
function Regolith({ geo }: { geo: CutawayGeometry }) {
  return (
    <group>
      <mesh position={[-(HALF_X + geo.SHAFT_HALF) / 2 - geo.SHAFT_HALF / 2, 0.11, -DEPTH / 2]}>
        <boxGeometry args={[HALF_X - geo.SHAFT_HALF, 0.22, DEPTH]} />
        <meshStandardMaterial color="#9a9184" roughness={1} />
      </mesh>
      <mesh position={[(HALF_X + geo.SHAFT_HALF) / 2 + geo.SHAFT_HALF / 2, 0.11, -DEPTH / 2]}>
        <boxGeometry args={[HALF_X - geo.SHAFT_HALF, 0.22, DEPTH]} />
        <meshStandardMaterial color="#9a9184" roughness={1} />
      </mesh>
    </group>
  );
}

function Conduit({ geo }: { geo: CutawayGeometry }) {
  return (
    <group>
      {/* hollow conduit interior — back side only, so the bore reads as a void */}
      <mesh position={[0, geo.TUBE_Y, -0.001]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[geo.TUBE_R, geo.TUBE_R, HALF_X * 2 - 0.02, 64, 1, true]} />
        <meshStandardMaterial color="#3b352f" roughness={0.95} side={THREE.BackSide} />
      </mesh>
      {/* far wall of the conduit at the back of the block */}
      <mesh position={[0, geo.TUBE_Y, -DEPTH + 0.01]}>
        <circleGeometry args={[geo.TUBE_R, 48]} />
        <meshStandardMaterial color="#2e2926" roughness={1} />
      </mesh>
      {/* skylight shaft walls */}
      <mesh position={[0, (geo.CEIL_Y + 0) / 2, -DEPTH / 2]}>
        <boxGeometry args={[geo.SHAFT_HALF * 2, Math.abs(geo.CEIL_Y), DEPTH]} />
        <meshStandardMaterial color="#453e37" roughness={1} side={THREE.BackSide} />
      </mesh>
      {/* rubble cone beneath the skylight */}
      <mesh position={[0, geo.FLOOR_Y + 0.22, -1.4]}>
        <coneGeometry args={[0.75, 0.55, 24]} />
        <meshStandardMaterial color="#7d756a" roughness={1} />
      </mesh>
      <pointLight
        position={[0, geo.TUBE_Y + 0.4, -1.2]}
        intensity={16}
        distance={10}
        color="#cfe0ea"
      />
      <pointLight position={[-3.4, geo.TUBE_Y, -1.5]} intensity={9} distance={8} color="#b6c4cf" />
      <pointLight position={[3.4, geo.TUBE_Y, -1.5]} intensity={9} distance={8} color="#b6c4cf" />
    </group>
  );
}

function RadarRays({ running, geo }: { running: boolean; geo: CutawayGeometry }) {
  const group = useRef<THREE.Group>(null);
  const rays = useMemo(() => [-4.2, -2.4, 2.4, 4.2].map((x, i) => ({ x, offset: i * 0.23 })), []);
  const t = useRef(0);
  const TOP = 4.6;
  const CEIL_Y = geo.CEIL_Y;

  useFrame((_, delta) => {
    if (!running || !group.current) return;
    t.current += Math.min(delta, 0.05) * 0.35;
    group.current.children.forEach((child, i) => {
      const p = (t.current + rays[i]!.offset) % 1;
      const y =
        p < 0.5 ? TOP + (CEIL_Y - TOP) * (p / 0.5) : CEIL_Y + (TOP - CEIL_Y) * ((p - 0.5) / 0.5);
      child.position.y = y;
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = p < 0.5 ? 1 : 0.45;
    });
  });

  return (
    <group>
      {rays.map((r) => (
        <mesh key={`beam-${r.x}`} position={[r.x, (TOP + CEIL_Y) / 2, 0.02]}>
          <cylinderGeometry args={[0.012, 0.012, TOP - CEIL_Y, 6]} />
          <meshBasicMaterial color="#59c6e0" transparent opacity={0.22} />
        </mesh>
      ))}
      <group ref={group}>
        {rays.map((r) => (
          <mesh key={`pulse-${r.x}`} position={[r.x, TOP, 0.02]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color="#7fe0f2" transparent opacity={1} />
          </mesh>
        ))}
      </group>
      {/* reflector traces on the cut face: ceiling and floor returns */}
      <mesh position={[0, geo.CEIL_Y, 0.03]}>
        <planeGeometry args={[HALF_X * 2, 0.06]} />
        <meshBasicMaterial color="#59c6e0" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, geo.FLOOR_Y, 0.03]}>
        <planeGeometry args={[HALF_X * 2, 0.06]} />
        <meshBasicMaterial color="#5fd6a6" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Labels({ geo }: { geo: CutawayGeometry }) {
  const items: Array<[string, [number, number, number]]> = [
    ['Rimless skylight', [1.9, 0.55, 0.1]],
    ['Ceiling reflector', [-4.0, geo.CEIL_Y + 0.42, 0.1]],
    ['Basalt conduit', [3.4, geo.TUBE_Y, 0.1]],
    ['Floor reflector', [-4.0, geo.FLOOR_Y - 0.42, 0.1]],
  ];
  return (
    <>
      {items.map(([text, pos]) => (
        <Html key={text} position={pos} center distanceFactor={13} zIndexRange={[20, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded border border-border bg-popover/90 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground">
            {text}
          </div>
        </Html>
      ))}
    </>
  );
}

export default function TubeCutaway({
  depthMeters = 105,
  spanMeters = 80,
}: {
  depthMeters?: number;
  spanMeters?: number;
}) {
  const [running, setRunning] = useState(true);
  const geo = useMemo(() => deriveGeometry(depthMeters, spanMeters), [depthMeters, spanMeters]);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-lg border border-border bg-background/60 sm:h-[560px]">
      <Canvas
        camera={{ position: [3.2, 1.6, 12.5], fov: 42 }}
        dpr={[1, 2]}
        frameloop={running ? 'always' : 'demand'}
      >
        <color attach="background" args={['#0c0e13']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 10, 12]} intensity={2.1} />
        <directionalLight position={[-8, 3, 6]} intensity={0.45} color="#8fd4e8" />
        <group position={[0, 1.4, 0]}>
          <SectionBlock geo={geo} />
          <Regolith geo={geo} />
          <Conduit geo={geo} />
          <RadarRays running={running} geo={geo} />
          <Labels geo={geo} />
        </group>
        <OrbitControls
          enablePan={false}
          target={[0, -0.4, 0]}
          minDistance={8}
          maxDistance={24}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.95}
          rotateSpeed={0.5}
        />
      </Canvas>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="label-mono rounded border border-border bg-background/70 px-2 py-1">
          Schematic cross-section · span ~{spanMeters}m · depth ~{depthMeters}m
        </div>
        <Button
          size="sm"
          variant={running ? 'default' : 'outline'}
          className="font-mono text-[11px]"
          onClick={() => setRunning((v) => !v)}
        >
          {running ? 'Sounding: ACTIVE' : 'Sounding: PAUSED'}
        </Button>
      </div>
      <div className="label-mono pointer-events-none absolute inset-x-0 bottom-0 p-3 text-center">
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
