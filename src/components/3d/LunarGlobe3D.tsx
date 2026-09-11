import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { SITES } from '../../data/sites';
import type { SiteDossier } from '../../types';

interface LunarGlobe3DProps {
  selectedSiteId: string | null;
  onSelectSite: (site: SiteDossier) => void;
  onHoverSite?: (site: SiteDossier | null) => void;
  onCursorCoords?: (coords: { lat: number; lon: number } | null) => void;
}

const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

export const LunarGlobe3D: React.FC<LunarGlobe3DProps> = ({
  selectedSiteId,
  onSelectSite,
  onHoverSite,
  onCursorCoords,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());

  // Store callbacks in refs to avoid re-init
  const onSelectSiteRef = useRef(onSelectSite);
  const onHoverSiteRef = useRef(onHoverSite);
  const onCursorCoordsRef = useRef(onCursorCoords);

  useEffect(() => {
    onSelectSiteRef.current = onSelectSite;
    onHoverSiteRef.current = onHoverSite;
    onCursorCoordsRef.current = onCursorCoords;
  }, [onSelectSite, onHoverSite, onCursorCoords]);

  const handleSelectedSite = useCallback((siteId: string | null) => {
    if (!siteId) return;
    const site = SITES.find((s) => s.id === siteId);
    if (!site) return;
    const phi = site.lat * (Math.PI / 180);
    const theta = -(site.lon + 180) * (Math.PI / 180) - Math.PI / 2;
    targetRotationRef.current = { x: phi, y: theta };
  }, []);

  // React to selectedSiteId changes
  useEffect(() => {
    handleSelectedSite(selectedSiteId);
  }, [selectedSiteId, handleSelectedSite]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.z = 5.2;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x060609, 1);
    container.replaceChildren(renderer.domElement);

    // Globe group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Moon sphere — procedural texture
    const sphereRadius = 2.0;
    const geometry = new THREE.SphereGeometry(sphereRadius, 96, 96);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark mare basalt
      ctx.fillStyle = '#1a1a1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Highlands
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 80 + 20;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(130, 130, 140, 0.12)');
        grad.addColorStop(1, 'rgba(26, 26, 30, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Major craters with ejecta
      const craters = [
        { x: 260, y: 380, r: 22 },
        { x: 380, y: 190, r: 16 },
        { x: 620, y: 220, r: 18 },
        { x: 780, y: 340, r: 20 },
      ];
      craters.forEach((mc) => {
        for (let a = 0; a < 12; a++) {
          const angle = (a / 12) * Math.PI * 2;
          const rayLen = Math.random() * 100 + 40;
          ctx.strokeStyle = 'rgba(180, 180, 195, 0.14)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mc.x, mc.y);
          ctx.lineTo(mc.x + Math.cos(angle) * rayLen, mc.y + Math.sin(angle) * rayLen);
          ctx.stroke();
        }
      });

      // Micro craters
      for (let i = 0; i < 220; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 8 + 2;
        ctx.strokeStyle = 'rgba(160, 160, 175, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(10, 10, 12, 0.6)';
        ctx.beginPath();
        ctx.arc(x + 0.3, y + 0.3, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const moonTexture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.9,
      metalness: 0.05,
      bumpMap: moonTexture,
      bumpScale: 0.04,
    });
    const moonMesh = new THREE.Mesh(geometry, material);
    globeGroup.add(moonMesh);

    // Subtle limb wireframe
    const limbGeom = new THREE.SphereGeometry(sphereRadius * 1.008, 64, 64);
    const limbMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.02,
      wireframe: true,
    });
    globeGroup.add(new THREE.Mesh(limbGeom, limbMat));

    // Site pins
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    const siteMeshes: { mesh: THREE.Mesh; site: SiteDossier }[] = [];

    SITES.forEach((site) => {
      const surfacePos = latLonToVector3(site.lat, site.lon, sphereRadius);
      const headPos = latLonToVector3(site.lat, site.lon, sphereRadius + 0.1);

      const isAnchor = site.primaryAnchor;
      const markerColor = isAnchor ? 0x14b8a6 : 0x3b82f6;

      // Stem line
      const stemGeom = new THREE.BufferGeometry().setFromPoints([surfacePos, headPos]);
      const stemMat = new THREE.LineBasicMaterial({
        color: markerColor,
        transparent: true,
        opacity: 0.7,
      });
      pinGroup.add(new THREE.Line(stemGeom, stemMat));

      // Pin head
      const pinGeom = new THREE.SphereGeometry(0.035, 12, 12);
      const pinMat = new THREE.MeshStandardMaterial({
        color: markerColor,
        emissive: markerColor,
        emissiveIntensity: 0.7,
      });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(headPos);
      pinMesh.userData = { site };
      pinGroup.add(pinMesh);

      // Surface ring
      const ringGeom = new THREE.RingGeometry(0.045, 0.06, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(surfacePos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      pinGroup.add(ringMesh);

      siteMeshes.push({ mesh: pinMesh, site });
    });

    // Lighting — neutral white, not warm
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 2, 4);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1a1a1e, 0.8);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0x52525b, 0.3);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    // Starfield — subtle
    const starGeom = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 50;
      starPositions[i + 1] = (Math.random() - 0.5) * 50;
      starPositions[i + 2] = -Math.random() * 30 - 8;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xa1a1aa,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
    });
    scene.add(new THREE.Points(starGeom, starMat));

    // Interaction handlers
    const handlePointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current && globeGroupRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        globeGroupRef.current.rotation.y += deltaX * 0.005;
        globeGroupRef.current.rotation.x += deltaY * 0.005;
        globeGroupRef.current.rotation.x = Math.max(
          -Math.PI / 2.2,
          Math.min(Math.PI / 2.2, globeGroupRef.current.rotation.x)
        );

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
        targetRotationRef.current = null;
      } else {
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(
          siteMeshes.map((s) => s.mesh)
        );
        if (intersects.length > 0) {
          const hovered = intersects[0].object.userData.site as SiteDossier;
          onHoverSiteRef.current?.(hovered);
          container.style.cursor = 'pointer';
        } else {
          onHoverSiteRef.current?.(null);
          container.style.cursor = isDraggingRef.current ? 'grabbing' : 'default';
        }

        // Compute lat/lon from mouse intersection with moon sphere
        const moonIntersects = raycasterRef.current.intersectObject(moonMesh);
        if (moonIntersects.length > 0) {
          const point = moonIntersects[0].point;
          // Convert world point to globe-local
          const localPoint = globeGroup.worldToLocal(point.clone());
          const r = localPoint.length();
          const lat = 90 - Math.acos(localPoint.y / r) * (180 / Math.PI);
          const lon = -(Math.atan2(localPoint.z, -localPoint.x) * (180 / Math.PI)) - 180;
          const normalizedLon = ((lon + 540) % 360) - 180;
          onCursorCoordsRef.current?.({ lat, lon: normalizedLon });
        } else {
          onCursorCoordsRef.current?.(null);
        }
      }
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        siteMeshes.map((s) => s.mesh)
      );
      if (intersects.length > 0) {
        const site = intersects[0].object.userData.site as SiteDossier;
        onSelectSiteRef.current(site);
      }

      // Resume auto-rotate after 5 seconds of no drag
      setTimeout(() => {
        if (!isDraggingRef.current) {
          autoRotateRef.current = true;
        }
      }, 5000);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.003;
      cameraRef.current.position.z = Math.max(
        3.0,
        Math.min(8.0, cameraRef.current.position.z)
      );
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (globeGroupRef.current) {
        if (targetRotationRef.current) {
          globeGroupRef.current.rotation.y +=
            (targetRotationRef.current.y - globeGroupRef.current.rotation.y) * 0.05;
          globeGroupRef.current.rotation.x +=
            (targetRotationRef.current.x - globeGroupRef.current.rotation.x) * 0.05;
        } else if (autoRotateRef.current && !isDraggingRef.current) {
          globeGroupRef.current.rotation.y += 0.001;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[500px]"
      style={{ cursor: 'default' }}
    />
  );
};
