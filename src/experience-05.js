import * as THREE from "three"
import EventBus from "eventing-bus"
import gsap from "gsap"
import HDRbg from "../static/hdr_500.hdr"
import Stats from "stats-js"
// import { VRButton } from "three/examples/jsm/webxr/VRButton.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import {
  constants,
  setAssetsLoaded,
  setThreeScene,
  getModel,
  setModel,
  setOrbitControls,
  getCamera,
  setCamera,
} from "./model"

import { createPointLight } from "./scripts/utils/lights"

const textureLoader = new THREE.TextureLoader(),
  directional1Position = [1, 20, 3],
  directionali1Intensity = 0.3,
  envMapExposure = 0.4,
  canvasContainer = document.querySelector(".canvas-container"),
  modelSrc = "model-05/watches-01-b.glb"

let canvas = null,
  fov = null,
  scene = null,
  renderer = null,
  camera = null,
  controls = null,
  pmremGenerator = null,
  sizes = null,
  camPos = [0, 0, 15],
  controlsPos = [0, 0, 0],
  model = null,
  secondHand = null,
  minuteHand = null,
  cameraGroup = null

/**
 * Loaders
 */

const stats = new Stats()
let fakeLodingProgress = 0,
  int = null

const statsEl = document.querySelector("#stats-container")
statsEl.appendChild(stats.dom)

const loadingManager = new THREE.LoadingManager(
  () => {
    setAssetsLoaded()
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal
    clearInterval(int)
    document.querySelector(".progress-text").innerHTML =
      Math.round(progressRatio * 100) + "%"
  }
)
loadingManager.onStart = () => {
  int = setInterval(myTimer, 100)
}

const myTimer = () => {
  let random = Math.floor(Math.random() * 2)
  if (fakeLodingProgress < 80) {
    if (random === 0) {
      fakeLodingProgress++
      document.querySelector(".progress-text").innerHTML =
        fakeLodingProgress + "%"
    }
  }
}

/**
 * Init
 */
const init = () => {
  sizes = {
    width: canvasContainer.getBoundingClientRect().width,
    height: canvasContainer.getBoundingClientRect().height,
  }
  canvas = canvasContainer.querySelector("canvas.webgl")
  scene = new THREE.Scene()
  setThreeScene(scene)

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  })
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.enabled = true
  renderer.shadowMapSoft = true
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(sizes.width, sizes.height)
  renderer.setClearColor(0xbbdbc1, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = envMapExposure

  // document.body.appendChild(VRButton.createButton(renderer))
  // renderer.xr.enabled = true

  cameraGroup = new THREE.Group()
  scene.add(cameraGroup)

  fov = window.innerWidth < 600 ? 45 : 30
  camera = new THREE.PerspectiveCamera(
    fov,
    sizes.width / sizes.height,
    0.1,
    3000
  )
  camera.position.set(camPos[0], camPos[1], camPos[2])
  cameraGroup.add(camera)
  setCamera(camera)

  // controls = new OrbitControls(camera, canvas)
  // controls.enableDamping = true
  // controls.enablePan = false
  // controls.target.set(controlsPos[0], controlsPos[1], controlsPos[2])
  // setOrbitControls(controls)

  pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()
}

const loadLights = () => {
  new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .load(HDRbg, function (texture) {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture
      scene.environment = envMap
      texture.dispose()
      pmremGenerator.dispose()
      texture.encoding = THREE.RGBEEncoding
      setTimeout(() => {
        loadModel()
      }, 100)
    })

  const directional1 = new THREE.DirectionalLight(
    "#ffffff",
    directionali1Intensity
  )
  directional1.position.set(
    directional1Position[0],
    directional1Position[1],
    directional1Position[2]
  )
  directional1.shadow.bias = -0.0004
  directional1.castShadow = true
  // const helper = new THREE.DirectionalLightHelper(directional1, 5)
  // scene.add(helper)
  // scene.add(directional1)

  const ambientIntensity = 0.1,
    ambient = new THREE.AmbientLight(0xffffff, ambientIntensity)
  scene.add(ambient)

  // const pointLight1 = createPointLight(0.2)
  // const pointLight2 = createPointLight(0.2)
  // const pointLight3 = createPointLight(0.2)
  // const pointLight4 = createPointLight(0.2)
  // pointLight1.position.set(2, 4, -3)
  // pointLight2.position.set(-2, 4, -3)
  // pointLight3.position.set(2, 4, 3)
  // pointLight4.position.set(-2, 4, 3)
}

/**
 * Model
 */

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("draco/")

const loadModel = () => {
  const gltfLoader = new GLTFLoader(loadingManager)
  gltfLoader.setDRACOLoader(dracoLoader)

  gltfLoader.load(modelSrc, (gltf) => {
    model = gltf.scene

    scene.add(model)
    setModel(model)

    model.position.set(0, 0, 0)
    model.rotation.x = -0.2

    model.traverse(function (child) {
      child.castShadow = true
      child.receiveShadow = true

      if (child.name === "SecondHand") {
        secondHand = child
      }
      if (child.name === "MinuteHand") {
        minuteHand = child
      }
    })
  })
}

/**
 * Tick
 */

const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // controls.update()
  renderer.render(scene, camera)
  stats.update()

  secondHand.rotation.z -= 0.001
  minuteHand.rotation.z -= 0.00002

  const parallaxX = cursor.x * 0.6
  const parallaxY = -cursor.y * 0.6
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

  cameraGroup.rotation.y += (parallaxX - cameraGroup.position.x) * 8 * deltaTime
  cameraGroup.rotation.x -= (parallaxY - cameraGroup.position.y) * 2 * deltaTime

  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

/**
 * Resize
 */

const handleResize = () => {
  const w = canvasContainer.getBoundingClientRect().width
  const h = canvasContainer.getBoundingClientRect().height
  sizes.width = w
  sizes.height = h
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

/**
 * Initialization
 */

setTimeout(() => {
  init()
  loadLights()
}, 0)

const handleAssetsLoaded = () => {
  tick()
  window.addEventListener("resize", handleResize)
  handleResize()

  //   renderer.setAnimationLoop(function () {
  //     // // console.log('anim loop');
  //     // window.requestAnimationFrame(tick)
  //     // controls.update()
  //     // renderer.render(scene, camera)
  //     // stats.update()
  //     // delta = clock.getDelta()
  //     // renderer.render( scene, camera );
  //   })
}

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5
  cursor.y = event.clientY / sizes.height - 0.5
})

EventBus.on(constants.ASSETS_LOADED, handleAssetsLoaded)
