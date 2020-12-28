const pos = new THREE.Vector3();
const rot = new THREE.Vector3(0, 0, 0);
const dir = new THREE.Vector3(0, 0, 0);
const center = new THREE.Vector3(0, 0, 0);
const worldPos = new THREE.Vector3(0, 0, 0);
const quat = new THREE.Quaternion();
const matrix = new THREE.Matrix4();

function changeQuality(quality) {
  if (quality === "low") {
    scene.remove(dirLight);
  }
  if (quality === "high") {
    scene.add(dirLight);
  }
}

function setupPhysicsWorld() {
  softBodies = [];
  rigidBodies = [];
  margin = 0.05;
  gravityConstant = -9.8;
  collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  broadphase = new Ammo.btDbvtBroadphase();
  solver = new Ammo.btSequentialImpulseConstraintSolver();
  softBodySolver = new Ammo.btDefaultSoftBodySolver();
  softBodyHelpers = new Ammo.btSoftBodyHelpers();
  physicsWorld = new Ammo.btSoftRigidDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration,
    softBodySolver
  );
  physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
  physicsWorld
    .getWorldInfo()
    .set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));
}

function setupGraphics() {
  //create clock for timing
  clock = new THREE.Clock();
  stats = new Stats();
  document.body.appendChild(stats.dom);

  //create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd1e5);

  //create camera
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / 10 / (window.innerHeight / 10),
    0.2,
    5000
  );

  cameraGroup = new THREE.Group();
  cameraGroup.add(camera);
  camera.position.set(0, 3, -10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  //add axis and controls
  //controls = new THREE.OrbitControls(camera);
  //controls.enabled = false;

  //scene.add(new THREE.AxesHelper(500));

  //Add hemisphere light
  let hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1);
  scene.add(hemiLight);

  //Add directional light
  dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(-1, 1.75, 1);
  dirLight.position.multiplyScalar(100);

  dirLight.castShadow = true;

  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;

  let d = 50;

  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  dirLight.shadow.camera.far = 13500;

  //Setup the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xbfd1e5);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 2.3;

  renderer.shadowMap.enabled = true;

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addObjects() {
  /** PLAYER BALL */

  var volumeMass = 15;
  var sphereGeometry = new THREE.SphereBufferGeometry(1.5, 30, 20);
  sphereGeometry.translate(5, 5, 0);
  var texture = new THREE.TextureLoader().load("textures/player_texture.jpg");
  var material = new THREE.MeshPhongMaterial({ map: texture });

  const loader = new THREE.TextureLoader();
  playerBall = {};
  loader.load("textures/player_texture.jpg", function (texture) {
    material.map = texture;
  });

  const GLTFLoader = new THREE.GLTFLoader();
  const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xdbc795 });
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x242424 });

  GLTFLoader.load("../blender_models/level1.gltf", (gltf) => {
    console.log("gltf --> ", gltf);

    gltf.scene.children.forEach((child) => {
      console.log("child --> ", child);
      const box = createBoxCollider(
        child.scale.x * 2,
        child.scale.y * 2,
        child.scale.z * 2,
        0,
        child.position,
        child.quaternion,
        child.name === "ground" ? groundMaterial : boxMaterial
      );
      box.castShadow = true;
      box.receiveShadow = true;
    });
    playerBall = createSoftVolume(sphereGeometry, volumeMass, 250, material);
    scene.add(playerBall);
  });

  /** GROUND */
  // pos.set(0, -0.5, 0);
  // quat.set(0, 0, 0, 1);
  // var ground = createBoxCollider(
  //   100,
  //   1,
  //   100,
  //   0,
  //   pos,
  //   quat,
  //   new THREE.MeshPhongMaterial({ color: 0xdbc795 })
  // );
  // ground.castShadow = true;
  // ground.receiveShadow = true;

  /** OBSTACLES */
  // pos.set(0, -0.5, 0);
  // quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (10 * Math.PI) / 180);
  // var ground = createBoxCollider(
  //   40,
  //   1,
  //   1,
  //   0,
  //   pos,
  //   quat,
  //   new THREE.MeshPhongMaterial({ color: 0x363535 })
  // );
  // ground.castShadow = true;
  // ground.receiveShadow = true;

  // pos.set(15, 2, 10);
  // quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 360);
  // var ground = createBoxCollider(
  //   1,
  //   1,
  //   40,
  //   0,
  //   pos,
  //   quat,
  //   new THREE.MeshPhongMaterial({ color: 0x363535 })
  // );
  // ground.castShadow = true;
  // ground.receiveShadow = true;
}

