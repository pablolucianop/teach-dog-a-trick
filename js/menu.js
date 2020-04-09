//mobile or desktop?

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.getElementById("instructions").innerHTML = "tap anywhere on the screen to play fetch";
    document.getElementById("instructions2").innerHTML = "tap here to play dead";
    enableShadow = false;
} else {
    document.getElementById("instructions").innerHTML = "click and drag to play fetch";
    document.getElementById("instructions2").innerHTML = "Press f to play dead";
    document.getElementById("instructions3").innerHTML = "Press c to come";
    document.getElementById("instructions4").innerHTML = "arrow keys to move";
    enableShadow = true;
}

function menuLoad(time) {
    if (RESOURCES_LOADED == false) {
        requestAnimationFrame(animate);
        renderer.render(loadingScreen.scene, loadingScreen.camera);
        document.getElementById("loadingScreen").style.display = "block";
        document.getElementById("content-container").style.display = "none";
    } else {
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("content-container").style.display = "block";

        requestAnimationFrame(animate);
        TWEEN.update(time);
        render();
        stats.update();
    }
}
