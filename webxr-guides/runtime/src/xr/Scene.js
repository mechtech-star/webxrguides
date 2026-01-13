export default class Scene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.setup();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 0);
    return camera;
  }

  setup() {
    this.scene.background = new THREE.Color(0x222222);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -1;
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(3);
    this.scene.add(axesHelper);
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }
}
