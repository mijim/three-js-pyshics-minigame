function setupEventHandlers() {
  moveDirection = { left: 0, right: 0, forward: 0, back: 0, down: 0 };
  window.addEventListener("keydown", handleKeyDown, false);
  window.addEventListener("keyup", handleKeyUp, false);
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

    case 32:
      moveDirection.down = 1;
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

    case 32:
      moveDirection.down = 0;
      break;
  }
}
