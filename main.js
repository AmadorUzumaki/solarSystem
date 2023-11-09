import './style.css'
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Scene = new THREE.Scene()

const fov = 60
const aspect = window.innerWidth/window.innerHeight
const near = 0.1
const far = 1000

const Renderer = new THREE.WebGL1Renderer()
Renderer.setSize(window.innerWidth,window.innerHeight)

//cubeMap creat i col·locat

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMap = cubeTextureLoader.load([
  'textures/environmentMaps/NightSky/px.png',
  'textures/environmentMaps/NightSky/nx.png',
  'textures/environmentMaps/NightSky/py.png',
  'textures/environmentMaps/NightSky/ny.png',
  'textures/environmentMaps/NightSky/pz.png',
  'textures/environmentMaps/NightSky/nz.png'
])

Scene.background =environmentMap

//fer un spotlight damunt el sistema solar per fer que faci ombres
const ssSpotLight = new THREE.SpotLight()
ssSpotLight.position.y = 50
ssSpotLight.intensity = 100
Scene.add(ssSpotLight)

const ssSpotLightHelper = new THREE.SpotLightHelper( ssSpotLight );
Scene.add(ssSpotLightHelper);

//fer un pla on es castearà la ombra del sistema solar (el pla no està ben col·locat perquè no el consegueix rotar com toca)

const planeMaterial = new THREE.MeshBasicMaterial(0xFF00FF)
const planeGeometry = new THREE.PlaneGeometry()
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
planeMesh.scale.set(10, 10, 10)
planeMesh.position.y = -10
//planeMesh.rotateZ(-Math.PI)
//planeMesh.scale.set(20, 0, 20)
Scene.add(planeMesh)

document.body.appendChild(Renderer.domElement)


const textureLoader = new THREE.TextureLoader()

//crear textura per la Lluna amb imatges

const albedoMoon = "textures/moonTexture/textures/albedoMoon.jpg"
const normalMoon = "textures/moonTexture/textures/normalMoon.jpg"
const bumpMoon = "textures/moonTexture/textures/bumpMoon.jpg"

const albedoTexture = textureLoader.load(albedoMoon)
const normalTexture = textureLoader.load(normalMoon)
const bumpTexture = textureLoader.load(bumpMoon)

//creat textura per Mart amb imatges

const albedoMars = "textures/marsTexture/textures/red_sand_diff_2k.jpg"
const normalMars = "textures/marsTexture/textures/red_sand_nor_2k.jpg"
const armMars = "textures/marsTexture/textures/red_sand_arm_2k.jpg"

const albedoMTexture = textureLoader.load(albedoMars)
const normalMTexture = textureLoader.load(normalMars)
const aoMTexture = textureLoader.load(armMars)
const roughMTexture = textureLoader.load(armMars)
const metalMTexture = textureLoader.load(armMars)

//cream l'array d'objects per fer que tots el objectes rotin i orbitin
const objects = [];

//geometria de les esferes
const radius = 1;
const sphereGeometry = new THREE.SphereGeometry(radius);

//objecte buit per tenir òrbites al Sol
const solarSystem = new THREE.Object3D();
Scene.add(solarSystem);
objects.push(solarSystem);

//cream el Sol, li donam un material, el feim més gran, el feim fill del sistema solar i l'afegim a l'array d'objects
const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00, emissiveIntensity: 1000 });
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);
solarSystem.add(sunMesh);

//afegim un llum per veure millor
// {
//     const PLcolor = 0xFFFFFF;
//     const PLintensity = 3;
//     const pointLight = new THREE.PointLight(PLcolor, PLintensity);
//     Scene.add(pointLight);
//   }
//afegim la càmera
const Camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
Camera.position.set(0, 50, 0);
Camera.up.set(0, 0, 1);
Camera.lookAt(0, 0, 0);

//objecte buit per tenir òrbita a la Terra y la feim filla de l'òrbita del sistema Solar
const earthOrbit = new THREE.Object3D();
earthOrbit.position.x = 10;
solarSystem.add(earthOrbit);
objects.push(earthOrbit);

//cream la Terra, li donam un material, i la feim filla de la seva òrbita
const earthMaterial = new THREE.MeshStandardMaterial({color: 0x2233FF});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthMesh.receiveShadow = true
earthOrbit.add(earthMesh);

//cream una òrbita por la lluna y la feim filla de l'òrbita de la Terra
const moonOrbit = new THREE.Object3D();
moonOrbit.position.x = 2;
earthOrbit.add(moonOrbit);

//cream la Lluna, li donam un materal, la feim més petita
//const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
const moonMaterial = new THREE.MeshStandardMaterial({
  map: albedoTexture,
  normalMap: normalTexture,
  bumpMap: bumpTexture

});
const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
moonMesh.castShadow = true;
moonMesh.scale.set(.5, .5, .5);
moonOrbit.add(moonMesh);

//llum per fer que la Lluna pugui tenir ombra a la Terra (la càmara de ombres no apunta on toca)

const spotLight = new THREE.SpotLight(0xFFFFFF)
spotLight.angle = Math.PI/8
spotLight.position.x = 2
spotLight.intensity = 5
spotLight.target = moonMesh
spotLight.castShadow = true
spotLight.shadow.camera.position.x = 2
spotLight.add(spotLight.shadow.camera)
moonOrbit.add(spotLight)

