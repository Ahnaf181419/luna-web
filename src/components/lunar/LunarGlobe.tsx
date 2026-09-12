import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SITES, type SiteId } from "@/lib/lunarvoid-data";
import { Button } from "@/components/ui/button";

const RADIUS = 2;

function latLonToVec3(lat: number, lon: number, r = RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

/** Inverse of latLonToVec3 — recovers site coordinates from a world-space point. */
function vec3ToLatLon(v: THREE.Vector3) {
  const r = v.length() || 1;
  const phi = Math.acos(THREE.MathUtils.clamp(v.y / r, -1, 1));
  const lat = 90 - (phi * 180) / Math.PI;
  const theta = Math.atan2(v.z, -v.x);
  let lon = (theta * 180) / Math.PI - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat, lon };
}

function formatCursorCoord(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lon).toFixed(2)}°${ew}`;
}

/** Procedural regolith texture: noise base + randomly scattered craters. */
function useMoonTextures() {
  return useMemo(() => {
    const w = 2048;
    const h = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#7e7a72";
    ctx.fillRect(0, 0, w, h);

    // maria — darker basalt plains
    let seed = 20260909;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 0; i < 26; i++) {
      const x = rnd() * w;
      const y = h * 0.18 + rnd() * h * 0.64;
      const r = 60 + rnd() * 190;
      const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
      g.addColorStop(0, "rgba(58,56,54,0.85)");
      g.addColorStop(1, "rgba(58,56,54,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // craters
    for (let i = 0; i < 1400; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const r = 1.5 + Math.pow(rnd(), 3) * 34;
      const shade = 40 + rnd() * 40;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${shade},${shade - 2},${shade - 6},0.5)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - r * 0.16, y - r * 0.16, r * 0.94, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(215,210,200,0.35)";
      ctx.lineWidth = Math.max(0.6, r * 0.12);
      ctx.stroke();
    }

    // fine grain
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (rnd() - 0.5) * 26;
      d[i] = (d[i] ?? 0) + n;
      d[i + 1] = (d[i + 1] ?? 0) + n;
      d[i + 2] = (d[i + 2] ?? 0) + n;
    }
    ctx.putImageData(img, 0, 0);

    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;

    const bump = new THREE.CanvasTexture(canvas);
    return { map, bump };
  }, []);
}

function Marker({
  position,
  active,
  label,
  onSelect,
}: {
  position: THREE.Vector3;
  active: boolean;
  label: string;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const quat = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal),
    [normal],
  );

  // Restore the page cursor if the marker unmounts while hovered.
  useEffect(
    () => () => {
      document.body.style.cursor = "auto";
    },
    [],
  );

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.getElapsedTime();
    const s = active ? 1 + Math.sin(t * 3) * 0.22 : 1;
    ringRef.current.scale.setScalar(s);
  });

  const color = active ? "#f0b34a" : hovered ? "#6fd0e6" : "#d7d2c6";

  return (
    <group
      position={position.clone().multiplyScalar(1.001)}
      quaternion={quat}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.26, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.29, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.085, 32]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
      {(hovered || active) && (
        <Html center distanceFactor={6} position={[0, 0.5, 0]} zIndexRange={[20, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded border border-border bg-popover/95 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground shadow-lg">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function Moon({
  activeSite,
  autoRotate,
  onSelect,
  onCursor,
}: {
  activeSite: SiteId | null;
  autoRotate: boolean;
  onSelect: (id: SiteId) => void;
  onCursor?: (coord: { lat: number; lon: number } | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const { map, bump } = useMoonTextures();
  const { camera } = useThree();
  const targetQuat = useRef<THREE.Quaternion | null>(null);
  const invWorldQuat = useRef(new THREE.Quaternion());

  // Release GPU-backed canvas textures on unmount (StrictMode double-mounts included).
  useEffect(
    () => () => {
      map.dispose();
      bump.dispose();
    },
    [map, bump],
  );

  useEffect(() => {
    if (!activeSite) return;
    const site = SITES.find((s) => s.id === activeSite)!;
    const dir = latLonToVec3(site.lat, site.lon).normalize();
    const camDir = camera.position.clone().normalize();
    targetQuat.current = new THREE.Quaternion().setFromUnitVectors(dir, camDir);
  }, [activeSite, camera]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    if (targetQuat.current) {
      g.quaternion.slerp(targetQuat.current, 1 - Math.exp(-4 * dt));
      if (g.quaternion.angleTo(targetQuat.current) < 0.01) targetQuat.current = null;
    } else if (autoRotate) {
      g.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), dt * 0.12);
    }
  });

  return (
    <group ref={group}>
      <mesh
        onPointerMove={(e) => {
          if (!onCursor) return;
          e.stopPropagation();
          const local = e.point.clone();
          group.current?.getWorldQuaternion(invWorldQuat.current);
          local.applyQuaternion(invWorldQuat.current.clone().invert());
          onCursor(vec3ToLatLon(local));
        }}
        onPointerOut={() => onCursor?.(null)}
      >
        <sphereGeometry args={[RADIUS, 96, 96]} />
        <meshStandardMaterial
          map={map}
          bumpMap={bump}
          bumpScale={6}
          roughness={0.98}
          metalness={0}
        />
      </mesh>
      {SITES.map((s) => (
        <Marker
          key={s.id}
          position={latLonToVec3(s.lat, s.lon)}
          active={activeSite === s.id}
          label={`${s.id} · ${s.coordLabel}`}
          onSelect={() => onSelect(s.id)}
        />
      ))}
    </group>
  );
}

export default function LunarGlobe({
  activeSite,
  onSelect,
}: {
  activeSite: SiteId | null;
  onSelect: (id: SiteId) => void;
}) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [cursor, setCursor] = useState<{ lat: number; lon: number } | null>(null);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-lg border border-border bg-background/60 sm:h-[540px]">
      <Canvas camera={{ position: [0, 1.2, 6], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#0b0d12"]} />
        <ambientLight intensity={0.28} />
        <directionalLight position={[6, 4, 6]} intensity={2.1} />
        <directionalLight position={[-6, -2, -4]} intensity={0.25} color="#7fb6d9" />
        <Stars radius={60} depth={40} count={2200} factor={3} fade speed={0.4} />
        <Moon
          activeSite={activeSite}
          autoRotate={autoRotate}
          onSelect={onSelect}
          onCursor={setCursor}
        />
        <OrbitControls
          enablePan={false}
          minDistance={3.2}
          maxDistance={11}
          rotateSpeed={0.5}
          zoomSpeed={0.7}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="label-mono rounded border border-border bg-background/70 px-2 py-1">
          LRO WAC basemap · shaded relief proxy
        </div>
        <Button
          size="sm"
          variant={autoRotate ? "default" : "outline"}
          className="pointer-events-auto font-mono text-[11px]"
          onClick={() => setAutoRotate((v) => !v)}
        >
          {autoRotate ? "Auto-rotate: ON" : "Auto-rotate: OFF"}
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-3 gap-2">
        <div className="label-mono rounded border border-border bg-background/70 px-2 py-1 text-foreground">
          {cursor ? formatCursorCoord(cursor.lat, cursor.lon) : "—.—° —.—°"}
        </div>
        <div className="label-mono hidden sm:block text-muted-foreground text-center">
          drag to rotate · scroll to zoom · click a pin to focus the site
        </div>
      </div>
    </div>
  );
}
