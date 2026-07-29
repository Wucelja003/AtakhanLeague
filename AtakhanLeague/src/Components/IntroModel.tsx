import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// The rigged Atakhan spawn, played inside the intro splash. Imported lazily by
// IntroSplash so three.js never lands in the main bundle — the splash renders
// from CSS alone and only upgrades to this if the model arrives in time.
//
// The GLB is meshopt-compressed with WebP textures (4.15 MB → 605 KB); its
// material is KHR_materials_unlit, so it needs no lights and reads flat, like
// the concept art.

type Props = {
  /** URL of the GLB. Passed in so IntroSplash can start the download itself,
   *  without importing this module (and three.js with it) up front. */
  src: string;
  /** Play the clip from `startAt`. Held on the first frame until this is true. */
  playing: boolean;
  /** Seconds into the clip to start from. */
  startAt?: number;
  /** Seconds to stop at. The source clip idles long after the spawn lands, and
   *  framing is measured over this range only — not the whole clip. */
  endAt?: number;
  /** Playback rate — the source clip is 8.33s, longer than the intro. */
  timeScale?: number;
  /** Degrees to turn the creature about its vertical axis. */
  yawDeg?: number;
  /** Replay the slice instead of holding the landed pose. The clip has no idle
   *  worth looping — its tail carries about 4% of the spawn's motion, which is
   *  the landing settling rather than the creature breathing — so keeping it
   *  alive means playing the whole thing again. */
  loop?: boolean;
  /** How long to sit on the landed pose before replaying. */
  loopHoldMs?: number;
  /** Fired once the model is loaded and the first frame is on screen. */
  onReady?: () => void;
  /** Fired if WebGL is unavailable or the model fails to load. */
  onFail?: () => void;
};

