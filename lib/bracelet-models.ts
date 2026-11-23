import * as THREE from "three";
export type BraceletDesign =
  | "black-detail"
  | "brown-strands"
  | "silver-cord"
  | "tiger-eye";
const TAU = Math.PI * 2;
function tube(
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material,
  closed = false,
  segments = 160,
) {
  const curve = new THREE.CatmullRomCurve3(points, closed, "centripetal");
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, segments, radius, 7, closed),
    material,
  );
}
function ring(
  radius: number,
  z: number,
  thickness: number,
  material: THREE.Material,
  start = 0,
  end = TAU,
) {
  const points = Array.from({ length: 97 }, (_, i) => {
    const a = start + ((end - start) * i) / 96;
    return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, z);
  });
  return tube(points, thickness, material, end - start >= TAU - 0.001);
}
function knot(
  group: THREE.Group,
  x: number,
  y: number,
  material: THREE.Material,
  size = 0.045,
) {
  for (let i = 0; i < 6; i++) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(size, size * 0.32, 6, 12),
      material,
    );
    r.rotation.y = Math.PI / 2;
    r.position.set(x + (i - 2.5) * size * 0.43, y, 0);
    group.add(r);
  }
}
function tails(
  group: THREE.Group,
  material: THREE.Material,
  thickness = 0.017,
) {
  group.add(
    tube(
      [
        new THREE.Vector3(-0.12, -0.99, 0),
        new THREE.Vector3(-0.23, -1.18, 0.01),
        new THREE.Vector3(-0.38, -1.43, 0.05),
        new THREE.Vector3(-0.31, -1.59, 0.02),
      ],
      thickness,
      material,
    ),
  );
  group.add(
    tube(
      [
        new THREE.Vector3(0.1, -1, 0),
        new THREE.Vector3(0.26, -1.2, 0.06),
        new THREE.Vector3(0.19, -1.5, 0.07),
        new THREE.Vector3(0.3, -1.7, 0.02),
      ],
      thickness,
      material,
    ),
  );
  knot(group, -0.32, -1.54, material, thickness * 1.5);
  knot(group, 0.26, -1.65, material, thickness * 1.5);
}
function fiber(
  group: THREE.Group,
  radius: number,
  z: number,
  material: THREE.Material,
  phase = 0,
) {
  const points = Array.from({ length: 481 }, (_, i) => {
    const a = (i / 480) * TAU;
    const ripple = Math.cos(a * 90 + phase) * 0.007;
    return new THREE.Vector3(
      Math.cos(a) * (radius + ripple),
      Math.sin(a) * (radius + ripple),
      z + Math.sin(a * 90 + phase) * 0.009,
    );
  });
  group.add(tube(points, 0.0026, material, true, 480));
}
/** Independent reconstructions from two reference views, not scans or claims of hidden-detail accuracy. */
export function createBracelet(design: BraceletDesign): THREE.Group {
  const group = new THREE.Group();
  group.name = design;
  const black = new THREE.MeshStandardMaterial({
    color: "#24211e",
    roughness: 0.94,
  });
  const brown = new THREE.MeshStandardMaterial({
    color: "#5d4130",
    roughness: 1,
  });
  const fiberMat = new THREE.MeshStandardMaterial({
    color: design === "brown-strands" ? "#8b6c50" : "#524b3c",
    roughness: 1,
  });
  const silver = new THREE.MeshPhysicalMaterial({
    color: "#bcbeb6",
    metalness: 0.92,
    roughness: 0.24,
    clearcoat: 0.35,
  });
  if (design === "black-detail") {
    group.add(ring(1, 0, 0.024, black));
    fiber(group, 1, 0, fiberMat);
    const metal = new THREE.Mesh(
      new THREE.BoxGeometry(0.31, 0.075, 0.06, 3, 1, 1),
      silver,
    );
    metal.position.set(0, 1, 0.014);
    group.add(metal);
    for (const x of [-0.2, 0.2]) knot(group, x, 0.98, black, 0.035);
    knot(group, 0, -1, black, 0.04);
    tails(group, black, 0.014);
  } else if (design === "brown-strands") {
    for (let i = 0; i < 6; i++) {
      const radius = 0.96 + i * 0.014,
        z = (i - 2.5) * 0.016;
      group.add(ring(radius, z, 0.014, brown));
      fiber(group, radius, z, fiberMat, i * 0.8);
    }
    knot(group, 0, -1, brown, 0.065);
    tails(group, brown, 0.025);
  } else if (design === "silver-cord") {
    group.add(ring(1, 0, 0.028, black, Math.PI * 0.71, Math.PI * 2.29));
    group.add(ring(1, 0, 0.037, silver, Math.PI * 0.29, Math.PI * 0.71));
    for (const a of [Math.PI * 0.29, Math.PI * 0.71]) {
      const end = new THREE.Mesh(
        new THREE.SphereGeometry(0.046, 12, 8),
        silver,
      );
      end.position.set(Math.cos(a), Math.sin(a), 0);
      group.add(end);
    }
    fiber(group, 1, 0, fiberMat);
    knot(group, 0, -1, black, 0.044);
    tails(group, black, 0.018);
  } else {
    const gold = new THREE.MeshStandardMaterial({
      color: "#554023",
      roughness: 0.88,
    });
    group.add(ring(0.96, 0, 0.035, gold));
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * TAU;
      const geometry = new THREE.SphereGeometry(0.153, 40, 28);
      const positions = geometry.getAttribute("position");
      const colors = [];
      const dark = new THREE.Color("#271c0e"),
        amber = new THREE.Color("#8d5e20"),
        highlight = new THREE.Color("#bd9445");
      for (let v = 0; v < positions.count; v++) {
        const y = positions.getY(v),
          z = positions.getZ(v),
          x = positions.getX(v);
        const phase =
          y * 19 + Math.sin(z * 17 + i * 0.8) * 0.35 + x * 1.5 + i * 1.6;
        const band = (Math.sin(phase * 2.9) * 0.5 + 0.5) ** 3;
        const sheen = Math.max(0, 1 - Math.abs(y / 0.153 - 0.17) * 3) * 0.4;
        const c = dark
          .clone()
          .lerp(amber, band * 0.9 + 0.12)
          .lerp(highlight, sheen);
        colors.push(c.r, c.g, c.b);
      }
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );
      const mat = new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.36,
        metalness: 0,
        clearcoat: 0.65,
        clearcoatRoughness: 0.16,
      });
      const bead = new THREE.Mesh(geometry, mat);
      bead.position.set(Math.cos(angle) * 0.96, Math.sin(angle) * 0.96, 0);
      bead.rotation.set(i * 0.31, i * 0.7, i * 0.5);
      group.add(bead);
      const knotAngle = angle + TAU / 36;
      const wrap = new THREE.Mesh(
        new THREE.TorusGeometry(0.055, 0.016, 6, 12),
        gold,
      );
      wrap.position.set(
        Math.cos(knotAngle) * 0.96,
        Math.sin(knotAngle) * 0.96,
        0,
      );
      wrap.rotation.y = Math.PI / 2;
      wrap.rotation.z = knotAngle;
      group.add(wrap);
    }
    knot(group, 0, -1.02, gold, 0.06);
    tails(group, gold, 0.026);
  }
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return group;
}
