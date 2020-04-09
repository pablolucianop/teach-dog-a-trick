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
