import * as THREE from '../libs/three/build/three.module.js';
import {OrbitControls} from '../libs/three/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas: canvas});

let camera, scene;

let curve;

let grid = [];
let gridGroup = new THREE.Group();

let enemyMesh, enemyPosition, enemyTarget;
let flag = true;

let groundPathParent;

let rayDirection = new THREE.Vector3();
let rayFar = new THREE.Vector3();

let rayLine = undefined;

let raycasterGround = new THREE.Raycaster();

const time = new THREE.Clock();

function raycast(rayOrigin, rayDestination) {
    raycasterGround.set(rayOrigin, rayDirection.subVectors(rayDestination, rayOrigin).normalize());
    raycasterGround.far = rayFar.subVectors(rayDestination, rayOrigin).length();

    function addRayLine() {
        if (rayLine) {
            scene.remove(rayLine);
        }

        const pointsLine = [rayOrigin, rayDestination];

        rayLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints( pointsLine ),
            new THREE.LineBasicMaterial( { color: 0x00ff00 })
        );

        scene.add(rayLine);

    }

    //addRayLine()

    return raycasterGround.intersectObject( groundPathParent ); // TODO remove array later
}

function main() {
    document.body.appendChild( renderer.domElement );
    renderer.setClearColor(0xaaaaaa);
    renderer.shadowMap.enabled = true;

    {
        const fov = 75;
        const aspect = 2;
        const zNear = 0.1;
        const zFar = 1000;
        camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
        camera.position.set(4, 8, 4).multiplyScalar(3);
        camera.lookAt(0, 0, 0);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();
    }

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

    const enemyGeometry = new THREE.BoxGeometry(3, 3, 3);
    const enemyMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000});
    enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
    scene.add(enemyMesh);

    enemyPosition = new THREE.Vector2();
    enemyTarget = new THREE.Vector2();

    const groundGeometryPlane = new THREE.PlaneGeometry(5, 25);
    const groundGeometryCurve = new THREE.RingGeometry(
        3, 8,
        18, 2,
        0, Math.PI * 0.5
    );

    const groundMaterial = new THREE.MeshPhongMaterial({color: 0xCC8866, side: THREE.DoubleSide});
    groundPathParent = new THREE.Group();

    {
        const groundMesh = new THREE.Mesh(groundGeometryPlane, groundMaterial.clone());
        groundMesh.receiveShadow = true;
        groundMesh.rotation.x = Math.PI * -.5;
        groundMesh.position.set(-5.5, 0, -18);
        groundPathParent.add(groundMesh);
    }

    {
        const groundMesh = new THREE.Mesh(groundGeometryPlane, groundMaterial.clone());
        groundMesh.receiveShadow = true;
        groundMesh.rotation.x = Math.PI * -.5;
        groundMesh.position.set(5.5, 0, 18);
        groundPathParent.add(groundMesh);
    }

    {
        const groundMesh = new THREE.Mesh(groundGeometryCurve, groundMaterial.clone());
        groundMesh.receiveShadow = true;
        groundMesh.rotation.x = Math.PI * -.5;
        groundMesh.position.z = 5.5;
        groundPathParent.add(groundMesh);
    }

    {
        const groundMesh = new THREE.Mesh(groundGeometryCurve, groundMaterial.clone());
        groundMesh.receiveShadow = true;
        groundMesh.rotation.x = Math.PI * -.5;
        groundMesh.rotation.z = Math.PI * -1;
        groundMesh.position.z = -5.5;
        groundPathParent.add(groundMesh);
    }

    scene.add(groundPathParent);

    {
        curve = new THREE.SplineCurve([
            new THREE.Vector2(5.5, 30),
            new THREE.Vector2(5.0, 3),
            new THREE.Vector2(-5.0, -3),
            new THREE.Vector2(-5.5, -30),
        ]);

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({color: 0xff0000});
        const splineObject = new THREE.Line(geometry, material);
        splineObject.rotation.x = Math.PI * .5;
        splineObject.position.y = 0.5;
        scene.add(splineObject);
    }

    {
        const geometry = new THREE.BoxGeometry(3, 3, 3);
        const material = new THREE.MeshStandardMaterial({color: 0x000000});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(15, 0, -35)
        scene.add(mesh);
    }

    render();
}

function render() {
    let elapsedTime = time.getElapsedTime();

    if (resizeRendererToDisplaySize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    if (flag) {
        const rayOrigin = new THREE.Vector3();
        const rayDestination = new THREE.Vector3();

        const gridGeometry = new THREE.PlaneGeometry();
        let gridMesh;

        function newGridMaterial( hit ) {
            const c = new THREE.MeshPhongMaterial({side: THREE.DoubleSide});

            if ( hit ) {
                c.color = new THREE.Color(0, 1, 0);
            } else {
                c.color = new THREE.Color(1, 0, 0);
            }

            return c
        }

        let hit = false;
        let gridLine;

        for (let iz = -35, diz; iz <= 35; iz++) {
            gridLine = [];
            for (let ix = -15, dix; ix <= 15; ix++) {
                dix = ix * 1.01
                diz = iz * 1.01

                rayOrigin.set(dix, 5, diz);
                rayDestination.set(dix, -5, diz);

                let intersects = raycast(rayOrigin, rayDestination);

                if ( intersects.length ) {
                    hit = true;
                    flag = false;
                }

                gridMesh = new THREE.Mesh(
                    gridGeometry,
                    newGridMaterial(hit)
                );

                gridMesh.position.set(dix, -2 + elapsedTime * 50, diz);
                gridMesh.rotation.x = Math.PI * -0.5

                gridGroup.add(gridMesh);

                gridLine.push(
                    {
                        'position': {
                            'x': ix,
                            'z': iz
                        },
                        'hit': hit
                    }
                )

                hit = false;
            }
            grid.push(gridLine)
        }
        scene.add(gridGroup);

        console.log(grid)
    }

    curve.getPointAt(elapsedTime * 0.25 % 1, enemyPosition);
    curve.getPointAt((elapsedTime * 0.25 + 0.01) % 1, enemyTarget);
    enemyMesh.position.set(enemyPosition.x, 2, enemyPosition.y);
    enemyMesh.lookAt(enemyTarget.x, 2, enemyTarget.y);

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
