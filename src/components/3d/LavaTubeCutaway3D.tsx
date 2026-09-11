import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Waves } from 'lucide-react';

export const LavaTubeCutaway3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [radarActive, setRadarActive] = useState(true);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const radarRaysRef = useRef<THREE.Line[]>([]);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(4.5, 3.2, 5.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 1. Lunar Surface & Crust Block
    // Cutaway basalt host rock
    const crustGeom = new THREE.BoxGeometry(4.0, 1.8, 2.4);
    const crustMat = new THREE.MeshStandardMaterial({
      color: 0x161e2e,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const crustMesh = new THREE.Mesh(crustGeom, crustMat);
    crustMesh.position.y = -0.2;
    modelGroup.add(crustMesh);

    // Regolith Surface Layer (Top plane)
    const surfaceGeom = new THREE.BoxGeometry(4.04, 0.1, 2.44);
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.95,
      metalness: 0.05,
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeom, surfaceMat);
    surfaceMesh.position.y = 0.75;
    modelGroup.add(surfaceMesh);

    // 2. Vertical Skylight Collapse Pit
    const pitGeom = new THREE.CylinderGeometry(0.45, 0.5, 0.9, 32, 1, true);
    const pitMat = new THREE.MeshStandardMaterial({
      color: 0x090d14,
      side: THREE.DoubleSide,
      roughness: 0.95,
    });
    const pitMesh = new THREE.Mesh(pitGeom, pitMat);
    pitMesh.position.set(-0.6, 0.35, 0);
    modelGroup.add(pitMesh);

    // Skylight Rim Lip
    const rimGeom = new THREE.TorusGeometry(0.48, 0.04, 16, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.8 });
    const rimMesh = new THREE.Mesh(rimGeom, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(-0.6, 0.8, 0);
    modelGroup.add(rimMesh);

    // 3. Subsurface Lava Tube Conduit Void (Cylinder running horizontally through crust)
    const tubeGeom = new THREE.CylinderGeometry(0.55, 0.55, 3.8, 32, 1, true);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x070a10,
      side: THREE.BackSide,
      roughness: 0.98,
      wireframe: false,
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    tubeMesh.rotation.z = Math.PI / 2;
    tubeMesh.position.set(0, -0.25, 0);
    modelGroup.add(tubeMesh);

    // Internal Tube Conduit Glow Rings (indicating void boundary)
    for (let i = -1.6; i <= 1.6; i += 0.8) {
      const ribGeom = new THREE.TorusGeometry(0.56, 0.015, 12, 32);
      const ribMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.6 });
      const ribMesh = new THREE.Mesh(ribGeom, ribMat);
      ribMesh.rotation.y = Math.PI / 2;
      ribMesh.position.set(i, -0.25, 0);
      modelGroup.add(ribMesh);
    }

    // 4. Orbital Radar Transmitter & Echo Rays
    const satelliteGeom = new THREE.BoxGeometry(0.3, 0.15, 0.2);
    const satelliteMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.4 });
    const satelliteMesh = new THREE.Mesh(satelliteGeom, satelliteMat);
    satelliteMesh.position.set(0.6, 2.2, 0);
    modelGroup.add(satelliteMesh);

    // Radar Sounding Rays (3 animated pulses)
    const radarLines: THREE.Line[] = [];
    const rayOrigins = [
      { x: 0.4, targetY: -0.25 },
      { x: 0.6, targetY: -0.25 },
      { x: 0.8, targetY: -0.25 }
    ];

    rayOrigins.forEach((ro) => {
      const points = [
        new THREE.Vector3(satelliteMesh.position.x, satelliteMesh.position.y, 0),
        new THREE.Vector3(ro.x, 0.75, 0), // Ground hit
        new THREE.Vector3(ro.x, ro.targetY, 0), // Tube interior reflection
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineDashedMaterial({
        color: 0x6366f1,
        dashSize: 0.15,
        gapSize: 0.08,
        transparent: true,
        opacity: 0.85,
      });
      const line = new THREE.Line(geom, mat);
      line.computeLineDistances();
      modelGroup.add(line);
      radarLines.push(line);
    });
    radarRaysRef.current = radarLines;

    // Ambient & Directional Lighting
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(4, 5, 4);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
    fillLight.position.set(-3, -2, -3);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.0);
    scene.add(ambientLight);

    // Mouse Interaction
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      modelGroupRef.current.rotation.y += deltaX * 0.007;
      modelGroupRef.current.rotation.x += deltaY * 0.007;
      modelGroupRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, modelGroupRef.current.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate radar rays opacity / dashes
      radarRaysRef.current.forEach((line, idx) => {
        const mat = line.material as THREE.LineDashedMaterial;
        mat.opacity = radarActive ? 0.4 + 0.5 * Math.sin(elapsedTime * 6 + idx) : 0;
      });

      // Gentle floating animation
      if (!isDraggingRef.current && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();

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
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [radarActive]);

  return (
    <div className="relative w-full h-[450px] bg-obsidian-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Badges */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center space-x-2 bg-obsidian-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">SUBTERRANEAN CONDUIT CUTAWAY</span>
        </div>
      </div>

      {/* Layer Annotations */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex flex-col gap-1.5 font-mono text-[10px]">
        <div className="bg-obsidian-950/80 backdrop-blur-md border border-cyan-800/60 text-cyan-300 px-2.5 py-1 rounded">
          ● Surface Regolith (~5-15m)
        </div>
        <div className="bg-obsidian-950/80 backdrop-blur-md border border-emerald-800/60 text-emerald-300 px-2.5 py-1 rounded">
          ● Skylight Pit Drop (~80-105m)
        </div>
        <div className="bg-obsidian-950/80 backdrop-blur-md border border-indigo-800/60 text-indigo-300 px-2.5 py-1 rounded">
          ● Basalt Conduit Void (Span ~60-120m)
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-auto font-mono text-xs">
        <div className="text-slate-400 bg-obsidian-950/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-lg hidden sm:block text-[11px]">
          Drag to rotate 3D geological block
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`px-3 py-1.5 rounded-lg border backdrop-blur-md transition flex items-center gap-1.5 ${
              radarActive
                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                : 'bg-obsidian-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{radarActive ? 'Radar Sounding: ON' : 'Radar Sounding: OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
