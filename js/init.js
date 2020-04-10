//web gl test
if (WEBGL.isWebGLAvailable() === false) {
    document.body.appendChild(WEBGL.getWebGLErrorMessage());
}

function setTheScene() {
    //setting the camera and scene
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-6, 2, -2.2);
    camera.lookAt(-2, 2, -2);

    scene = new THREE.Scene();
    controls = new THREE.OrbitControls(camera);
    controls.minDistance = 0.001;
    controls.maxDistance = 50.0;
    controls.maxPolarAngle = Math.PI;
    controls.minPolarAngle = 0;
    controls.target = new THREE.Vector3(-2, 2, -2);
    controls.update();

    //scene.fog = new THREE.FogExp2(0xf2ebc2, 0.002);
    //scene.background = new THREE.Color(0x87ceeb);

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

    ///SKYBOX
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load("./assets/img/posx.jpg");
    let texture_bk = new THREE.TextureLoader().load("./assets/img/negx.jpg");
    let texture_up = new THREE.TextureLoader().load("./assets/img/posy.jpg");
    let texture_dn = new THREE.TextureLoader().load("./assets/img/negy.jpg");
    let texture_rt = new THREE.TextureLoader().load("./assets/img/posz.jpg");
    let texture_lf = new THREE.TextureLoader().load("./assets/img/negz.jpg");

    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

    for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;
    let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);
    skybox.translateY(1);
    scene.add(skybox);

    //add floor

    /*const color = 0xfffff;
    const light = new THREE.DirectionalLight(color, 1);
    const fcolor = 0x7cfc00;

    const floor = new THREE.Mesh(
        new THREE.CircleBufferGeometry(15, 32),
        //new THREE.MeshStandardMaterial({ color: 0xf2ebc2, roughness: 4, metalness: 0 })
        new THREE.MeshPhongMaterial({
            fcolor,
            opacity: 0.5,
            transparent: true,
        })
    );
    floor.receiveShadow = enableShadow;
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);*/
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
