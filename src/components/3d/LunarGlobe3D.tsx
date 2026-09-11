import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SITES } from '../../data/sites';
import type { SiteDossier } from '../../types';
import { RotateCw, Sun } from 'lucide-react';

interface LunarGlobe3DProps {
  selectedSiteId?: string;
  onSelectSite: (site: SiteDossier) => void;
}

export const LunarGlobe3D: React.FC<LunarGlobe3DProps> = ({ selectedSiteId, onSelectSite }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredSite, setHoveredSite] = useState<SiteDossier | null>(null);
  const [sunAngle, setSunAngle] = useState<number>(45);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.z = 5.2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // PROCEDURAL MONOCHROME LUNAR REGOLITH TEXTURE
    const sphereRadius = 2.0;
    const geometry = new THREE.SphereGeometry(sphereRadius, 80, 80);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 1. Dark Basaltic Mare Background (Warm Graphite Tone)
      ctx.fillStyle = '#1c1c21';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. High-Albedo Highlands (Natural Silver-Grey Dust)
      for (let i = 0; i < 600; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 90 + 20;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(140, 140, 150, 0.15)');
        grad.addColorStop(1, 'rgba(28, 28, 33, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Prominent Impact Craters with Ejecta Rays (Tycho / Copernicus style)
      const majorCraters = [
        { x: 260, y: 380, r: 24 },
        { x: 380, y: 190, r: 18 },
        { x: 620, y: 220, r: 20 },
        { x: 780, y: 340, r: 22 },
      ];

      majorCraters.forEach((mc) => {
        for (let a = 0; a < 14; a++) {
          const angle = (a / 14) * Math.PI * 2;
          const rayLen = Math.random() * 120 + 50;
          ctx.strokeStyle = 'rgba(200, 200, 215, 0.18)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(mc.x, mc.y);
          ctx.lineTo(mc.x + Math.cos(angle) * rayLen, mc.y + Math.sin(angle) * rayLen);
          ctx.stroke();
        }
      });

      // 4. Micro Craters
      for (let i = 0; i < 280; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 10 + 2;
        ctx.strokeStyle = 'rgba(180, 180, 195, 0.4)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(12, 12, 15, 0.7)';
        ctx.beginPath();
        ctx.arc(x + 0.4, y + 0.4, r * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const moonTexture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.88,
      metalness: 0.08,
      bumpMap: moonTexture,
      bumpScale: 0.05,
    });
    const moonMesh = new THREE.Mesh(geometry, material);
    globeGroup.add(moonMesh);

    // Warm Limb Rim Atmosphere
    const limbGeom = new THREE.SphereGeometry(sphereRadius * 1.012, 64, 64);
    const limbMat = new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      transparent: true,
      opacity: 0.05,
      wireframe: true,
    });
    const limbMesh = new THREE.Mesh(limbGeom, limbMat);
    globeGroup.add(limbMesh);

    // EXTRUDED ALTITUDE PINS (SOLAR GOLD & EMERALD)
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    const siteMeshes: { mesh: THREE.Mesh; site: SiteDossier }[] = [];

    SITES.forEach((site) => {
      const surfacePos = latLonToVector3(site.lat, site.lon, sphereRadius);
      const headPos = latLonToVector3(site.lat, site.lon, sphereRadius + 0.12);

      const isAnchor = site.primaryAnchor;
      const markerColor = isAnchor ? 0x10b981 : 0xf59e0b; // Apollo Solar Gold

      // Altitude Stem
      const stemGeom = new THREE.BufferGeometry().setFromPoints([surfacePos, headPos]);
      const stemMat = new THREE.LineBasicMaterial({ color: markerColor, transparent: true, opacity: 0.85 });
      const stemLine = new THREE.Line(stemGeom, stemMat);
      pinGroup.add(stemLine);

      // Target Pin Head
      const pinGeom = new THREE.SphereGeometry(0.042, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: markerColor,
        emissive: markerColor,
        emissiveIntensity: 0.9,
      });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(headPos);
      pinMesh.userData = { site };
      pinGroup.add(pinMesh);

      // Surface Pulse Ring
      const ringGeom = new THREE.RingGeometry(0.055, 0.075, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(surfacePos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      pinGroup.add(ringMesh);

      siteMeshes.push({ mesh: pinMesh, site });
    });

    // WARM SOLAR LIGHTING
    const sunLight = new THREE.DirectionalLight(0xfffaf0, 2.5); // Warm sun
    sunLight.position.set(5 * Math.cos(sunAngle * (Math.PI / 180)), 1.5, 5 * Math.sin(sunAngle * (Math.PI / 180)));
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const ambientLight = new THREE.AmbientLight(0x18181b, 0.6);
    scene.add(ambientLight);

    const earthFillLight = new THREE.DirectionalLight(0x71717a, 0.35);
    earthFillLight.position.set(-4, -2, -3);
    scene.add(earthFillLight);

    // Neutral Deep Starfield
    const starGeom = new THREE.BufferGeometry();
    const starCount = 400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 45;
      starPositions[i + 1] = (Math.random() - 0.5) * 45;
      starPositions[i + 2] = -Math.random() * 30 - 5;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xd4d4d8, size: 0.08, transparent: true, opacity: 0.7 });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);

    // Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current && globeGroupRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        globeGroupRef.current.rotation.y += deltaX * 0.005;
        globeGroupRef.current.rotation.x += deltaY * 0.005;
        globeGroupRef.current.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globeGroupRef.current.rotation.x));

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
        targetRotationRef.current = null;
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(siteMeshes.map((s) => s.mesh));
        if (intersects.length > 0) {
          const hovered = intersects[0].object.userData.site as SiteDossier;
          setHoveredSite(hovered);
          container.style.cursor = 'pointer';
        } else {
          setHoveredSite(null);
          container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
        }
      }
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(siteMeshes.map((s) => s.mesh));
      if (intersects.length > 0) {
        const site = intersects[0].object.userData.site as SiteDossier;
        onSelectSite(site);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.003;
      cameraRef.current.position.z = Math.max(3.0, Math.min(8.0, cameraRef.current.position.z));
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (globeGroupRef.current) {
        if (targetRotationRef.current) {
          globeGroupRef.current.rotation.y += (targetRotationRef.current.y - globeGroupRef.current.rotation.y) * 0.05;
          globeGroupRef.current.rotation.x += (targetRotationRef.current.x - globeGroupRef.current.rotation.x) * 0.05;
        } else if (autoRotate && !isDraggingRef.current) {
          globeGroupRef.current.rotation.y += 0.0018;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 480;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sunLightRef.current) return;
    const rad = sunAngle * (Math.PI / 180);
    sunLightRef.current.position.set(5.5 * Math.cos(rad), 1.5, 5.5 * Math.sin(rad));
  }, [sunAngle]);

  useEffect(() => {
    if (!selectedSiteId) return;
    const site = SITES.find((s) => s.id === selectedSiteId);
    if (!site) return;

    const phi = site.lat * (Math.PI / 180);
    const theta = -(site.lon + 180) * (Math.PI / 180) - Math.PI / 2;

    targetRotationRef.current = { x: phi, y: theta };
  }, [selectedSiteId]);

  return (
    <div className="relative w-full h-[480px] bg-obsidian-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Orbit HUD Title */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center space-x-2 bg-obsidian-950/90 backdrop-blur-md border border-zinc-800 px-3.5 py-1.5 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-zinc-100 font-bold">LUNAR OBSERVATORY GLOBE</span>
          <span className="text-zinc-500 text-[10px]">| Mean Radius: 1,737.4 km</span>
        </div>
      </div>

      {/* Top Right: Hovered Target Dossier Overlay */}
      {hoveredSite && (
        <div className="absolute top-4 right-4 z-10 bg-obsidian-950/95 backdrop-blur-md border border-amber-750/90 px-4 py-2.5 rounded-xl text-xs font-mono shadow-xl pointer-events-none max-w-xs transition-all">
          <div className="text-amber-400 font-bold flex items-center justify-between">
            <span>{hoveredSite.name}</span>
            {hoveredSite.primaryAnchor && (
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                ANCHOR
              </span>
            )}
          </div>
          <div className="text-zinc-400 text-[11px] mt-1">
            {hoveredSite.lat.toFixed(2)}°N, {hoveredSite.lon.toFixed(2)}°E • {hoveredSite.dtmResolution}
          </div>
          <div className="text-zinc-500 text-[10px] mt-0.5">
            {hoveredSite.candidateCount} candidate features indexed
          </div>
        </div>
      )}

      {/* Bottom Floating Control Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-auto">
        
        {/* Dynamic Solar Terminator Scrubbing Slider */}
        <div className="flex items-center space-x-2 bg-obsidian-950/90 backdrop-blur-md border border-zinc-800 px-3.5 py-2 rounded-xl text-xs font-mono">
          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-zinc-400 text-[11px] whitespace-nowrap">Solar Terminator:</span>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={sunAngle}
            onChange={(e) => setSunAngle(parseInt(e.target.value))}
            className="w-24 sm:w-32 accent-amber-400 bg-obsidian-900 h-1.5 rounded cursor-pointer"
            title="Adjust Solar Incidence Angle"
          />
          <span className="text-amber-400 font-bold text-[10px] w-8">{sunAngle}°</span>
        </div>

        {/* Orbit Controls */}
        <div className="flex items-center space-x-2 justify-end">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-md transition flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-amber-950/60 text-amber-300 border-amber-700/80'
                : 'bg-obsidian-950/90 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'Orbit: Active' : 'Orbit: Paused'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
