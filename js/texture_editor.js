var textureCanvas,
  ctx,
  flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  strokSlider,
  dot_flag = false;

var x = "black",
  y = 5;

function textureEditorInit() {
  textureCanvas = document.getElementById("texture-canvas");
  strokeSlider = document.getElementById("draw-stroke-slider");
  colorPicker = document.getElementById("draw-color-picker");
  saveButton = document.getElementById("draw-save-button");
  restartButton = document.getElementById("draw-restart-button");

  ctx = textureCanvas.getContext("2d");
  w = textureCanvas.width;
  h = textureCanvas.height;

  colorPicker.addEventListener("change", (ev) => {
    x = ev.target.value;
  });

  strokeSlider.addEventListener("change", (ev) => {
    drawSize(ev.target.value);
  });

  saveButton.addEventListener("click", () => {
    drawSave();
    stopGame();
  });

  restartButton.addEventListener("click", () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
    ctx.fillStyle = "black";
  });

  textureCanvas.addEventListener(
    "mousemove",
    function (e) {
      drawFindxy("move", e);
    },
    false
  );
  textureCanvas.addEventListener(
    "mousedown",
    function (e) {
      drawFindxy("down", e);
    },
    false
  );
  textureCanvas.addEventListener(
    "mouseup",
    function (e) {
      drawFindxy("up", e);
    },
    false
  );
  textureCanvas.addEventListener(
    "mouseout",
    function (e) {
      drawFindxy("out", e);
    },
    false
  );

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
  ctx.fillStyle = "black";
}

function color(obj) {
  switch (obj.id) {
    case "green":
      x = "green";
      break;
    case "blue":
      x = "blue";
      break;
    case "red":
      x = "red";
      break;
    case "yellow":
      x = "yellow";
      break;
    case "orange":
      x = "orange";
      break;
    case "black":
      x = "black";
      break;
    case "white":
      x = "white";
      break;
  }
  if (x == "white") y = 14;
  else y = 2;
}

function draw() {
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currX, currY);
  ctx.lineJoin = "round";
  ctx.strokeStyle = x;
  ctx.lineWidth = y;
  ctx.closePath();
  ctx.stroke();
}

function drawSize(size) {
  y = size;
}

function drawErase() {
  var m = confirm("Want to clear");
  if (m) {
    ctx.clearRect(0, 0, w, h);
    document.getElementById("textureCanvasimg").style.display = "none";
  }
}

function drawSave() {
  var dataURL = textureCanvas.toDataURL();
  localStorage.setItem("player-texture", dataURL);
  setPlayerTexture(dataURL);
}

function drawFindxy(res, e) {
  if (res == "down") {
    prevX = currX;
    prevY = currY;
    currX = e.clientX - textureCanvas.offsetLeft;
    currY = e.clientY - textureCanvas.offsetTop;

    flag = true;
    dot_flag = true;
    if (dot_flag) {
      ctx.beginPath();
      ctx.fillStyle = x;
      //ctx.fillRect(currX, currY, y, y);
      ctx.arc(currX, currY, y / 2, 0, 2 * Math.PI, true);
      ctx.fill();
      ctx.closePath();
      dot_flag = false;
    }
  }
  if (res == "up" || res == "out") {
    flag = false;
  }
  if (res == "move") {
    if (flag) {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - textureCanvas.offsetLeft;
      currY = e.clientY - textureCanvas.offsetTop;
      draw();
    }
  }
}
