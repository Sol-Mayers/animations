import * as THREE from 'three';
import {OrbitControls} from  'three/examples/jsm/controls/OrbitControls.js';

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

// Object
// const geometry = new THREE.BoxGeometry(1,1,1,4,4,4);

const geometry = new THREE.BufferGeometry();

const count = 5000;
const positionsArray = new Float32Array(count * 3 * 3);

for(let i = 0; i < count * 3 * 3; i++) {
    positionsArray[i] = (Math.random() - 0.5) * 4;
}

const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
geometry.setAttribute('position', positionsAttribute);

const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
    });

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

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

// const aspectRatio = sizes.width / sizes.height;
// const camera = new THREE.OrthographicCamera(
//     -1 * aspectRatio, 
//     1 * aspectRatio, 
//     1, 
//     -1, 
//     0.1, 
//     100
// );
camera.position.z = 3;
// camera.position.x = 2;
// camera.position.y = 2;
camera.lookAt(mesh.position);
scene.add(camera);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
// controls.target.y = 1;
// controls.update();

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Clock
const clock = new THREE.Clock();

// Animations
const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    // mesh.rotation.y = elapsedTime;

    // Update camera
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
    // camera.position.y = cursor.y * 5; 
    // camera.lookAt(mesh.position);

    // Update controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();