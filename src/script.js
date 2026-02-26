import * as THREE from 'three';
import {OrbitControls} from  'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.getElementById('webgl');

// Cursor
const cursor = {
    x: 0,
    y: 0,
}
window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5;
    cursor.y = -(e.clientY / sizes.height - 0.5);
})

// Scene
const scene = new THREE.Scene();

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

// Fog
const fog = new THREE.Fog('#262837', 1, 15);
scene.fog = fog;

// Textures
const textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load('/house/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/house/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/house/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('/house/door/height.jpg');
const doorNormalTexture = textureLoader.load('/house/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/house/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/house/door/roughness.jpg');

const bricksColorTexture = textureLoader.load('/house/walls/wall1.jpg');
const bricksAmbientOcclusionTexture = textureLoader.load('/house/walls/wall1_ambient.jpg');
const bricksNormalTexture = textureLoader.load('/house/walls/wall1_normal4.jpg');
const bricksRoughnessTexture = textureLoader.load('/house/walls/wall1_roughness.jpg');

const floorColorTexture = textureLoader.load('/house/floor/aerial_grass_rock_1k/aerial_grass_rock_diff_1k.jpg');
const floorAmbientOcclusionTexture = textureLoader.load('/house/floor/aerial_grass_rock_1k/aerial_grass_rock_arm_1k.jpg');
const floorNormalTexture = textureLoader.load('/house/floor/aerial_grass_rock_1k/aerial_grass_rock_nor_gl_1k.jpg');
const floorRoughnessTexture = textureLoader.load('/house/floor/aerial_grass_rock_1k/aerial_grass_rock_disp_1k.jpg');

const roofColorTexture = textureLoader.load('/house/roof/color.jpg');
const roofAmbientOcclusionTexture = textureLoader.load('/house/roof/ambient.jpg');
const roofHeightTexture = textureLoader.load('/house/roof/height.jpg');
const roofNormalTexture = textureLoader.load('/house/roof/normal.jpg');
const roofRoughnessTexture = textureLoader.load('/house/roof/roughness.jpg');

// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects
// House group
const house = new THREE.Group();
scene.add(house);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        map: floorColorTexture,
        aoMap: floorAmbientOcclusionTexture,
        normalMap: floorNormalTexture,
        roughnessMap: floorRoughnessTexture,
        color: '#89c854',
        roughness: 1.5,
    })
)
floor.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
)
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

// House walls
const brickMaterial = new THREE.MeshStandardMaterial({ 
    map: bricksColorTexture,
    aoMap: bricksAmbientOcclusionTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
});
brickMaterial.roughness = 5;
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    brickMaterial
)
walls.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
)
walls.position.y =  walls.geometry.parameters.height / 2;
walls.position.z =  floor.position.z;
walls.position.x =  floor.position.x;

// House roof
function createRoof() {
    // Параметры геометрии
    const radius = 3.5;
    const height = 1;
    const radialSegments = 4; // Больше сегментов для качественного Displacement

    const geom = new THREE.ConeGeometry(radius, height, radialSegments);

    // Доступ к атрибутам
    const postions = geom.attributes.position;
    const uv = geom.attributes.uv.array;
    const count = postions.count;

    /**
     * ПЕРЕРАСЧЕТ UV
     * Для черепицы нам важно, чтобы текстура шла ровно по вертикали и горизонтали.
     * Мы используем стандартный проход по точкам сетки.
     */
    const repeatX = 5; // Сколько раз черепица обернется вокруг крыши

    for (let i = 0; i < count; i++) {
        // Вычисляем индекс в массиве UV (2 значения на каждую вершину)
        const uIndex = i * 2;
        const vIndex = i * 2 + 1;

        // В стандартном ConeGeometry:
        // UV[uIndex] идет от 0 до 1 по окружности
        // UV[vIndex] идет от 1 (низ) до 0 (вершина) или наоборот

        uv[uIndex] *= repeatX;
        uv[vIndex] = 1.0 + uv[vIndex];
    }

    // Сообщаем Three.js, что UV обновились
    geom.attributes.uv.needsUpdate = true;

    // Создаем uv2 для карт AO (Ambient Occlusion) после всех правок основного UV
    geom.setAttribute('uv2', geom.attributes.uv.clone());

    function skewUV(geom, kUfromV = 0.0, kVfromU = 0.0) {
    const uv = geom.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i);
        const v = uv.getY(i);

        const u2 = u + kUfromV * v; // "skewX": сдвиг U в зависимости от V
        const v2 = v + kVfromU * u; // "skewY": сдвиг V в зависимости от U

        uv.setXY(i, u2, v2);
    }
    uv.needsUpdate = true;
    }

    // пример: выравниваем ряды (подберите знак/величину)
    skewUV(geom, -0.62, 0.0);

    // Настройка повторения для самих текстур (чтобы они не обрезались)
    [roofColorTexture, roofNormalTexture, roofAmbientOcclusionTexture, roofHeightTexture, roofRoughnessTexture].forEach(t => {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
    });

    // Создание материала
    const material = new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        normalMap: roofNormalTexture,
        aoMap: roofAmbientOcclusionTexture,
        aoMapIntensity: 1.0,
        displacementMap: roofHeightTexture,
        roughnessMap: roofRoughnessTexture,
        displacementScale: 0.9, // Малый коэффициент, чтобы не "разрывать" конус
        side: THREE.DoubleSide,
    });

    const roofMesh = new THREE.Mesh(geom, material);
    return roofMesh;
}

const roof = createRoof();

roof.position.y = walls.geometry.parameters.height + roof.geometry.parameters.height / 2;
roof.position.z =  walls.position.z;
roof.position.x =  walls.position.x;
roof.rotation.y = Math.PI / 4;

// House door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 50, 50),
    new THREE.MeshStandardMaterial({ 
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
     })
)
door.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
)
door.position.z = walls.position.z + walls.geometry.parameters.depth / 2 - 0.02;
door.position.x = walls.position.x;
door.position.y = 1;

house.add(walls, roof, door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(- 0.8, 0.1, 2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);

house.add(bush1, bush2, bush3, bush4);

// Graves
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' });

for(let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 6;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.position.set(x, 0.3, z);
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    grave.rotation.z = (Math.random() - 0.5) * 0.4;
    grave.castShadow = true;
    graves.add(grave);
}

// Ghosts
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3);

const ghost2 = new THREE.PointLight('#00ffff', 2, 3);

const ghost3 = new THREE.PointLight('#ffff00', 2, 3);
scene.add(ghost1, ghost2, ghost3);

// Lights
const ambientLight = new THREE.AmbientLight(0xb9d5ff, 0.2);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xb9d5ff, 0.2);
directionalLight.position.set(4, 5, -2);
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001);
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001);
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001);
scene.add(directionalLight);

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    //Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if(!fullscreenElement) {
        if(canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if(canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        }
    } else {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);

camera.position.z = 3;
// camera.lookAt(mesh.position);
scene.add(camera);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837');
renderer.capabilities.logarithmicDepthBuffer = true;
// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

directionalLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

// Clock
const clock = new THREE.Clock();

// Animations
const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update ghosts
    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(elapsedTime * 3);

    const ghost2Angle = - elapsedTime * 0.32;
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

    const ghost3Angle = - elapsedTime * 0.18;
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
    ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2);

    // Update controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);

    // Call tick
    window.requestAnimationFrame(tick);
};

tick();