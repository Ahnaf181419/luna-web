import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Stars } from '@react-three/drei';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { formatCoord, SITES, type SiteId } from '@/lib/lunarvoid-data';
import { Button } from '@/components/ui/button';

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
  return formatCoord(lat, lon, ' ');
}

/** Module-scope marker data — stable Vector3 identity so Marker memos hold. */
const SITE_MARKERS = SITES.map((s) => ({
  id: s.id,
  label: `${s.id} · ${s.coordLabel}`,
  position: latLonToVec3(s.lat, s.lon),
}));

export type MoonTextureSource = 'procedural' | 'lroc-color-pbr';

// Sized to match the real LROC color map (public/moon/ldam_4k.jpg — 2048×1024).
// Keeping the procedural fallback at the same resolution means the GPU texture
// slots don't need to be reallocated when the real texture loads, avoiding the
// "Offset overflows texture dimensions" WebGL warning.
const PROC_W = 2048;
const PROC_H = 1024;
const NASA_IMAGE_URL = 'moon/ldam_4k.jpg';

/**
 * Bumped whenever the real moon texture is added/replaced in public/moon/.
 * Keeps the URL distinct from any prior browser-cached failure so a stale
 * "404/HTML-fallback" entry from before the file existed doesn't shadow the
 * upgrade.
 */
const MOON_ASSET_VERSION = '3';

function buildProceduralCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = PROC_W;
  canvas.height = PROC_H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  ctx.fillStyle = '#7e7a72';
  ctx.fillRect(0, 0, PROC_W, PROC_H);

  let seed = 20260909;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 26; i++) {
    const x = rnd() * PROC_W;
    const y = PROC_H * 0.18 + rnd() * PROC_H * 0.64;
    const r = 60 + rnd() * 190;
    const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    g.addColorStop(0, 'rgba(58,56,54,0.85)');
    g.addColorStop(1, 'rgba(58,56,54,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 700; i++) {
    const x = rnd() * PROC_W;
    const y = rnd() * PROC_H;
    const r = 3 + Math.pow(rnd(), 3) * 68;
    const shade = 40 + rnd() * 40;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${shade},${shade - 2},${shade - 6},0.5)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - r * 0.16, y - r * 0.16, r * 0.94, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(215,210,200,0.35)';
    ctx.lineWidth = Math.max(0.6, r * 0.12);
    ctx.stroke();
  }
  return canvas;
}

/** ITU-R BT.601 luminance from a color ImageData. */
function luminance(data: Uint8ClampedArray, i: number): number {
  return data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114;
}

/**
 * Sobel-derived normal map from luminance. Encodes (dx, dy) surface gradients
 * into RGB so the GPU can light the sphere with real surface relief — much more
 * accurate than `bumpMap` alone, which the shader approximates in-shader from a
 * height field.
 *
 * `strength` is a multiplier on the gradient; the moon has gentle, large-scale
 * relief (maria vs. highlands), so a low-ish value keeps the surface sculpted
 * rather than jagged.
 */
function bakeNormalFromLuminance(canvas: HTMLCanvasElement, strength = 1.8): HTMLCanvasElement {
  const w = canvas.width;
  const h = canvas.height;
  const src = canvas.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, w, h).data;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const octx = out.getContext('2d', { willReadFrequently: true })!;
  const dst = octx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const xm = (x - 1 + w) % w;
      const xp = (x + 1) % w;
      const ym = (y - 1 + h) % h;
      const yp = (y + 1) % h;
      const lx = luminance(src, (y * w + xp) * 4) - luminance(src, (y * w + xm) * 4);
      const ly = luminance(src, (yp * w + x) * 4) - luminance(src, (ym * w + x) * 4);
      const i = (y * w + x) * 4;
      dst.data[i] = Math.max(0, Math.min(255, 128 - lx * strength));
      dst.data[i + 1] = Math.max(0, Math.min(255, 128 - ly * strength));
      dst.data[i + 2] = 255;
      dst.data[i + 3] = 255;
    }
  }
  octx.putImageData(dst, 0, 0);
  return out;
}