function updatePhysics(deltaTime) {
  // Step world
  physicsWorld.stepSimulation(deltaTime, 10);

  // Update soft volumes
  for (var i = 0, il = softBodies.length; i < il; i++) {
    var volume = softBodies[i];
    var geometry = volume.geometry;
    var softBody = volume.userData.physicsBody;
    var volumePositions = geometry.attributes.position.array;
    var volumeNormals = geometry.attributes.normal.array;
    volume.geometry.computeBoundingBox();
    volume.geometry.boundingBox.getCenter(center);
    volume.geometry.center();
    volume.calcPosition = center;
    var association = geometry.ammoIndexAssociation;
    var numVerts = association.length;
    var nodes = softBody.get_m_nodes();
    for (var j = 0; j < numVerts; j++) {
      var node = nodes.at(j);
      var nodePos = node.get_m_x();
      var x = nodePos.x();
      var y = nodePos.y();
      var z = nodePos.z();
      var nodeNormal = node.get_m_n();
      var nx = nodeNormal.x();
      var ny = nodeNormal.y();
      var nz = nodeNormal.z();

      var assocVertex = association[j];

      for (var k = 0, kl = assocVertex.length; k < kl; k++) {
        var indexVertex = assocVertex[k];
        volumePositions[indexVertex] = x;
        volumeNormals[indexVertex] = nx;
        indexVertex++;
        volumePositions[indexVertex] = y;
        volumeNormals[indexVertex] = ny;
        indexVertex++;
        volumePositions[indexVertex] = z;
        volumeNormals[indexVertex] = nz;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }

  // Update rigid bodies
  //   for (let i = 0; i < rigidBodies.length; i++) {
  //     let objThree = rigidBodies[i];
  //     let objAmmo = objThree.userData.physicsBody;
  //     let ms = objAmmo.getMotionState();
  //     if (ms) {
  //       ms.getWorldTransform(tmpTrans);
  //       let p = tmpTrans.getOrigin();
  //       let q = tmpTrans.getRotation();
  //       objThree.position.set(p.x(), p.y(), p.z());
  //       objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
  //     }
  //   }
}

function renderFrame() {
  if (pauseGame) return;
  let deltaTime = clock.getDelta();
  stats.update();
  moveBall();
  updatePhysics(deltaTime);
  cameraUpdate();
  renderer.render(scene, camera);

  requestAnimationFrame(renderFrame);
}

const rotSpeed = 0.04;
let rotValue = 0;
function cameraUpdate() {
  if (moveDirection.right) {
    cameraGroup.rotateY(-rotSpeed);
    if (rotValue > -0.02) {
      rotValue -= 0.002;
      camera.rotation.set(
        camera.rotation.x,
        camera.rotation.y,
        Math.PI + rotValue
      );
    }
  } else if (moveDirection.left) {
    cameraGroup.rotateY(rotSpeed);
    if (rotValue > -0.02) {
      rotValue += 0.002;
      camera.rotation.set(
        camera.rotation.x,
        camera.rotation.y,
        Math.PI + rotValue
      );
    }
  } else if (rotValue !== 0) {
    rotValue = rotValue > 0 ? rotValue - 0.003 : rotValue + 0.003;
    camera.rotation.set(
      camera.rotation.x,
      camera.rotation.y,
      Math.PI + rotValue
    );
  }
  if (playerBall.calcPosition) {
    cameraGroup.position.lerp(playerBall.calcPosition, 0.2);
  }
}

var period = 1;
const vel = 2;

function moveBall() {
  let scalingFactor = 0.2;
  if (camera.position && playerBall.calcPosition) {
    dir
      .subVectors(playerBall.calcPosition, camera.getWorldPosition(worldPos))
      .normalize(); //OBTENER VECTOR DIRECTOR
  }

  if (moveDirection.forward && camera.fov > 45) {
    camera.fov -= 0.5;
    camera.updateProjectionMatrix(); //CHECK THIS FROR PERFORMANCE
  } else if (moveDirection.back && camera.fov < 55) {
    camera.fov += 0.5;
    camera.updateProjectionMatrix(); //CHECK THIS FROR PERFORMANCE
  } else if (
    !moveDirection.back &&
    !moveDirection.forward &&
    camera.fov !== 50
  ) {
    camera.fov = camera.fov > 50 ? camera.fov - 0.5 : camera.fov + 0.5;
    camera.updateProjectionMatrix(); //CHECK THIS FROR PERFORMANCE
  }

  let moveX = moveDirection.forward
    ? dir.x * vel
    : moveDirection.back
    ? -dir.x * vel
    : 0;
  let moveZ = moveDirection.forward
    ? dir.z * vel
    : moveDirection.back
    ? -dir.z * vel
    : 0;
  let moveY = moveDirection.down === 1 ? -4 : 0;

  if (moveX == 0 && moveY == 0 && moveZ == 0) return;

  let resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ);
  resultantImpulse.op_mul(scalingFactor);

  let physicsBody = playerBall.userData.physicsBody;
  physicsBody.addForce(resultantImpulse);
}
