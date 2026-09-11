import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SITES } from '../../data/sites';
import type { SiteDossier } from '../../types';
import { RotateCw, Compass } from 'lucide-react';

interface LunarGlobe3DProps {
  selectedSiteId?: string;
  onSelectSite: (site: SiteDossier) => void;
}

export const LunarGlobe3D: React.FC<LunarGlobe3DProps> = ({ selectedSiteId, onSelectSite }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredSite, setHoveredSite] = useState<SiteDossier | null>(null);

  // References to three objects for interaction
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Convert lat/lon to spherical 3D coordinates
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
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // Main Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Lunar Sphere with procedural crater textures
    const sphereRadius = 2.0;
    const geometry = new THREE.SphereGeometry(sphereRadius, 64, 64);

    // Procedural lunar canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base dark basalt mare
      ctx.fillStyle = '#1c2230';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Highland lighter regolith
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 80 + 20;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(80, 95, 120, 0.15)');
        grad.addColorStop(1, 'rgba(28, 34, 48, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Procedural impact craters
      for (let i = 0; i < 180; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 12 + 2;
        ctx.strokeStyle = 'rgba(140, 160, 190, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(10, 14, 22, 0.6)';
        ctx.beginPath();
        ctx.arc(x + 0.5, y + 0.5, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const moonTexture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.88,
      metalness: 0.12,
      bumpMap: moonTexture,
      bumpScale: 0.04,
    });
    const moonMesh = new THREE.Mesh(geometry, material);
    globeGroup.add(moonMesh);

    // Atmosphere / Lunar Exosphere rim glow
    const atmosphereGeom = new THREE.SphereGeometry(sphereRadius * 1.015, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Site Markers / Coordinate Pins
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    const siteMeshes: { mesh: THREE.Mesh; site: SiteDossier }[] = [];

    SITES.forEach((site) => {
      const pos = latLonToVector3(site.lat, site.lon, sphereRadius * 1.02);

      // Pin Head Marker
      const pinGeom = new THREE.SphereGeometry(0.045, 16, 16);
      const isAnchor = site.primaryAnchor;
      const pinMat = new THREE.MeshStandardMaterial({
        color: isAnchor ? 0x10b981 : 0x06b6d4,
        emissive: isAnchor ? 0x10b981 : 0x06b6d4,
        emissiveIntensity: 0.9,
      });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = { site };
      pinGroup.add(pinMesh);

      // Outer Pulse Ring
      const ringGeom = new THREE.RingGeometry(0.06, 0.075, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isAnchor ? 0x10b981 : 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      pinGroup.add(ringMesh);

      siteMeshes.push({ mesh: pinMesh, site });
    });

    // Lighting (Solar directional light mimicking lunar day/night terminator)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(5, 2, 4);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x141e30, 0.65);
    scene.add(ambientLight);

    // Secondary subtle fill
    const fillLight = new THREE.DirectionalLight(0x6366f1, 0.4);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    // Starfield Particle background
    const starGeom = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 40;
      starPositions[i + 1] = (Math.random() - 0.5) * 40;
      starPositions[i + 2] = -Math.random() * 25 - 5;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.7 });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);

    // Raycasting for pin clicks & hover
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

        // Clamp x rotation to avoid flip
        globeGroupRef.current.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globeGroupRef.current.rotation.x));

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
        targetRotationRef.current = null;
      } else {
        // Check hover
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(siteMeshes.map(s => s.mesh));
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

    const handlePointerUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // Detect click without drag
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(clickX, clickY), camera);
      const intersects = raycaster.intersectObjects(siteMeshes.map(s => s.mesh));
      if (intersects.length > 0) {
        const site = intersects[0].object.userData.site as SiteDossier;
        onSelectSite(site);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.003;
      cameraRef.current.position.z = Math.max(3.2, Math.min(8.0, cameraRef.current.position.z));
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (globeGroupRef.current) {
        if (targetRotationRef.current) {
          // Smooth slerp to target site
          globeGroupRef.current.rotation.y += (targetRotationRef.current.y - globeGroupRef.current.rotation.y) * 0.05;
          globeGroupRef.current.rotation.x += (targetRotationRef.current.x - globeGroupRef.current.rotation.x) * 0.05;
        } else if (autoRotate && !isDraggingRef.current) {
          globeGroupRef.current.rotation.y += 0.002;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 450;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // When selectedSiteId changes, rotate smoothly to focus on that site
  useEffect(() => {
    if (!selectedSiteId) return;
    const site = SITES.find(s => s.id === selectedSiteId);
    if (!site) return;

    // Calculate spherical target rotation so the marker faces +Z (camera)
    const phi = (site.lat) * (Math.PI / 180);
    const theta = -(site.lon + 180) * (Math.PI / 180) - Math.PI / 2;

    targetRotationRef.current = {
      x: phi,
      y: theta,
    };
  }, [selectedSiteId]);

  return (
    <div className="relative w-full h-[450px] bg-obsidian-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating UI Overlay: Telemetry & Controls */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center space-x-2 bg-obsidian-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">LUNAR INTERACTIVE GLOBE</span>
          <span className="text-slate-500 text-[10px]">| R = 1,737.4 km</span>
        </div>
      </div>

      {/* Hovered Site Card */}
      {hoveredSite && (
        <div className="absolute top-4 right-4 z-10 bg-obsidian-950/90 backdrop-blur-md border border-cyan-700/80 px-4 py-2.5 rounded-xl text-xs font-mono shadow-lg pointer-events-none max-w-xs transition-all">
          <div className="text-cyan-400 font-bold flex items-center justify-between">
            <span>{hoveredSite.name}</span>
            {hoveredSite.primaryAnchor && (
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">ANCHOR</span>
            )}
          </div>
          <div className="text-slate-400 text-[11px] mt-1">
            Coords: {hoveredSite.lat.toFixed(2)}°, {hoveredSite.lon.toFixed(2)}°
          </div>
          <div className="text-slate-500 text-[10px] mt-0.5">
            DTM: {hoveredSite.dtmResolution} • {hoveredSite.candidateCount} Candidates
          </div>
        </div>
      )}

      {/* Controls Bar Bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-auto">
        <div className="text-[11px] font-mono text-slate-400 bg-obsidian-950/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-lg hidden sm:flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click pinpoint or drag to inspect lunar targets</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg text-xs font-mono border backdrop-blur-md transition flex items-center gap-1.5 ${
              autoRotate 
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800' 
                : 'bg-obsidian-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Auto-Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Orbit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
