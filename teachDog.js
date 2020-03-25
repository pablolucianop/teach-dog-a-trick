        //dog parts
        let body, head, mouth, collar, eyeRight, eyeLeft, nose, earRight, earLeft, tail;
        let armRight, armLeft, legRight, legLeft, pawFrontRight, pawFrontLeft, pawBackRight, pawBackLeft;

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
        let enableShadow = false
        let frame = 0;
        let dimmer = 1
        let delta

        //web gl test
        if (WEBGL.isWebGLAvailable() === false) {
            document.body.appendChild(WEBGL.getWebGLErrorMessage());
        }
 
        //mobile or desktop?
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                document.getElementById("instructions").innerHTML = 'tap anywhere on the screen to play fetch';
                document.getElementById("instructions2").innerHTML = 'Press here to play dead';
                enableShadow=false
            }else{
                document.getElementById("instructions").innerHTML = 'click and drag to play fetch';
                document.getElementById("instructions2").innerHTML = 'Press f to play dead';
                enableShadow=true
        }

        init();

        function setTheScene(){
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

        function bringTheDogToScene(){
            // Loading collada dog model
            const loadingManager = new THREE.LoadingManager();
            const loader = new THREE.ColladaLoader(loadingManager);
            dogPivot = new THREE.Group();
            loader.load("dog6.dae", function (collada) {
                const dogModel = collada.scene;
                dogModel.traverse(obj => {
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

        function init() {
            const container = document.getElementById("container");
            setTheScene()
            bringTheDogToScene()

            //set the render
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xf2ebc2, 1);
            renderer.shadowMap.enabled = enableShadow;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);

            //stats
            stats = new Stats();
            container.appendChild(stats.dom);
            window.addEventListener("resize", onWindowResize, false);


            window.addEventListener("click", throwBall);

            function payRespects() {
                if (dogState !== "idle") return;
                dogState = "playingDead";

                var dogBoundingBox = new THREE.Box3().setFromObject(dogPivot);
                var halfDogWidth = (Math.abs(dogBoundingBox.min.x) + Math.abs(dogBoundingBox.max.x)) / 2;

                var fromPosition = { angle: dogPivot.rotation.z, posY: 0 };
                var toPosition = { angle: dogPivot.rotation.z - Math.PI * 0.48, posY: halfDogWidth - .09 }; // .09 to account for a bit of head movement

                var fallTween = new TWEEN.Tween(fromPosition).to(toPosition, 2000)
                    .easing(TWEEN.Easing.Bounce.Out)
                    .onUpdate(function () {
                        dogPivot.rotation.z = fromPosition.angle;
                        dogPivot.position.y = fromPosition.posY;
                    }).onComplete(function () {
                        setTimeout(function () {
                            // dogPivot.rotation.z = 0;
                            // dogPivot.position.y = 0;
                            getUp()
                        }, 1000)
                        setTimeout(function () {
                            // dogState = "idle";
                        }, 2000)
                    }).start()
            }

            function getUp() {
                // if (dogState !== "idle") return;


                var dogBoundingBox = new THREE.Box3().setFromObject(dogPivot);
                var halfDogWidth = (Math.abs(dogBoundingBox.min.x) + Math.abs(dogBoundingBox.max.x)) / 2;

                var fromPosition = { angle: dogPivot.rotation.z, posY: dogPivot.position.y };
                var toPosition = { angle: dogPivot.rotation.z - Math.PI * 1.52, posY: 0 }; // .09 to account for a bit of head movement


                var fallTween = new TWEEN.Tween(fromPosition).to(toPosition, 2000)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onUpdate(function () {
                        dogPivot.rotation.z = fromPosition.angle;
                        dogPivot.position.y = fromPosition.posY;
                    }).onComplete(function () {
                        setTimeout(function () {
                            dogPivot.rotation.z = 0;
                            dogPivot.position.y = 0;
                        }, 1000)
                        setTimeout(function () {
                            dogState = "idle";
                        }, 2000)
                    }).start()
            }

            //press f to pay respects
            window.addEventListener('keypress', function (e) {
                if (e.key === 'f') {
                    payRespects();
                }
            });
        }

        // windows size adapt
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function findInSceneAndName() {
            body = scene.getObjectByName("body");
            head = scene.getObjectByName("head");
            mouth = scene.getObjectByName("mouth");
            collar = scene.getObjectByName("collar");
            armRight = scene.getObjectByName("ArmRight");
            armLeft = scene.getObjectByName("armLeft");
            legRight = scene.getObjectByName("legRight");
            legLeft = scene.getObjectByName("legLeft");
            earRight = scene.getObjectByName("legRight");
            earLeft = scene.getObjectByName("legLeft");
            eyeRight = scene.getObjectByName("legRight");
            eyeLeft = scene.getObjectByName("eyeLeft");
            nose = scene.getObjectByName("nose");
            pawFrontRight = scene.getObjectByName("pawFrontRight");
            pawFrontLeft = scene.getObjectByName("pawFrontLeft");
            pawBackRight = scene.getObjectByName("pawBackRight");
            pawBackLeft = scene.getObjectByName("pawBackLeft");
            tail = scene.getObjectByName("tail");
        }

        function animate(time) {
            //loading screen managing
            if (RESOURCES_LOADED == false) {
                requestAnimationFrame(animate);
                renderer.render(loadingScreen.scene, loadingScreen.camera);
                document.getElementById("loadingScreen").style.display = "block";
                document.getElementById("container").style.display = "none";
            } else {
                document.getElementById("loadingScreen").style.display = "none";
                document.getElementById("container").style.display = "block";

                requestAnimationFrame(animate);
                TWEEN.update(time);
                render();
                stats.update();
            }
        }

        function mainDogControl(){


            function rotatePart(part, axis, speed, startPoint, amplitude) {
                part.rotation[axis] = -(Math.sin((frame / 100) * speed) * amplitude + startPoint);
            }
            function walkMovement() {
                const speed = 40;
                rotatePart(armLeft, "y", speed, -1.5, -0.5);
                rotatePart(armRight, "y", speed, -1.5, 0.5);
                rotatePart(legLeft, "y", speed, -1.5, 0.5);
                rotatePart(legRight, "y", speed, -1.5, -0.5);
                rotatePart(pawFrontRight, "y", speed, 0, 0.2);
                rotatePart(pawFrontLeft, "y", speed, 0, -0.2);
                rotatePart(pawBackRight, "y", speed, 0, -0.3);
                rotatePart(pawBackLeft, "y", speed, 0, 0.3);
            }
            function headAndTailNaturalMovement(dimmer){
                rotatePart(mouth, "y", 5, 0.3, 0.1 * dimmer);
                rotatePart(head, "z", 2, 3, 0.5 * dimmer);
                rotatePart(tail, "x", 20, 0, 0.5 * dimmer);
            }
            function idleStand(){
                armLeft.rotation.y = 1.5;
                armRight.rotation.y = 1.5;
                legLeft.rotation.y = 1.5;
                legRight.rotation.y = 1.5;
                pawFrontRight.rotation.y = 0;
                pawFrontLeft.rotation.y = 0;
                pawBackRight.rotation.y = 0;
                pawBackRight.rotation.y = 0;
            }

            /////////////////////////////////////////
            //Here is the main part that controls the dog beheaviour

            if (dogState === "idle") {
                idleStand()
            } else if (dogState !== "playingDead") {
                walkMovement()
            }

            function throwBall(e) {
                if (dogState !== "idle") return;
                scene.add(ball);
                ball.scale.setScalar(1);
                ball.position.set((e.clientX / innerWidth) * 2 - 1, -1 * ((e.clientY / innerHeight) * 2 - 1), 0);
                ball.position.unproject(camera);
                ballVelocity.set(
                    ((e.clientX / innerWidth) * 2 - 1) * 8,
                    (-e.clientY / innerHeight + 1) * 8 + 2,
                    -10
                );
                ballVelocity.applyQuaternion(camera.quaternion);
                ballMoving = true;
            }



            if (ballMoving) {
                //throw the ball updating it position
                ball.position.x += ballVelocity.x * delta;
                ball.position.y += ballVelocity.y * delta;
                ball.position.z += ballVelocity.z * delta;
                ballVelocity.y += -9.8 * delta;

                //if ball reach the floor (or nearly reach the floor)
                if (ball.position.y <= 0.04) {
                    ballMoving = false;
                    ball.position.y = 0.04;
                    lerp = 0;
                    //the ball have stoped moving so the dog get to fetch it
                    dogState = "fetching";
                }
                head.lookAt(ball.position);
            }


            if (dogState === "fetching") {
                head.lookAt(ball.position);
                //move the dog where the ball is
                lerp += 0.5 * delta;
                if (lerp >= 1) lerp = 1;
                dogPivot.quaternion.slerp(
                    tempQuaternion.setFromUnitVectors(zAxis, tempVector.copy(ball.position).sub(dogPivot.position)),
                    lerp
                );
                dogPivot.translateZ(6 * delta);

                //if dog is close to ball, put it in the mouth, and set 'returning' dog state
                if (dogPivot.position.distanceTo(ball.position) < 0.8) {
                    mouth.add(ball);
                    ball.scale.setScalar(150);
                    ball.position.set(-10, 0, 30);
                    head.rotation.set(Math.PI, -Math.PI / 8, 0);
                    lerp = 0;
                    dogState = "returning";
                }
            }


            if (dogState === "returning") {
                lerp += 0.5 * delta;
                if (lerp >= 1) lerp = 1;

                dogPivot.quaternion.slerp(
                    tempQuaternion.setFromUnitVectors(zAxis, tempVector.set(0, 0, 0).sub(dogPivot.position)),
                    lerp
                );
                dogPivot.translateZ(6 * delta);
                //if it arrives to his original position, stay idle 
                if (dogPivot.position.distanceTo(scene.position) < 0.8) {
                    dogState = "idle";
                }
            }

                
            headAndTailNaturalMovement(dimmer)
            if (dogState !== "playingDead") {
                if (dimmer < 1) {
                    dimmer = dimmer + 0.05
                }
            } else {
                if (dimmer > 0) {
                    dimmer = dimmer - 0.05
                }
            }
        }

        function render() {
            frame++;
            findInSceneAndName();
            delta = clock.getDelta();

            mainDogControl()

            renderer.render(scene, camera);
        }