"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { asset } from "@/lib/assets";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
type Props = {
  modelPath: string;
  title: string;
};
/** Loaded only after an explicit inspection request; the main story never owns a WebGL context. */
export function Bracelet3DViewer({ modelPath, title }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<{
    rotate: (angle: number) => void;
    zoom: (scale: number) => void;
    reset: () => void;
  } | null>(null);
  const [phase, setPhase] = useState<
    "loading" | "ready" | "fallback" | "error"
  >("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!host.current) return;
    setPhase("loading");
    const target = host.current;
    let alive = true;
    const canvas = document.createElement("canvas");
    let context: WebGL2RenderingContext | null = null;
    try {
      context = canvas.getContext("webgl2", { alpha: true, antialias: true });
    } catch {
      /* Supported fallback below. */
    }
    if (!context) {
      setPhase("fallback");
      return;
    }
    const renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
    camera.position.set(0.2, -0.8, 5.8);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04, 0.1, 100, { size: 128 });
    scene.environment = env.texture;
    scene.environmentIntensity = 0.65;
    room.dispose();
    pmrem.dispose();
    const light = new THREE.DirectionalLight("#fff2db", 2);
    light.position.set(-3, 4, 6);
    light.castShadow = true;
    light.shadow.mapSize.set(512, 512);
    light.shadow.camera.left = -3;
    light.shadow.camera.right = 3;
    light.shadow.camera.top = 3;
    light.shadow.camera.bottom = -3;
    light.shadow.bias = -0.001;
    light.shadow.normalBias = 0.02;
    light.shadow.radius = 4;
    scene.add(light, new THREE.HemisphereLight("#fff6e4", "#82664a", 0.8));
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ opacity: 0.13 }),
    );
    shadowPlane.position.z = -1.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 9;
    controls.target.set(0, -0.15, 0);
    controls.update();
    let model: THREE.Group | undefined;
    const render = () => {
      if (alive) renderer.render(scene, camera);
    };
    controls.addEventListener("change", render);
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      `${title} \u0628\u0627 \u06A9\u0634\u06CC\u062F\u0646 \u06CC\u0627 \u06A9\u0644\u06CC\u062F\u0647\u0627\u06CC \u062C\u0647\u062A \u0628\u0686\u0631\u062E\u0627\u0646\u06CC\u062F`,
    );
    const onKey = (e: KeyboardEvent) => {
      if (!model) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowLeft") model.rotation.y -= 0.15;
        if (e.key === "ArrowRight") model.rotation.y += 0.15;
        if (e.key === "ArrowUp") model.rotation.x -= 0.15;
        if (e.key === "ArrowDown") model.rotation.x += 0.15;
        render();
      }
    };
    canvas.addEventListener("keydown", onKey);
    const resize = () => {
      const width = target.clientWidth,
        height = target.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(target);
    target.appendChild(canvas);
    resize();
    const disposeObject = (object: THREE.Object3D) =>
      object.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();
          const materials = Array.isArray(node.material)
            ? node.material
            : [node.material];
          materials.forEach((material) => {
            Object.values(material).forEach((v) => {
              if (v instanceof THREE.Texture) v.dispose();
            });
            material.dispose();
          });
        }
      });
    const loader = new GLTFLoader();
    loader.load(
      asset(modelPath),
      (gltf) => {
        if (!alive) {
          disposeObject(gltf.scene);
          return;
        }
        model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.rotation.set(-0.14, -0.12, -0.16);
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        scene.add(model);
        render();
        setPhase("ready");
        controlsRef.current = {
          rotate: (angle) => {
            if (model) model.rotation.y += angle;
            render();
          },
          zoom: (scale) => {
            camera.position.multiplyScalar(scale);
            controls.update();
            render();
          },
          reset: () => {
            controls.reset();
            model?.rotation.set(-0.14, -0.12, -0.16);
            render();
          },
        };
      },
      undefined,
      () => {
        if (alive) setPhase("error");
      },
    );
    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (alive) setPhase("fallback");
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    return () => {
      alive = false;
      observer.disconnect();
      controls.dispose();
      canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      controlsRef.current = null;
      disposeObject(scene);
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [modelPath, title, retry]);
  return (
    <div className="object-viewer" data-phase={phase}>
      <div className="object-canvas" ref={host} />
      {phase === "loading" && (
        <div className="viewer-state" role="status">
          در حال آمادهکردن یادگاری…
        </div>
      )}
      {phase === "fallback" && (
        <div className="viewer-state">
          <p>نمایش سه بعدی در این مرورگر در دسترس نیست</p>
          <p>
            میتوانی عکس اصلی یا نمای ثابت یادگاری را ببینی و خواندن دفتر را
            ادامه بدهی
          </p>
        </div>
      )}
      {phase === "error" && (
        <div className="viewer-state">
          <p>مدل بارگذاری نشد</p>
          <button
            className="text-button"
            onClick={() => setRetry((v) => v + 1)}
          >
            تلاش دوباره
          </button>
        </div>
      )}
      {phase === "ready" && (
        <>
          <p className="viewer-hint">
            برای چرخاندن بکش یا از کلیدهای جهت استفاده کن
          </p>
          <div className="object-controls">
            <button
              className="icon-button"
              onClick={() => controlsRef.current?.rotate(-0.25)}
              aria-label="چرخش به چپ"
            >
              <RotateCcw />
            </button>
            <button
              className="icon-button"
              onClick={() => controlsRef.current?.rotate(0.25)}
              aria-label="چرخش به راست"
            >
              <RotateCw />
            </button>
            <button
              className="icon-button"
              onClick={() => controlsRef.current?.zoom(0.9)}
              aria-label="نزدیکتر"
            >
              <ZoomIn />
            </button>
            <button
              className="icon-button"
              onClick={() => controlsRef.current?.zoom(1.1)}
              aria-label="دورتر"
            >
              <ZoomOut />
            </button>
            <button
              className="text-button"
              onClick={() => controlsRef.current?.reset()}
            >
              نمای اول
            </button>
          </div>
        </>
      )}
    </div>
  );
}
export function BagPin3DViewer(props: Props) {
  return <Bracelet3DViewer {...props} />;
}
