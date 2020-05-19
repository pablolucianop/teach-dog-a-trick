//three vars
let camera, scene, renderer, stats;
const clock = new THREE.Clock();
const loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera()
};

//fetch related vars
let dogPivot,
    dogState = "idle",
    lerp = 0,
    ball,
    ballMoving,
    ballVelocity;

const tempQuaternion = new THREE.Quaternion();
const tempVector = new THREE.Vector3();
const zAxis = new THREE.Vector3(0, 0, 1);

let RESOURCES_LOADED = false;
let enableShadow = false;
let frame = 0;
let dimmer = 1;
let delta;

init();

function init() {
    const container = document.getElementById("content-container");
    const footer = document.getElementById("footer");
    setTheScene();
    bringTheDogToScene();

    //set the render
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf2ebc2, 1);
    renderer.shadowMap.enabled = enableShadow;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    //stats FPS
    //stats = new Stats();
    //footer.appendChild(stats.dom);

    window.addEventListener("resize", onWindowResize, false);

    function ven() {
        if (dogState !== "idle") return;
        dogState = "coming";
    }

    function payRespects() {
        if (dogState !== "idle") return;
        dogState = "playingDead";

        let dogBoundingBox = new THREE.Box3().setFromObject(dogPivot);
        let halfDogWidth = (Math.abs(dogBoundingBox.min.x) + Math.abs(dogBoundingBox.max.x)) / 2;

        let fromPosition = { angle: dogPivot.rotation.z, posY: 0 };
        let toPosition = { angle: dogPivot.rotation.z - Math.PI * 0.48, posY: halfDogWidth - 0.09 }; // .09 to account for a bit of head movement

        let fallTween = new TWEEN.Tween(fromPosition)
            .to(toPosition, 2000)
            .easing(TWEEN.Easing.Bounce.Out)
            .onUpdate(function() {
                dogPivot.rotation.z = fromPosition.angle;
                dogPivot.position.y = fromPosition.posY;
            })
            .onComplete(function() {
                setTimeout(function() {
                    // dogPivot.rotation.z = 0;
                    // dogPivot.position.y = 0;
                    getUp();
                }, 1000);
                setTimeout(function() {
                    // dogState = "idle";
                }, 2000);
            })
            .start();
    }

    document.getElementById("deadButton").addEventListener("click", function() {
        payRespects();
    });
    document.getElementById("deadButton").addEventListener("touchstart", function() {
        payRespects();
    });
    document.getElementById("comeButton").addEventListener("click", function() {
        ven();
    });
    document.getElementById("comeButton").addEventListener("touchstart", function() {
        ven();
    });
    function getUp() {
        // if (dogState !== "idle") return;

        let dogBoundingBox = new THREE.Box3().setFromObject(dogPivot);
        let halfDogWidth = (Math.abs(dogBoundingBox.min.x) + Math.abs(dogBoundingBox.max.x)) / 2;

        let fromPosition = { angle: dogPivot.rotation.z, posY: dogPivot.position.y };
        let toPosition = { angle: dogPivot.rotation.z - Math.PI * 1.52, posY: 0 }; // .09 to account for a bit of head movement

        let fallTween = new TWEEN.Tween(fromPosition)
            .to(toPosition, 2000)
            .easing(TWEEN.Easing.Quadratic.In)
            .onUpdate(function() {
                dogPivot.rotation.z = fromPosition.angle;
                dogPivot.position.y = fromPosition.posY;
            })
            .onComplete(function() {
                setTimeout(function() {
                    dogPivot.rotation.z = 0;
                    dogPivot.position.y = 0;
                }, 1000);
                setTimeout(function() {
                    dogState = "idle";
                }, 2000);
            })
            .start();
    }

    //press f to pay respects
    window.addEventListener("keypress", function(e) {
        if (e.key === "f") {
            payRespects();
        }
        if (e.key === "c") {
            ven();
        }
    });
}

// windows size adapt
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    menuLoad(time);
}

function render() {
    frame++;
    findInSceneAndName();
    delta = clock.getDelta();

    mainDogControl();

    renderer.render(scene, camera);
}
