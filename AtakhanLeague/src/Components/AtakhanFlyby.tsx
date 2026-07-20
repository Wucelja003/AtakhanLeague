import { useEffect, useRef } from 'react';

type Props = {
  className?: string;
  /** How fast the model crosses the screen. Higher = faster. */
  speed?: number;
  /** CSS height of the canvas wrapper. */
  height?: string;
  /** Target size of the model's largest dimension, in world units. Smaller = smaller model on screen. */
  modelSize?: number;
  /** Fixed facing (radians around Y). The model does NOT spin. */
  facing?: number;
  /** Vertical position in world units. Positive = higher, negative = lower. */
  yOffset?: number;
};

/**
 * AtakhanFlyby — loads /public/atakhan.glb, plays its baked animation, and
 * flies the model across the viewport from left to right on a loop.
 * Self-contained three.js (no R3F). Auto-centers + auto-scales the model so we
 * never have to guess the raw units. Lazy-imports three so it stays out of the
 * main bundle; pauses off-screen / when the tab is hidden; respects
 * reduced-motion; fails soft if WebGL is unavailable.
 */
export default function AtakhanFlyby({
  className = '',
  speed = 0.18,
  height = '100%',
  modelSize = 2.4,
  facing = Math.PI / 2, // full right-facing profile — leads with the head, wings trailing
  yOffset = -1.2, // sit low in the band
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const runningRef = useRef(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frameId = 0;
    let renderer: any, scene: any, camera: any, mixer: any, group: any;
    let travelHalf = 4;
    let t = 0;
    let last = performance.now();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      let THREE: any, GLTFLoader: any, RoomEnvironment: any;
      try {
        THREE = await import('three');
        ({ GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js'));
        ({ RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js'));
      } catch {
        return;
      }
      if (disposed) return;

      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;

      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
      } catch {
        return; // no WebGL → leave the area empty
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.6;
      mount.appendChild(renderer.domElement);

      scene = new THREE.Scene();

      // Neutral studio env so PBR/metallic surfaces read on a dark background.
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 1.3;

      camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0, 4);
      camera.lookAt(0, 0, 0);

      // Bright neutral key from the camera side so the body reads clearly,
      // plus a subtle crimson rim for mood.
      scene.add(new THREE.AmbientLight(0xffffff, 0.95));
      const key = new THREE.DirectionalLight(0xffffff, 3.8);
      key.position.set(1, 3, 6);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 1.6);
      fill.position.set(-4, 1, 4);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xff2b3d, 1.6);
      rim.position.set(-4, 2, -3);
      scene.add(rim);

      const loader = new GLTFLoader();
      loader.load(
        '/atakhan.glb',
        (gltf: any) => {
          if (disposed) return;
          const model = gltf.scene;

          // Center at origin, then scale so the largest dimension ≈ 2.2 units.
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = modelSize / maxDim;
          model.position.sub(center);

          group = new THREE.Group();
          group.add(model);
          group.scale.setScalar(scale);
          group.rotation.y = facing; // fixed orientation — no spinning
          group.position.y = yOffset;
          scene.add(group);

          // Off-screen travel distance: half the frustum width at z=0 + model half-width.
          const vpHalfW = Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z * camera.aspect;
          travelHalf = vpHalfW + (size.x * scale) / 2 + 0.6;

          if (gltf.animations?.length) {
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(gltf.animations[0]).play();
          }
        },
        undefined,
        () => {
          /* load failed — leave the area empty */
        },
      );

      last = performance.now();
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (!runningRef.current) return;

        if (mixer) mixer.update(dt);
        if (group) {
          if (!prefersReduced) {
            t += dt * speed;
            if (t > 1) t -= 1;
          }
          group.position.x = -travelHalf + t * travelHalf * 2;
          // fixed vertical position + facing — the model glides straight across, no wobble/spin
        }
        renderer.render(scene, camera);
      };
      animate();
    })();

    const onResize = () => {
      if (!renderer || !camera || !mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const io = new IntersectionObserver(
      ([entry]) => {
        runningRef.current = entry.isIntersecting;
        last = performance.now(); // avoid a dt jump on resume
      },
      { threshold: 0.01 },
    );
    io.observe(mount);

    const onVis = () => {
      if (document.hidden) runningRef.current = false;
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
      if (mixer) mixer.stopAllAction();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [speed]);

  return <div ref={mountRef} className={className} style={{ width: '100%', height }} />;
}