//helpers per veure on apunta l'spotlight i la càmara d'ombres
const spotLightHelper = new THREE.SpotLightHelper( spotLight );
Scene.add( spotLightHelper );

const shadowHelper = new THREE.CameraHelper( spotLight.shadow.camera );
Scene.add( shadowHelper );


//objecte buit per tenir òrbita a Mart y la feim filla de l'òrbita del sistema Solar

const marsOrbit = new THREE.Object3D();
marsOrbit.position.x = 20;
solarSystem.add(marsOrbit);
objects.push(marsOrbit);

//cream Mart, li donam un material, i el feim fill de la seva òrbita

//const marsMaterial = new THREE.MeshPhongMaterial({color: 0xA1251B, emissive: 0x222222});
const marsMaterial = new THREE.MeshStandardMaterial({
    map: albedoMTexture,
    normalMap: normalMTexture,
    aoMap: aoMTexture,
    roughnessMap: roughMTexture,
    metalnessMap: metalMTexture
  
  });
const marsMesh = new THREE.Mesh(sphereGeometry, marsMaterial);
marsOrbit.add(marsMesh);

//objecte buit per tenir òrbita a Fobos y la feim filla de l'òrbita de Mart

const phobosOrbit = new THREE.Object3D();
phobosOrbit.position.x = 2;
marsOrbit.add(phobosOrbit);
objects.push(phobosOrbit);

//cream Fobos, li donam un material, i el feim fill de la seva òrbita

const phobosMaterial = new THREE.MeshPhongMaterial({color: 0x88FF88, emissive: 0x222222});
const phobosMesh = new THREE.Mesh(sphereGeometry, phobosMaterial);
phobosMesh.scale.set(.75, .75, .75);
phobosOrbit.add(phobosMesh);

//objecte buit per tenir òrbita a Deimos y la feim filla de l'òrbita de Mart

const deimosOrbit = new THREE.Object3D();
deimosOrbit.position.x = -4;
marsOrbit.add(deimosOrbit);
objects.push(deimosOrbit);

//cream Deimos, li donam un material, i el feim fill de la seva òrbita

const deimosMaterial = new THREE.MeshPhongMaterial({color: 0xFF8888, emissive: 0x222222});
const deimosMesh = new THREE.Mesh(sphereGeometry, deimosMaterial);
deimosMesh.scale.set(.5, .5, .5);
deimosOrbit.add(deimosMesh);

//objecte buit per tenir òrbita a Júpiter y la feim filla de l'òrbita del sistema Solar

const jupiterOrbit = new THREE.Object3D();
jupiterOrbit.position.x = 30;
solarSystem.add(jupiterOrbit);
objects.push(jupiterOrbit);

const ambientLight = new THREE.AmbientLight();
Scene.add(ambientLight);
//cream Júpiter, li donam un material, i el feim fill de la seva òrbita

const jupiterMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF, emissive: 0x222222});
const jupiterMesh = new THREE.Mesh(sphereGeometry, jupiterMaterial);
jupiterMesh.scale.set(3, 3, 3);
//jupiterOrbit.add(jupiterMesh);

//aprofitam l'òrbita de Júpiter per afegir coses de Halloween

let skull = null;
//funció asíntona, es fa en segón plà i es continua amb es codi
ImportSkull();
function ImportSkull(){

    const LoaderSkull = new GLTFLoader();

    LoaderSkull.load
    (
        "Models/halloween_pumpkin/scene.gltf",

        function (gltf) {
            skull = gltf.scene;
            jupiterOrbit.add(skull);
        },
        function(xhr){
            console.log ((xhr.loaled / xhr.total * 100)+ "%loaded")
        },
        function (error) {
            //callback per quan hi ha un error. El podem mostrar per consola.
            console.error(error);
        }
    )

}


//objecte buit per tenir òrbita a Neptú y la feim filla de l'òrbita del sistema Solar

const neptuneOrbit = new THREE.Object3D();
neptuneOrbit.position.x = 45;
solarSystem.add(neptuneOrbit);
objects.push(neptuneOrbit);

//cream Neptú, li donam un material, i el feim fill de la seva òrbita

const neptuneMaterial = new THREE.MeshPhongMaterial({color: 0x0000FF, emissive: 0x222222});
const neptuneMesh = new THREE.Mesh(sphereGeometry, neptuneMaterial);
Scene.add(neptuneMesh);
neptuneMesh.scale.set(2, 2, 2);
neptuneOrbit.add(neptuneMesh);
objects.push(neptuneMesh);

Camera.lookAt(0, 0, 0)


const Controls = new OrbitControls(Camera, Renderer.domElement)

let Time = Date.now()

AnimationLoop()

function AnimationLoop(){
    let ThisTime = Date.now()
    let deltaTime = ThisTime - Time
    Time = ThisTime;
        objects.forEach((obj)=> {
            obj?.rotateY(0.001 * deltaTime);
        })
    Renderer.render(Scene, Camera)
    requestAnimationFrame(AnimationLoop)

}
