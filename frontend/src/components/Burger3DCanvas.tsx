import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { Sparkles } from 'lucide-react';

interface Props {
  className?: string;
  replayTrigger?: number;
}

export default function Burger3DCanvas({ className = '', replayTrigger = 0 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // References to three objects for interaction
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const burgerGroupRef = useRef<THREE.Group | null>(null);
  const candleLeftRef = useRef<THREE.PointLight | null>(null);
  const candleRightRef = useRef<THREE.PointLight | null>(null);
  
  // Drag and parallax tracking
  const rotationTarget = useRef({ x: 0.12, y: -0.35 });
  const mouseParallax = useRef({ x: 0, y: 0 });
  const isPointerDown = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const rotationOnPointerDown = useRef({ x: 0.12, y: -0.35 });
  const idleTimer = useRef<number | null>(null);

  // Cinematic 3D entrance animation
  const playCinematicEntrance = useCallback(() => {
    if (!burgerGroupRef.current) return;
    const group = burgerGroupRef.current;

    // Kill existing tweens
    gsap.killTweensOf(group.position);
    gsap.killTweensOf(group.rotation);
    gsap.killTweensOf(group.scale);

    // Initial state: high above with dramatic tilt and scale
    group.position.y = 4.2;
    group.rotation.x = 0.55;
    group.rotation.y = rotationTarget.current.y - 1.8;
    group.rotation.z = -0.25;
    group.scale.set(0.65, 0.65, 0.65);

    // Timeline for cinematic slow-motion descent
    const tl = gsap.timeline();

    // 1. Stately 3D fall with smooth deceleration
    tl.to(group.position, {
      y: -0.05,
      duration: 1.5,
      ease: 'power2.out',
    }, 0);

    // 2. Unwind rotation smoothly into showcase angle
    tl.to(group.rotation, {
      x: rotationTarget.current.x,
      y: rotationTarget.current.y,
      z: 0,
      duration: 1.6,
      ease: 'power2.out',
    }, 0);

    // 3. Scale up to natural full 3D size
    tl.to(group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.4,
      ease: 'power1.out',
    }, 0);

    // 4. Soft cushioned landing squash and spring settle
    tl.to(group.scale, {
      x: 1.05,
      y: 0.94,
      z: 1.05,
      duration: 0.18,
      ease: 'power1.out',
    }, '-=0.18').to(group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.55,
      ease: 'elastic.out(1, 0.45)',
    });
  }, []);

  // Trigger cinematic entrance whenever replayTrigger updates
  useEffect(() => {
    if (isLoaded && replayTrigger > 0) {
      playCinematicEntrance();
    }
  }, [replayTrigger, isLoaded, playCinematicEntrance]);

  // Main Three.js initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 380;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 4.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Lighting matching Bohemian Evening Alcove
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 1.4);
    scene.add(ambientLight);

    // Key warm light from top wicker lamp
    const topLamp = new THREE.DirectionalLight(0xffb049, 3.2);
    topLamp.position.set(0.5, 4.5, 2.5);
    scene.add(topLamp);

    // Rim backlight for appetizing edge highlights
    const rimLight = new THREE.DirectionalLight(0xffd54f, 2.0);
    rimLight.position.set(-2, 3, -2);
    scene.add(rimLight);

    // Left Candle warm point light
    const candleLeft = new THREE.PointLight(0xff8f00, 2.4, 8);
    candleLeft.position.set(-2.2, -0.15, 1.2);
    scene.add(candleLeft);
    candleLeftRef.current = candleLeft;

    // Right Candle warm point light
    const candleRight = new THREE.PointLight(0xff8f00, 2.4, 8);
    candleRight.position.set(2.2, -0.15, 1.2);
    scene.add(candleRight);
    candleRightRef.current = candleRight;

    // 5. Burger group container
    const burgerGroup = new THREE.Group();
    scene.add(burgerGroup);
    burgerGroupRef.current = burgerGroup;

    // 6. Load 3D GLB Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/tripo-hamburgers_generated_by_ai.glb',
      (gltf) => {
        const model = gltf.scene;

        // Tune materials for gourmet glossy finish
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.42;
              mat.metalness = 0.04;
            }
          }
        });

        // Normalize model size and center bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.15 / maxDim;
        model.scale.setScalar(scale);

        // Center on pivot
        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale;
        model.position.z = -center.z * scale;

        burgerGroup.add(model);
        setIsLoaded(true);

        // Initial entrance
        playCinematicEntrance();
      },
      undefined,
      (err) => {
        console.error('Error loading 3D burger model:', err);
      }
    );

    // 7. Mouse / Touch Drag rotation handlers
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isPointerDown.current = true;
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerStart.current = { x: clientX, y: clientY };
      rotationOnPointerDown.current = { ...rotationTarget.current };

      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isPointerDown.current) {
        const deltaX = clientX - pointerStart.current.x;
        const deltaY = clientY - pointerStart.current.y;

        rotationTarget.current.y = rotationOnPointerDown.current.y + deltaX * 0.012;
        rotationTarget.current.x = THREE.MathUtils.clamp(
          rotationOnPointerDown.current.x + deltaY * 0.008,
          -0.35,
          0.6
        );
      } else if (!('touches' in e)) {
        // Subtle mouse parallax tilt when just hovering
        const rect = container.getBoundingClientRect();
        const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
        mouseParallax.current.x = nx * 0.18;
        mouseParallax.current.y = ny * 0.12;
      }
    };

    const onPointerUp = () => {
      isPointerDown.current = false;
      setIsDragging(false);

      // Reset auto-rotate after 3s of inactivity
      idleTimer.current = window.setTimeout(() => {
        setAutoRotate(true);
      }, 3500);
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 8. Responsive resize listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Flickering candle warmth
      if (candleLeftRef.current) {
        candleLeftRef.current.intensity = 2.4 + Math.sin(elapsedTime * 6.0) * 0.25;
      }
      if (candleRightRef.current) {
        candleRightRef.current.intensity = 2.4 + Math.cos(elapsedTime * 5.5) * 0.25;
      }

      if (burgerGroupRef.current) {
        const group = burgerGroupRef.current;

        // Auto turntable rotation when idle
        if (autoRotate && !isPointerDown.current) {
          rotationTarget.current.y += 0.0065;
        }

        // Smooth damping interpolation toward target rotation
        group.rotation.y += (rotationTarget.current.y + mouseParallax.current.x - group.rotation.y) * 0.08;
        group.rotation.x += (rotationTarget.current.x - mouseParallax.current.y - group.rotation.x) * 0.08;

        // Gentle floating hover breath (only when not in entrance animation)
        if (group.position.y <= 0.15 && group.position.y >= -0.15) {
          group.position.y = Math.sin(elapsedTime * 1.8) * 0.06 - 0.02;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [playCinematicEntrance, autoRotate]);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full h-[320px] sm:h-[370px] md:h-[410px] cursor-grab active:cursor-grabbing transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        title="اسحب بالماوس أو الإصبع لتدوير البرجر 360° ثلاثي الأبعاد"
      />

      {/* Loading state indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#8A9684]">
          <Sparkles className="w-8 h-8 animate-spin text-[#8A9684]" />
          <span className="text-xs font-bold tracking-wider text-[#F7F4EF]/90 font-mono">
            جاري تحميل مجسم البرجر 3D...
          </span>
        </div>
      )}

      {/* Floating 3D Contact Shadow beneath burger on table */}
      <div 
        className="absolute bottom-4 sm:bottom-6 w-[68%] sm:w-[62%] h-7 bg-black/85 rounded-[100%] blur-md pointer-events-none transition-transform duration-300"
        style={{
          transform: `scale(${isDragging ? 0.95 : 1})`,
        }}
      />


    </div>
  );
}
