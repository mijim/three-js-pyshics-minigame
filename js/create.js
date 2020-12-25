/** STATIC COLLIDER */

function createBoxCollider(sx, sy, sz, mass, pos, quat, material) {
  var threeObject = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
    material
  );
  threeObject.receiveShadow = true;
  var shape = new Ammo.btBoxShape(
    new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
  );
  shape.setMargin(margin);

  createRigidBody(threeObject, shape, mass, pos, quat);

  return threeObject;
}

function createRigidBody(threeObject, physicsShape, mass, pos, quat) {
  threeObject.position.copy(pos);
  threeObject.quaternion.copy(quat);

  var transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  var motionState = new Ammo.btDefaultMotionState(transform);

  var localInertia = new Ammo.btVector3(0, 0, 0);
  physicsShape.calculateLocalInertia(mass, localInertia);

  var rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    physicsShape,
    localInertia
  );
  var body = new Ammo.btRigidBody(rbInfo);

  threeObject.userData.physicsBody = body;

  scene.add(threeObject);

  if (mass > 0) {
    rigidBodies.push(threeObject);

    // Disable deactivation
    body.setActivationState(4);
  }

  physicsWorld.addRigidBody(body);

  return body;
}

/** SOFT COLLIDER */

function createSoftVolume(bufferGeom, mass, pressure, material) {
  processGeometry(bufferGeom);

  var volume = new THREE.Mesh(bufferGeom, material);
  volume.castShadow = true;
  volume.receiveShadow = true;
  volume.frustumCulled = false;
  //   scene.add(volume);

  // Volume physic object
  var volumeSoftBody = softBodyHelpers.CreateFromTriMesh(
    physicsWorld.getWorldInfo(),
    bufferGeom.ammoVertices,
    bufferGeom.ammoIndices,
    bufferGeom.ammoIndices.length / 3,
    true
  );

  volume.userData.physicsBody = volumeSoftBody;

  var sbConfig = volumeSoftBody.get_m_cfg();
  sbConfig.set_viterations(40);
  sbConfig.set_piterations(40);

  // Soft-soft and soft-rigid collisions
  sbConfig.set_collisions(0x11);

  // Friction
  sbConfig.set_kDF(0.1);
  // Damping
  sbConfig.set_kDP(0.01);
  // Pressure
  sbConfig.set_kPR(pressure);
  // Stiffness
  volumeSoftBody.get_m_materials().at(0).set_m_kLST(0.9);
  volumeSoftBody.get_m_materials().at(0).set_m_kAST(0.9);

  volumeSoftBody.setTotalMass(mass, false);
  volumeSoftBody.setFriction(4);
  volumeSoftBody.setRollingFriction(10);

  Ammo.castObject(volumeSoftBody, Ammo.btCollisionObject)
    .getCollisionShape()
    .setMargin(margin);
  physicsWorld.addSoftBody(volumeSoftBody, 1, -1);
  volume.userData.physicsBody = volumeSoftBody;
  // Disable deactivation
  volumeSoftBody.setActivationState(4);

  softBodies.push(volume);

  return volume;
}

function processGeometry(bufGeometry) {
  // Obtain a Geometry
  var geometry = new THREE.Geometry().fromBufferGeometry(bufGeometry);

  // Merge the vertices so the triangle soup is converted to indexed triangles
  var vertsDiff = geometry.mergeVertices();

  // Convert again to BufferGeometry, indexed
  var indexedBufferGeom = createIndexedBufferGeometryFromGeometry(geometry);

  // Create index arrays mapping the indexed vertices to bufGeometry vertices
  mapIndices(bufGeometry, indexedBufferGeom);
}

function createIndexedBufferGeometryFromGeometry(geometry) {
  var numVertices = geometry.vertices.length;
  var numFaces = geometry.faces.length;

  var bufferGeom = new THREE.BufferGeometry();
  var vertices = new Float32Array(numVertices * 3);
  var indices = new (numFaces * 3 > 65535 ? Uint32Array : Uint16Array)(
    numFaces * 3
  );

  for (var i = 0; i < numVertices; i++) {
    var p = geometry.vertices[i];

    var i3 = i * 3;

    vertices[i3] = p.x;
    vertices[i3 + 1] = p.y;
    vertices[i3 + 2] = p.z;
  }

  for (var i = 0; i < numFaces; i++) {
    var f = geometry.faces[i];

    var i3 = i * 3;

    indices[i3] = f.a;
    indices[i3 + 1] = f.b;
    indices[i3 + 2] = f.c;
  }

  bufferGeom.setIndex(new THREE.BufferAttribute(indices, 1));
  bufferGeom.addAttribute("position", new THREE.BufferAttribute(vertices, 3));

  return bufferGeom;
}

function isEqual(x1, y1, z1, x2, y2, z2) {
  var delta = 0.000001;
  return (
    Math.abs(x2 - x1) < delta &&
    Math.abs(y2 - y1) < delta &&
    Math.abs(z2 - z1) < delta
  );
}

function mapIndices(bufGeometry, indexedBufferGeom) {
  // Creates ammoVertices, ammoIndices and ammoIndexAssociation in bufGeometry

  var vertices = bufGeometry.attributes.position.array;
  var idxVertices = indexedBufferGeom.attributes.position.array;
  var indices = indexedBufferGeom.index.array;

  var numIdxVertices = idxVertices.length / 3;
  var numVertices = vertices.length / 3;

  bufGeometry.ammoVertices = idxVertices;
  bufGeometry.ammoIndices = indices;
  bufGeometry.ammoIndexAssociation = [];

  for (var i = 0; i < numIdxVertices; i++) {
    var association = [];
    bufGeometry.ammoIndexAssociation.push(association);

    var i3 = i * 3;

    for (var j = 0; j < numVertices; j++) {
      var j3 = j * 3;
      if (
        isEqual(
          idxVertices[i3],
          idxVertices[i3 + 1],
          idxVertices[i3 + 2],
          vertices[j3],
          vertices[j3 + 1],
          vertices[j3 + 2]
        )
      ) {
        association.push(j3);
      }
    }
  }
}
