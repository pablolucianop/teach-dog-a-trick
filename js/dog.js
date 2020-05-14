//dog parts
let body, head, mouth, collar, eyeRight, eyeLeft, nose, earRight, earLeft, tail;
let armRight, armLeft, legRight, legLeft, pawFrontRight, pawFrontLeft, pawBackRight, pawBackLeft;

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

function mainDogControl() {
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
    function headAndTailNaturalMovement(dimmer) {
        rotatePart(mouth, "y", 5, 0.3, 0.1 * dimmer);
        rotatePart(head, "z", 2, 3, 0.5 * dimmer);
        rotatePart(tail, "x", 20, 0, 0.5 * dimmer);
    }
    function idleStand() {
        armLeft.rotation.y = 1.5;
        armRight.rotation.y = 1.5;
        legLeft.rotation.y = 1.5;
        legRight.rotation.y = 1.5;
        pawFrontRight.rotation.y = 0;
        pawFrontLeft.rotation.y = 0;
        pawBackRight.rotation.y = 0;
        pawBackRight.rotation.y = 0;
    }

    ////////////////////////////////////////////////////////////////////////////////
    //Here is the main part that controls the dog beheaviour

    if (dogState === "idle") {
        idleStand();
    } else if (dogState !== "playingDead") {
        walkMovement();
    }

    function throwBall(e) {
        if (dogState !== "idle" || menuStatus !== "fetch") return;
        scene.add(ball);
        ball.scale.setScalar(1);
        ball.position.set((e.clientX / innerWidth) * 2 - 1, -1 * ((e.clientY / innerHeight) * 2 - 1), 0);
        ball.position.unproject(camera);
        ballVelocity.set(((e.clientX / innerWidth) * 2 - 1) * 8, (-e.clientY / innerHeight + 1) * 8 + 2, -10);
        ballVelocity.applyQuaternion(camera.quaternion);
        ballMoving = true;
    }

    window.addEventListener("click", throwBall);

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

    if (dogState === "coming") {
        lerp += 0.5 * delta;
        if (lerp >= 1) lerp = 1;

        dogPivot.quaternion.slerp(
            tempQuaternion.setFromUnitVectors(
                zAxis,
                tempVector.set(camera.position.x, 0, camera.position.z).sub(dogPivot.position)
            ),
            lerp
        );
        dogPivot.translateZ(6 * delta);

        //if it arrives to MYYY position, stay idle
        camxz = new THREE.Vector3(camera.position.x, 0, camera.position.z);
        if (dogPivot.position.distanceTo(camxz) < 3) {
            dogState = "idle";
        }
    }

    headAndTailNaturalMovement(dimmer);
    if (dogState !== "playingDead") {
        if (dimmer < 1) {
            dimmer = dimmer + 0.05;
        }
    } else {
        if (dimmer > 0) {
            dimmer = dimmer - 0.05;
        }
    }
}
