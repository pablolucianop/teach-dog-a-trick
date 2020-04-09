//web gl test
if (WEBGL.isWebGLAvailable() === false) {
    document.body.appendChild(WEBGL.getWebGLErrorMessage());
}

function setTheScene() {
    //setting the camera and scene
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-2.46, 1.13, 1.47);
    camera.lookAt(0, 0, 0);
    new THREE.OrbitControls(camera);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf2ebc2, 0.02);

    //Lights
    //add ambient light
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.7);
    scene.add(ambientLight);

    // directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 20, 20);
    directionalLight.castShadow = enableShadow;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.camera.left = -40;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.right = 40;
    scene.add(directionalLight);

    //add floor
    const floor = new THREE.Mesh(
        new THREE.CircleBufferGeometry(100, 32),
        new THREE.MeshStandardMaterial({ color: 0xf2ebc2, roughness: 1, metalness: 0 })
    );
    floor.receiveShadow = enableShadow;
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
}

function bringTheDogToScene() {
    // Loading collada dog model
    const loadingManager = new THREE.LoadingManager();
    const loader = new THREE.ColladaLoader(loadingManager);
    dogPivot = new THREE.Group();
    loader.load("./assets/models/dog6.dae", function (collada) {
        const dogModel = collada.scene;
        dogModel.traverse((obj) => {
            if (obj.isMesh) {
                obj.castShadow = enableShadow;
                obj.receiveShadow = enableShadow;
            }
        });
        dogModel.rotation.y = Math.PI / 2;
        dogPivot.add(dogModel);
        scene.add(dogPivot);
        loadingManager.onLoad = function () {
            animate();
            RESOURCES_LOADED = true;
        };
    });

    //and his ball!
    ball = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.05),
        new THREE.MeshStandardMaterial({ color: "darkred", roughness: 0.4, metalness: 0 })
    );
    scene.add(ball);
    ballMoving = false;
    ballVelocity = new THREE.Vector3();
}
