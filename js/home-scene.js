// ================================================
// home-scene.js — Three.js scene for QUNOX home
// ES Module — import via type="module"
// ================================================

import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

export class QunoxScene {
  constructor(canvasId) {
    this.canvas     = document.getElementById(canvasId);
    this.clock      = new THREE.Clock();
    this.mouse      = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this._closingMode = false;
    this._distortion  = 0;

    this._initRenderer();
    this._initCamera();
    this._initScene();
    this._initLights();
    this._initMainObject();
    this._initParticles();
    this._initRings();
    this._bindEvents();
    this._tick();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1, 100
    );
    this.camera.position.set(0, 0, 5);
  }

  _initScene() {
    this.scene = new THREE.Scene();
  }

  _initLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const key = new THREE.DirectionalLight(0x4361EE, 2.0);
    key.position.set(-3, 4, 5);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x00B4D8, 0.8);
    fill.position.set(4, -2, 2);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0x7209B7, 0.6);
    rim.position.set(0, 0, -4);
    this.scene.add(rim);
  }

  _initMainObject() {
    const geo = new THREE.IcosahedronGeometry(1.6, 1);

    this.wireMat = new THREE.MeshBasicMaterial({
      color: 0x4361EE,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    this.wireframe = new THREE.Mesh(geo, this.wireMat);

    const solidMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03,
      roughness: 0.1,
      metalness: 0.8
    });
    this.solidMesh = new THREE.Mesh(geo, solidMat);

    this.mainObject = new THREE.Group();
    this.mainObject.add(this.wireframe);
    this.mainObject.add(this.solidMesh);
    this.scene.add(this.mainObject);

    // Store original positions for distortion
    const pos = geo.attributes.position;
    this._origPos = new Float32Array(pos.array);
  }

  _initParticles() {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0x4361EE),
      new THREE.Color(0x7209B7),
      new THREE.Color(0x00B4D8)
    ];

    for (let i = 0; i < count; i++) {
      const theta  = Math.random() * Math.PI * 2;
      const phi    = Math.acos(2 * Math.random() - 1);
      const radius = 2.2 + Math.random() * 1.2;

      positions[i*3]   = radius * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = radius * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    this.particleSystem = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    }));
    this.scene.add(this.particleSystem);
    this._particleOrigPos = positions.slice();
  }

  _initRings() {
    this.rings = [];
    const cfgs = [
      { r: 2.0, tube: 0.012, color: 0x4361EE, rx: 0,    rz: 0    },
      { r: 2.3, tube: 0.008, color: 0x00B4D8, rx: 1.1,  rz: 0.4  },
      { r: 2.6, tube: 0.006, color: 0x7209B7, rx: -0.5, rz: 1.0  }
    ];
    cfgs.forEach(c => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(c.r, c.tube, 8, 120),
        new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: 0.4 })
      );
      mesh.rotation.x = c.rx;
      mesh.rotation.z = c.rz;
      this.rings.push(mesh);
      this.scene.add(mesh);
    });
  }

  _bindEvents() {
    window.addEventListener('mousemove', e => {
      this.mouse.targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ── PUBLIC API ──────────────────────────────

  setCameraPush(progress) {
    this.camera.position.z = 5 + (1.5 - 5) * progress;
    this.camera.fov = 60 - progress * 15;
    this.camera.updateProjectionMatrix();
    this.wireMat.opacity = 0.5 - progress * 0.3;
    this.rings.forEach((r, i) => {
      r.scale.setScalar(1 + progress * (0.3 + i * 0.1));
      r.material.opacity = 0.4 - progress * 0.2;
    });
  }

  setDistortion(amount) {
    const pos = this.wireframe.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ox = this._origPos[i*3], oy = this._origPos[i*3+1], oz = this._origPos[i*3+2];
      const seed = (i * 9301 + 49297) % 233280;
      const rand = seed / 233280 - 0.5;
      pos.setXYZ(i,
        ox + rand * amount * 1.5,
        oy + rand * amount * 1.5,
        oz + rand * amount * 0.8
      );
    }
    pos.needsUpdate = true;
    this.wireMat.color.set(amount > 0.5 ? 0x7209B7 : 0x4361EE);
  }

  setServiceMode(idx) {
    const colors = [0x4361EE, 0x00B4D8, 0x7209B7, 0x4361EE, 0x00B4D8, 0x7209B7];
    this.setDistortion(0);
    const color = new THREE.Color(colors[idx]);
    this.rings[idx % 3].material.color.set(color);
    this.wireMat.color.set(color);
    this.wireMat.opacity = 0.35;
    this.camera.position.z = 4.5;
    this.camera.fov = 60;
    this.camera.updateProjectionMatrix();
  }

  setClosingMode() {
    this._closingMode = true;
    this.wireMat.opacity = 0.6;
    this.camera.position.z = 5;
    this.camera.fov = 60;
    this.camera.updateProjectionMatrix();
  }

  // ── ANIMATION LOOP ──────────────────────────

  _tick() {
    requestAnimationFrame(() => this._tick());
    const elapsed = this.clock.getElapsedTime();

    // Smooth mouse
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Main object rotation
    const speed = this._closingMode ? 0.0015 : 0.003;
    this.mainObject.rotation.y += speed + this.mouse.x * 0.001;
    this.mainObject.rotation.x += speed * 0.4 + this.mouse.y * 0.0008;

    // Rings
    const rSpeeds = [0.004, -0.003, 0.002];
    const rMult   = this._closingMode ? 0.3 : 1;
    this.rings.forEach((r, i) => {
      r.rotation.y += rSpeeds[i] * rMult;
      r.rotation.x += rSpeeds[i] * 0.5 * rMult;
    });

    // Particles orbit
    const pp = this.particleSystem.geometry.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const ox = this._particleOrigPos[i*3];
      const oy = this._particleOrigPos[i*3+1];
      const oz = this._particleOrigPos[i*3+2];
      const angle = elapsed * 0.08 + i * 0.15;
      pp.setXYZ(i,
        ox * Math.cos(angle * 0.2) - oz * Math.sin(angle * 0.2),
        oy + Math.sin(elapsed * 0.3 + i) * 0.02,
        ox * Math.sin(angle * 0.2) + oz * Math.cos(angle * 0.2)
      );
    }
    pp.needsUpdate = true;

    // Camera bob in hero
    if (!this._closingMode) {
      this.camera.position.y = Math.sin(elapsed * 0.4) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
