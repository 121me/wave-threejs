import * as THREE from '../libs/three/build/three.module.js';
import {OrbitControls} from '../libs/three/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas: canvas});

let camera, scene;

function main() {
    document.body.appendChild( renderer.domElement );
    renderer.setClearColor(0xaaaaaa);
    renderer.shadowMap.enabled = true;

    const fov = 75;
    const aspect = 2;
    const zNear = 0.1;
    const zFar = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
    camera.position.set(4, 8, 4).multiplyScalar(3);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.update();

    scene = new THREE.Scene();

    {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 20, 0);
        scene.add(light);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        const d = 50;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 50;
        light.shadow.bias = 0.001;
    }

    {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 2, 4);
        scene.add(light);
    }

    {
        const light = new THREE.DirectionalLight(0xffffff, 0.4);
        light.position.set(0, -5, 0);
        light.rotation.x = Math.PI * 0.5;
        scene.add(light);
    }

    const groundGeometryPlane = new THREE.PlaneGeometry(5, 25);
    const groundGeometryCurve = new THREE.RingGeometry(
        3, 8,
        18, 2,
        0, Math.PI * 0.5
    );
    const groundMaterial = new THREE.MeshPhongMaterial({color: 0xCC8866, side: THREE.DoubleSide});


    const groundMesh1 = new THREE.Mesh(groundGeometryPlane, groundMaterial);
    groundMesh1.rotation.x = Math.PI * -.5;
    groundMesh1.receiveShadow = true;
    groundMesh1.position.set(-5.5, 0, -18);
    scene.add(groundMesh1);

    const groundMesh2 = new THREE.Mesh(groundGeometryPlane, groundMaterial);
    groundMesh2.rotation.x = Math.PI * -.5;
    groundMesh2.receiveShadow = true;
    groundMesh2.position.set(5.5, 0, 18);
    scene.add(groundMesh2);

    const groundMesh3 = new THREE.Mesh(groundGeometryCurve, groundMaterial);
    groundMesh3.rotation.x = Math.PI * -.5;
    groundMesh3.position.z = 5.5;
    scene.add(groundMesh3);

    const groundMesh4 = new THREE.Mesh(groundGeometryCurve, groundMaterial);
    groundMesh4.rotation.x = Math.PI * -.5;
    groundMesh4.rotation.z = Math.PI * -1;
    groundMesh4.position.z = -5.5;
    scene.add(groundMesh4);

    requestAnimationFrame(render);
}

function render() {

    if (resizeRendererToDisplaySize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

main();
