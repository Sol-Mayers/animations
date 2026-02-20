import * as THREE from 'three';
import {OrbitControls} from  'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import * as dat from 'lil-gui';

//Debug
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

// Object
// const geometry = new THREE.BoxGeometry(1,1,1,4,4,4);

const params = {
    'Цвет': '#ff00ff',
    spin: () => {
        gsap.to(mesh.rotation, {y: mesh.rotation.y + 10, duration: 1})
    }
};

const geometry = new THREE.BoxBufferGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({
        color: params['Цвет']
    });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//Debug
gui.add(mesh.position, 'y')
    .min(-1)
    .max(3)
    .step(0.01).name('Ось Y');

gui.add(mesh, 'visible').name('Видимость');

gui.add(material, 'wireframe').name('Каркас');

gui
    .addColor(params, 'Цвет')
    .onChange(() => {
        material.color.set(params['Цвет']);
    });

gui
    .add(params, 'spin')

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