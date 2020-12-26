const menuContainer = document.getElementById("menu-container");
const highQualityButton = document.getElementById("high-quality-button");
const lowQualityButton = document.getElementById("low-quality-button");

function setupEventHandlers() {
  moveDirection = { left: 0, right: 0, forward: 0, back: 0, down: 0 };
  pauseGame = false;
  window.addEventListener("keydown", handleKeyDown, false);
  window.addEventListener("keyup", handleKeyUp, false);
  settings = {
    quality: "low",
  };
}

function handleQualityClick(quality) {
  if (quality === "low") {
    highQualityButton.classList.add("selected-button");
    lowQualityButton.classList.remove("selected-button");
  }
  if (quality === "high") {
    highQualityButton.classList.remove("selected-button");
    lowQualityButton.classList.add("selected-button");
  }
  if (settings.quality !== quality) {
    changeQuality(quality);
  }
  settings.quality = quality;
}

function handleKeyDown(event) {
  let keyCode = event.keyCode;

  switch (keyCode) {
    case 87: //W: FORWARD
      moveDirection.forward = 1;
      break;

    case 83: //S: BACK
      moveDirection.back = 1;
      break;

    case 65: //A: LEFT
      moveDirection.left = 1;
      break;

    case 68: //D: RIGHT
      moveDirection.right = 1;
      break;

    case 32: //SPACE
      moveDirection.down = 1;
      break;

    case 27: //ESC
      pauseGame = !pauseGame;
      if (!pauseGame) {
        renderFrame();
        menuContainer.style.display = "none";
      } else {
        menuContainer.style.display = "flex";
      }
      break;
  }
}

function handleKeyUp(event) {
  let keyCode = event.keyCode;

  switch (keyCode) {
    case 87: //FORWARD
      moveDirection.forward = 0;
      break;

    case 83: //BACK
      moveDirection.back = 0;
      break;

    case 65: //LEFT
      moveDirection.left = 0;
      break;

    case 68: //RIGHT
      moveDirection.right = 0;
      break;

    case 32: //SPACE
      moveDirection.down = 0;
      break;
  }
}
