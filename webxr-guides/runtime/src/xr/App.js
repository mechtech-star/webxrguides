import Scene from '../xr/Scene.js';

export default class App {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.xrSession = null;
  }

  async start() {
    this.setupRenderer();
    this.setupScene();
    this.createXRButton();
    this.startRenderLoop();
    this.setupWindowResize();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    document.body.appendChild(this.renderer.domElement);
  }

  setupScene() {
    this.scene = new Scene();
    this.camera = this.scene.getCamera();
  }

  createXRButton() {
    const button = document.createElement('button');
    button.textContent = 'Enter XR';
    button.style.position = 'absolute';
    button.style.top = '20px';
    button.style.right = '20px';
    button.style.padding = '12px 24px';
    button.style.fontSize = '16px';
    button.style.fontWeight = 'bold';
    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';
    button.style.backgroundColor = '#0078d4';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';

    button.addEventListener('click', () => this.enterXR());
    document.body.appendChild(button);
  }

  async enterXR() {
    if (!navigator.xr) {
      console.error('WebXR not supported');
      return;
    }

    try {
      console.log('Requesting immersive-vr session');

      const sessionInit = {
        optionalFeatures: []
      };

      // Try local-floor first (Quest)
      if (await navigator.xr.isSessionSupported('immersive-vr')) {
        sessionInit.optionalFeatures.push('local-floor');
      }

      // Fallbacks for emulator / desktop
      sessionInit.optionalFeatures.push('local');

      const session = await navigator.xr.requestSession(
        'immersive-vr',
        sessionInit
      );

      console.log('XR session started', session);

      this.renderer.xr.setSession(session);

    } catch (error) {
      console.error('XR session failed', error);
    }
  }

  startRenderLoop() {
    this.renderer.setAnimationLoop((time, frame) => {
      this.renderer.render(this.scene.getScene(), this.camera);
    });
  }

  setupWindowResize() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }
}