/**
 * Roughness map from luminance. The lunar regolith is roughly uniform (~0.95)
 * but mare basalts are very slightly darker than highland anorthosite in
 * specular response — we map the luminance into a narrow [lo, hi] range so the
 * mare/highland contrast reads without losing physical plausibility.
 */
function bakeRoughnessFromLuminance(
  canvas: HTMLCanvasElement,
  lo = 0.92,
  hi = 0.99,
): HTMLCanvasElement {
  const src = canvas
    .getContext('2d', { willReadFrequently: true })!
    .getImageData(0, 0, canvas.width, canvas.height).data;
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;
  const octx = out.getContext('2d', { willReadFrequently: true })!;
  const dst = octx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < src.length; i += 4) {
    const l = luminance(src, i) / 255;
    const r = Math.round((lo + (hi - lo) * (1 - l)) * 255);
    dst.data[i] = dst.data[i + 1] = dst.data[i + 2] = r;
    dst.data[i + 3] = 255;
  }
  octx.putImageData(dst, 0, 0);
  return out;
}

interface MoonTextures {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  source: MoonTextureSource;
}

/**
 * Procedural canvas renders synchronously so the sphere has a valid texture on the
 * first frame. If a real LROC-derived color map is present at public/moon/ldam_4k.jpg,
 * it loads async and is uploaded onto the same CanvasTexture objects (no remount,
 * no state churn; Markers stay memoized). A Sobel-derived normal map and a
 * luminance-derived roughness map are computed at upload time so the sphere
 * responds to light with real surface relief rather than a flat-shaded albedo.
 */
function useMoonTextures(onSourceChange?: (s: MoonTextureSource) => void): MoonTextures {
  const proceduralCanvas = useMemo(() => buildProceduralCanvas(), []);
  const proceduralRoughnessCanvas = useMemo(
    () => bakeRoughnessFromLuminance(proceduralCanvas),
    [proceduralCanvas],
  );
  const map = useMemo(() => {
    const t = new THREE.CanvasTexture(proceduralCanvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [proceduralCanvas]);
  const normalMap = useMemo(() => {
    const t = new THREE.CanvasTexture(bakeNormalFromLuminance(proceduralCanvas, 1.2));
    return t;
  }, [proceduralCanvas]);
  const roughnessMap = useMemo(() => {
    const t = new THREE.CanvasTexture(proceduralRoughnessCanvas);
    return t;
  }, [proceduralRoughnessCanvas]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    const apply = () => {
      if (cancelled) return;
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || PROC_W;
      c.height = img.naturalHeight || PROC_H;
      const ctx = c.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      map.image = c;
      map.colorSpace = THREE.SRGBColorSpace;
      map.needsUpdate = true;
      const normalCanvas = bakeNormalFromLuminance(c, 1.8);
      normalMap.image = normalCanvas;
      normalMap.needsUpdate = true;
      const roughCanvas = bakeRoughnessFromLuminance(c);
      roughnessMap.image = roughCanvas;
      roughnessMap.needsUpdate = true;
      onSourceChange?.('lroc-color-pbr');
    };
    const img = new Image();
    img.onload = () => {
      apply();
    };
    img.onerror = () => {
      /* file absent or fetch blocked — keep the procedural fallback; no log noise */
    };
    img.src = `${NASA_IMAGE_URL}?v=${MOON_ASSET_VERSION}`;
    // If the image was cached or decoded synchronously (very small file, same
    // origin) onload may have already fired before we attached the listener —
    // pick it up here.
    if (img.complete && img.naturalWidth > 0) apply();
    return () => {
      cancelled = true;
    };
  }, [map, normalMap, roughnessMap, onSourceChange]);

  return useMemo(
    () => ({ map, normalMap, roughnessMap, source: 'procedural' as MoonTextureSource }),
    [map, normalMap, roughnessMap],
  );
}

const Marker = memo(function Marker({
  siteId,
  position,
  active,
  label,
  onSelect,
}: {
  siteId: SiteId;
  position: THREE.Vector3;
  active: boolean;
  label: string;
  onSelect: (id: SiteId) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal),
    [normal],
  );

  // Restore the page cursor if the marker unmounts while hovered.
  useEffect(
    () => () => {
      document.body.style.cursor = 'auto';
    },
    [],
  );

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.getElapsedTime();
    const s = active ? 1 + Math.sin(t * 3) * 0.22 : 1;
    ringRef.current.scale.setScalar(s);
  });

  const color = active ? '#f0b34a' : hovered ? '#6fd0e6' : '#d7d2c6';

  return (
    <group
      position={position.clone().multiplyScalar(1.001)}
      quaternion={quat}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(siteId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
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
});

