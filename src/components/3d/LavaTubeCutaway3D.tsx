import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Waves } from 'lucide-react';

export const LavaTubeCutaway3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [radarActive, setRadarActive] = useState(true);

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
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(4.8, 3.4, 5.2);
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

    // 1. Host Basalt Crust Block (Warm Graphite Tone)
    const crustGeom = new THREE.BoxGeometry(4.2, 1.9, 2.4);
    const crustMat = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.92,
      metalness: 0.08,
      transparent: true,
      opacity: 0.88,
    });
    const crustMesh = new THREE.Mesh(crustGeom, crustMat);
    crustMesh.position.y = -0.2;
    modelGroup.add(crustMesh);

    // 2. Surface Regolith Layer
    const surfaceGeom = new THREE.BoxGeometry(4.24, 0.12, 2.44);
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.96,
      metalness: 0.04,
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeom, surfaceMat);
    surfaceMesh.position.y = 0.78;
    modelGroup.add(surfaceMesh);

    // 3. Vertical Skylight Pit Breach
    const pitGeom = new THREE.CylinderGeometry(0.48, 0.54, 0.95, 32, 1, true);
    const pitMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c0e,
      side: THREE.DoubleSide,
      roughness: 0.98,
    });
    const pitMesh = new THREE.Mesh(pitGeom, pitMat);
    pitMesh.position.set(-0.6, 0.38, 0);
    modelGroup.add(pitMesh);

    // Solar Gold Rim Lip
    const rimGeom = new THREE.TorusGeometry(0.5, 0.035, 16, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
    const rimMesh = new THREE.Mesh(rimGeom, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(-0.6, 0.84, 0);
    modelGroup.add(rimMesh);

    // 4. Hollow Subsurface Basalt Lava Tube Conduit
    const tubeGeom = new THREE.CylinderGeometry(0.58, 0.58, 4.0, 32, 1, true);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c0e,
      side: THREE.BackSide,
      roughness: 0.98,
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    tubeMesh.rotation.z = Math.PI / 2;
    tubeMesh.position.set(0, -0.25, 0);
    modelGroup.add(tubeMesh);

    // Internal structural reinforcing ribs (Warm Solar Gold)
    for (let i = -1.8; i <= 1.8; i += 0.6) {
      const ribGeom = new THREE.TorusGeometry(0.59, 0.015, 12, 32);
      const ribMat = new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.5 });
      const ribMesh = new THREE.Mesh(ribGeom, ribMat);
      ribMesh.rotation.y = Math.PI / 2;
      ribMesh.position.set(i, -0.25, 0);
      modelGroup.add(ribMesh);
    }

    // Talus Mound under skylight
    const talusGeom = new THREE.ConeGeometry(0.42, 0.35, 24);
    const talusMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const talusMesh = new THREE.Mesh(talusGeom, talusMat);
    talusMesh.position.set(-0.6, -0.65, 0);
    modelGroup.add(talusMesh);

    // 5. Orbital Radar Sounding Instrument & Pulsing Rays
    const satGeom = new THREE.BoxGeometry(0.32, 0.16, 0.22);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
    });
    const satMesh = new THREE.Mesh(satGeom, satMat);
    satMesh.position.set(0.6, 2.3, 0);
    modelGroup.add(satMesh);

    // Radar Rays (Amber Pulsing Rays)
    const radarLines: THREE.Line[] = [];
    const rayTargets = [
      { x: 0.3, y: -0.25 },
      { x: 0.6, y: -0.25 },
      { x: 0.9, y: -0.25 },
    ];

    rayTargets.forEach((rt) => {
      const points = [
        new THREE.Vector3(satMesh.position.x, satMesh.position.y, 0),
        new THREE.Vector3(rt.x, 0.78, 0),
        new THREE.Vector3(rt.x, rt.y, 0),
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineDashedMaterial({
        color: 0xf59e0b,
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

    // Lighting
    const dirLight = new THREE.DirectionalLight(0xfffaf0, 2.2);
    dirLight.position.set(4, 5, 4);
    scene.add(dirLight);

    const warmFill = new THREE.DirectionalLight(0xfbbf24, 0.6);
    warmFill.position.set(-3, -2, -3);
    scene.add(warmFill);

    const ambientLight = new THREE.AmbientLight(0x27272a, 1.1);
    scene.add(ambientLight);

    // Mouse Drag Controls
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
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      radarRaysRef.current.forEach((line, idx) => {
        const mat = line.material as THREE.LineDashedMaterial;
        mat.opacity = radarActive ? 0.4 + 0.5 * Math.sin(elapsed * 7 + idx) : 0;
      });

      if (!isDraggingRef.current && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.0015;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 460;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [radarActive]);

  return (
    <div className="relative w-full h-[460px] bg-obsidian-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Subsurface HUD */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center space-x-2 bg-obsidian-950/90 backdrop-blur-md border border-zinc-800 px-3.5 py-1.5 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-zinc-100 font-bold">SUBTERRANEAN CONDUIT GEOMETRY</span>
          <span className="text-zinc-500 text-[10px]">| Basalt Host Unit</span>
        </div>
      </div>

      {/* Top Right: Geological Layer Badges */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex flex-col gap-1.5 font-mono text-[10px] pointer-events-none">
        <div className="bg-obsidian-950/90 backdrop-blur-md border border-amber-800/60 text-amber-300 px-2.5 py-1 rounded">
          ● Surface Regolith (~5-15m)
        </div>
        <div className="bg-obsidian-950/90 backdrop-blur-md border border-emerald-800/60 text-emerald-300 px-2.5 py-1 rounded">
          ● Vertical Pit Skylight (-105m)
        </div>
        <div className="bg-obsidian-950/90 backdrop-blur-md border border-amber-800/60 text-amber-300 px-2.5 py-1 rounded">
          ● Intact Basalt Conduit (Span ~80m)
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-auto font-mono text-xs">
        <div className="text-zinc-400 bg-obsidian-950/90 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-lg hidden sm:block text-[11px]">
          Drag block to inspect internal conduit cross-section
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`px-3 py-1.5 rounded-lg border backdrop-blur-md transition flex items-center gap-1.5 ${
              radarActive
                ? 'bg-amber-950/60 text-amber-300 border-amber-700/80'
                : 'bg-obsidian-950/90 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{radarActive ? 'Radar Sounding: Active' : 'Radar: Off'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