export default function IntroModel({
  src,
  playing,
  startAt = 0,
  endAt,
  timeScale = 1,
  yawDeg = 0,
  loop = false,
  loopHoldMs = 1400,
  onReady,
  onFail,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const yawRef = useRef(yawDeg);
  const srcRef = useRef(src);
  // Kept in refs so the setup effect can stay mount-only — re-running it would
  // rebuild the whole WebGL context.
  const startAtRef = useRef(startAt);
  const endAtRef = useRef(endAt);
  const playingRef = useRef(playing);
  const timeScaleRef = useRef(timeScale);
  const loopRef = useRef(loop);
  const loopHoldRef = useRef(loopHoldMs);
  // useRef seeds these with the first render's values; keep them in step from an
  // effect rather than during render, which isn't safe under concurrent
  // rendering. They're only read from the loader callback and the render loop,
  // long after mount effects have run.
  useEffect(() => {
    startAtRef.current = startAt;
    endAtRef.current = endAt;
    yawRef.current = yawDeg;
    playingRef.current = playing;
    timeScaleRef.current = timeScale;
    loopRef.current = loop;
    loopHoldRef.current = loopHoldMs;
  }, [startAt, endAt, yawDeg, playing, timeScale, loop, loopHoldMs]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let root: THREE.Object3D | null = null;

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      onFail?.();
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

    const size = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer!.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer!.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    renderer.setClearAlpha(0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    size();

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      srcRef.current,
      (gltf) => {
        if (disposed) return;
        root = gltf.scene;
        // Turned via a parent, not on the model itself: three applies rotation
        // before position, so spinning `root` directly would swing it around by
        // its own centring offset instead of in place. The pivot stays at
        // identity through the measuring below, then takes the yaw at the end.
        const pivot = new THREE.Group();
        pivot.add(root);
        scene.add(pivot);

        // Skinned meshes get their bounding volume from the bind pose. The
        // spawn clip throws the bones well outside it, so three culls the whole
        // creature and nothing draws. It's a single 14k-triangle model always
        // centred in frame — culling buys us nothing anyway.
        root.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) obj.frustumCulled = false;
        });

        const clip = gltf.animations[0];
        if (clip) {
          mixer = new THREE.AnimationMixer(root);
          const action = mixer.clipAction(clip);
          action.clampWhenFinished = true;
          action.setLoop(THREE.LoopOnce, 1);
          action.play();
          action.paused = true;
          action.time = startAtRef.current;
          actionRef.current = action;
          // Pose the rig at its final frame to measure the model at full size —
          // at frame 0 it has barely spawned, which would frame it far too close.
          mixer.setTime(clip.duration);
        }

        // Frame the model against the space the ANIMATION actually uses. A
        // Box3 of the bind pose is useless here: the spawn rears far outside it,
        // and Box3 can't see GPU skinning anyway. Sampling bone positions across
        // the clip gives the real extent.
        const skinned: THREE.SkinnedMesh[] = [];
        root.traverse((obj) => {
          if ((obj as THREE.SkinnedMesh).isSkinnedMesh) skinned.push(obj as THREE.SkinnedMesh);
        });

        // Measure the pose it SETTLES into, not the union of the whole clip.
        // The spawn sweeps through roughly three times that volume on its way
        // up, and framing for all of it would leave the creature a speck. Sized
        // to the landing, it climbs up into frame from below — which is the
        // shot we want anyway.
        const box = new THREE.Box3();
        if (mixer && clip && skinned.length) {
          const to = Math.min(endAtRef.current ?? clip.duration, clip.duration);
          const point = new THREE.Vector3();
          for (let i = 0; i <= 4; i++) {
            actionRef.current!.time = Math.max(0, to - 0.3 + (i / 4) * 0.3);
            mixer.update(0);
            root.updateMatrixWorld(true);
            for (const mesh of skinned) {
              for (const bone of mesh.skeleton.bones) {
                point.setFromMatrixPosition(bone.matrixWorld);
                box.expandByPoint(point);
              }
            }
          }
        }
        if (box.isEmpty()) box.setFromObject(root);

        const span = new THREE.Vector3();
        const centre = new THREE.Vector3();
        box.getSize(span);
        box.getCenter(centre);
        // Seat it on the ground from the RAW bone box. Padding the box first
        // would lift the creature off the floor by the padding amount.
        root.position.set(-centre.x, -box.min.y, -centre.z);
        // Now that it's centred, turn it to face the camera the way we want.
        pivot.rotation.y = (yawRef.current * Math.PI) / 180;

        // Pad only the framing: bones sit inside the silhouette, and the cloth
        // and tendrils reach well past them.
        const height = Math.max(span.y, span.x * 0.75) * 1.35 || 1;
        const distance = ((height / 2) / Math.tan((camera.fov * Math.PI) / 360)) * 1.1;
        camera.position.set(0, span.y * 0.55, distance);
        camera.lookAt(0, span.y * 0.42, 0);
        // Authored in game units — hundreds across — so the default 0.1/100 clip
        // range would leave the whole creature past the far plane, drawing
        // nothing. Derive the range from the framing distance instead.
        camera.near = distance / 100;
        camera.far = distance * 10;
        camera.updateProjectionMatrix();

        if (mixer) mixer.setTime(startAtRef.current);

        // Apply the CURRENT play state now the action finally exists. The
        // effect below can't do it: it only fires when `playing` changes, and a
        // caller that mounts with playing already true — like the Introduce
        // section — never changes it, so the clip would sit paused on frame 0
        // for good. The splash only worked because it flips false → true after
        // the model has loaded.
        const action = actionRef.current;
        if (action) {
          action.timeScale = timeScaleRef.current;
          action.paused = !playingRef.current;
        }

        renderer!.render(scene, camera);
        onReady?.();
      },
      undefined,
      () => {
        if (!disposed) onFail?.();
      }
    );

    // Don't burn GPU on a canvas nobody is looking at. Matters for the in-page
    // use, which can sit scrolled off screen for the rest of the session; the
    // splash is always in view, so this never trips there.
    let onScreen = true;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    visibility.observe(host);

    // Set when the landed pose starts being held, cleared when it restarts.
    let holdUntil = 0;
    let last = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!onScreen || document.hidden) {
        // Keep the clock with it, or it resumes with one huge delta and skips
        // most of the animation.
        last = now;
        return;
      }
      const delta = (now - last) / 1000;
      last = now;
      if (mixer) mixer.update(delta);
      // Stop at the end of the slice rather than drifting on into the idle the
      // source clip tails off with. Wrapping happens here rather than through
      // THREE.LoopRepeat because that would loop the whole 8.33s clip, dead
      // tail and all.
      const action = actionRef.current;
      const stop = endAtRef.current;
      if (action && stop != null && action.time >= stop) {
        if (!loopRef.current) {
          action.time = stop;
          action.paused = true;
        } else if (!holdUntil) {
          // Sit on the landed pose for a beat first — cutting straight back to
          // an empty frame reads as a glitch rather than a loop.
          action.time = stop;
          action.paused = true;
          holdUntil = now + loopHoldRef.current;
        } else if (now >= holdUntil) {
          holdUntil = 0;
          action.time = startAtRef.current;
          action.paused = false;
        }
      }
      renderer!.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);

    const onResize = () => size();
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      visibility.disconnect();
      window.removeEventListener('resize', onResize);
      mixer?.stopAllAction();
      // Release GPU memory explicitly — the splash unmounts for good, and a
      // dropped context here would leak for the rest of the session.
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[];
        for (const m of Array.isArray(material) ? material : [material]) {
          if (!m) continue;
          for (const value of Object.values(m)) {
            if (value instanceof THREE.Texture) value.dispose();
          }
          m.dispose();
        }
      });
      renderer?.dispose();
      renderer?.domElement.remove();
    };
    // Mount-only: rebuilding the renderer on prop changes would drop the context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Release the clip at its cue.
  useEffect(() => {
    const action = actionRef.current;
    if (!action) return;
    action.timeScale = timeScale;
    action.paused = !playing;
  }, [playing, timeScale]);

  return <div ref={hostRef} className="h-full w-full" />;
}