const Moon = memo(function Moon({
  activeSite,
  autoRotate,
  onSelect,
  onCursor,
  onTextureSource,
}: {
  activeSite: SiteId | null;
  autoRotate: boolean;
  onSelect: (id: SiteId) => void;
  onCursor?: (coord: { lat: number; lon: number } | null) => void;
  onTextureSource?: (s: MoonTextureSource) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const { map, normalMap, roughnessMap } = useMoonTextures(onTextureSource);
  const { camera } = useThree();
  const targetQuat = useRef<THREE.Quaternion | null>(null);
  const invWorldQuat = useRef(new THREE.Quaternion());

  // Release GPU-backed canvas textures on unmount (StrictMode double-mounts included).
  useEffect(
    () => () => {
      map.dispose();
      normalMap.dispose();
      roughnessMap.dispose();
    },
    [map, normalMap, roughnessMap],
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
        <sphereGeometry args={[RADIUS, 192, 192]} />
        <meshStandardMaterial
          map={map}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          roughness={1}
          metalness={0}
        />
      </mesh>
      {SITE_MARKERS.map((m) => (
        <Marker
          key={m.id}
          siteId={m.id}
          position={m.position}
          active={activeSite === m.id}
          label={m.label}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
});

export default function LunarGlobe({
  activeSite,
  onSelect,
}: {
  activeSite: SiteId | null;
  onSelect: (id: SiteId) => void;
}) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [textureSource, setTextureSource] = useState<MoonTextureSource>('procedural');
  const readoutRef = useRef<HTMLDivElement>(null);
  const updateReadout = useCallback((coord: { lat: number; lon: number } | null) => {
    const el = readoutRef.current;
    if (el) el.textContent = coord ? formatCursorCoord(coord.lat, coord.lon) : '—.—° —.—°';
  }, []);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-lg border border-border bg-background/60 sm:h-[540px]">
      <Canvas camera={{ position: [0, 1.2, 6], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#04060a']} />
        {/* No lunar atmosphere: ambient is minimal. The dominant light is a
            single harsh "sun" — high ratio against the night-side gives the
            moon its characteristic stark day/night terminator. */}
        <ambientLight intensity={0.05} />
        <hemisphereLight args={['#3a3a40', '#0a0a10', 0.18]} />
        <directionalLight position={[5, 3, 6]} intensity={3.2} color="#fff7e6" />
        {/* Faint earthshine / fill from the anti-solar direction. */}
        <directionalLight position={[-7, -2, -5]} intensity={0.18} color="#9fb8c8" />
        <Stars radius={60} depth={40} count={1200} factor={3} fade speed={0.25} />
        <Moon
          activeSite={activeSite}
          autoRotate={autoRotate}
          onSelect={onSelect}
          onCursor={updateReadout}
          onTextureSource={setTextureSource}
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
          {textureSource === 'lroc-color-pbr'
            ? 'LROC color basemap · derived normal & roughness · PBR'
            : 'LRO WAC basemap · shaded relief proxy'}
        </div>
        <Button
          size="sm"
          variant={autoRotate ? 'default' : 'outline'}
          className="pointer-events-auto font-mono text-[11px]"
          onClick={() => setAutoRotate((v) => !v)}
        >
          {autoRotate ? 'Auto-rotate: ON' : 'Auto-rotate: OFF'}
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-3 gap-2">
        <div
          ref={readoutRef}
          className="label-mono rounded border border-border bg-background/70 px-2 py-1 text-foreground"
        >
          —.—° —.—°
        </div>
        <div className="label-mono hidden sm:block text-muted-foreground text-center">
          drag to rotate · scroll to zoom · click a pin to focus the site
        </div>
      </div>
    </div>
  );
}
