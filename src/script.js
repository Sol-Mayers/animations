import * as THREE from 'three';
import {OrbitControls} from  'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

// Debug
const gui = new dat.GUI();

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

// Textures
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/textures/star.jpg');

// Particles
// Geometry
const particlesGeometry = new THREE.BufferGeometry();
const count = 20000;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for(let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random();
}

particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)

particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
)

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    // color: new THREE.Color('#ff88cc'),
    alphaMap: particleTexture,
    transparent: true,
    // alphaTest: 0.01
    // depthTest: false
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

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

camera.position.z = 3;
// camera.lookAt(cube.position);
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

    // Update particles
    // particles.rotation.y = - elapsedTime * 0.2

    for(let i = 0; i < count; i++) {
        const i3 = i * 3;

        const x = particlesGeometry.attributes.position.array[i3];
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);
    }

    particlesGeometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();