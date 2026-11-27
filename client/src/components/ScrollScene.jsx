import { useEffect, useRef } from "react";
import * as THREE from "three";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

// Fixed WebGL canvas behind the page. Product photos hang along the page length.
// While you scroll, each photo flies in from a scattered, spinning state and settles
// into its place when it reaches the middle of the screen, then drifts away again.
export default function ScrollScene({ images = [] }) {
  const mount = useRef(null);

  useEffect(() => {
    if (!images.length) return;
    const el = mount.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // no WebGL: the page still works without the 3D layer
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 8;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const geoPhoto = new THREE.PlaneGeometry(1.5, 2);
    const geoFrame = new THREE.PlaneGeometry(1.62, 2.12);
    const textures = [];

    const items = images.slice(0, 8).map((src, i) => {
      const side = i % 2 ? 1 : -1;
      const photoMat = new THREE.MeshBasicMaterial({ color: 0x3a4526, transparent: true, depthWrite: false });
      const frameMat = new THREE.MeshBasicMaterial({ color: 0xc3d08a, transparent: true, depthWrite: false });
      const frame = new THREE.Mesh(geoFrame, frameMat);
      const photo = new THREE.Mesh(geoPhoto, photoMat);
      photo.position.z = 0.01;
      const group = new THREE.Group();
      group.add(frame, photo);
      scene.add(group);

      loader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        // crop the photo to fill the 3:4 card
        const ar = tex.image.width / tex.image.height;
        if (ar > 0.75) { tex.repeat.x = 0.75 / ar; tex.offset.x = (1 - tex.repeat.x) / 2; }
        else { tex.repeat.y = ar / 0.75; tex.offset.y = (1 - tex.repeat.y) / 2; }
        photoMat.map = tex;
        photoMat.color.set(0xffffff);
        photoMat.needsUpdate = true;
        textures.push(tex);
      });

      return {
        group, photoMat, frameMat, side, i,
        // scattered start state (relative to the settled place)
        off: { x: side * (2.5 + (i % 3)), y: (i % 2 ? 1 : -1) * 2.2, z: -5 - (i % 3),
               rx: (i % 2 ? 1 : -1) * 1.2, ry: side * 2.4, rz: ((i % 3) - 1) * 0.8 },
        home: { x: 0, y: 0, z: 0, s: 1 },
        cur: null,
      };
    });

    let visH = 1, visW = 1, unit = 1, docH = 1, mobile = false;

    const layout = () => {
      const n = items.length;
      items.forEach((it, i) => {
        const frac = 0.1 + 0.82 * (i / Math.max(1, n - 1)); // where on the page this photo belongs
        it.home.y = -(frac * docH) * unit;
        it.home.x = it.side * visW * (mobile ? 0.34 : 0.37);
        it.home.z = ((i % 3) - 1) * 0.6;
        it.home.s = mobile ? 0.62 : 1;
      });
    };

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      visW = visH * camera.aspect;
      unit = visH / h;
      mobile = w < 768;
      docH = document.documentElement.scrollHeight;
      layout();
    };
    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize); // page height changes (images load, filters)
    ro.observe(document.body);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    let raf;
    const clock = new THREE.Clock();
    const tick = () => {
      const time = clock.getElapsedTime();
      const camY = -(window.scrollY + window.innerHeight / 2) * unit;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      camera.position.set(mouse.x * 0.3, camY - mouse.y * 0.2, 8);
      camera.lookAt(0, camY, 0);

      items.forEach((it) => {
        // t = 0 far from the middle of the screen, 1 when the photo is settled in the middle
        const d = Math.abs(it.home.y - camY) / (visH * 0.8);
        const t = reduced ? 1 : smooth(clamp(1 - d, 0, 1));
        const k = 1 - t;
        const tg = {
          x: it.home.x + it.off.x * k,
          y: it.home.y + it.off.y * k + Math.sin(time * 0.8 + it.i) * 0.08,
          z: it.home.z + it.off.z * k,
          rx: it.off.rx * k,
          ry: -it.side * 0.35 + it.off.ry * k,
          rz: it.off.rz * k,
          o: (mobile ? 0.38 : 0.62) * (0.1 + 0.9 * t),
        };
        if (!it.cur) it.cur = { ...tg };
        for (const key in tg) it.cur[key] += (tg[key] - it.cur[key]) * 0.07;
        const c = it.cur;
        it.group.position.set(c.x, c.y, c.z);
        it.group.rotation.set(c.rx, c.ry, c.rz);
        it.group.scale.setScalar(it.home.s);
        it.photoMat.opacity = c.o;
        it.frameMat.opacity = c.o * 0.35;
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      ro.disconnect();
      geoPhoto.dispose();
      geoFrame.dispose();
      items.forEach((it) => { it.photoMat.dispose(); it.frameMat.dispose(); });
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [images.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="scroll-scene" ref={mount} aria-hidden="true" />;
}
