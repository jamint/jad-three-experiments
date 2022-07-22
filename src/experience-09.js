import * as THREE from "three"
import EventBus from "eventing-bus"
import gsap from "gsap"
import HDRbg from "../static/hdr_500.hdr"
import Stats from "stats-js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { addText } from "./scripts/utils/fonts"
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
import { addVideos } from "./experience-09-video"
import { createPointLight } from "./scripts/utils/lights"

const textureLoader = new THREE.TextureLoader(),
  directional1Position = [3, 20, 5],
  directionali1Intensity = 0.5,
  envMapExposure = 0.6,
  canvasContainer = document.querySelector(".canvas-container"),
  modelSrc = "havas-h/havas-01.glb",
  modelGroup = new THREE.Group()

let canvas = null,
  // fov = 5,
  fov = 60,
  camPos = [0, 0, 14],
  minPolarAngle = 1.7,
  maxPolarAngle = 1.7,
  scene = null,
  renderer = null,
  camera = null,
  controls = null,
  pmremGenerator = null,
  sizes = null,
  // camPos = [0, 0, 150],
  controlsPos = [0, 0, 0],
  model = null,
  secondHand = null,
  minuteHand = null,
  hourHand = null,
  cameraGroup = null,
  int = null,
  one = null,
  two = null,
  thr = null,
  four = null

/**
 * Loaders
 */
const stats = new Stats()
let fakeLodingProgress = 0

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

  // fov = window.innerWidth < 600 ? 45 : 30
  camera = new THREE.PerspectiveCamera(
    fov,
    sizes.width / sizes.height,
    0.1,
    3000
  )
  camera.position.set(camPos[0], camPos[1], camPos[2])
  cameraGroup.add(camera)
  setCamera(camera)

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enablePan = false
  // controls.enableZoom = false
  // controls.target.set(controlsPos[0], controlsPos[1], controlsPos[2])
  // controls.minAzimuthAngle = -1
  // controls.maxAzimuthAngle = 1
  controls.minPolarAngle = minPolarAngle
  controls.maxPolarAngle = maxPolarAngle
  setOrbitControls(controls)

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
  scene.add(directional1)

  // const ambientIntensity = 0.8,
  //   ambient = new THREE.AmbientLight(0xffffff, ambientIntensity)
  // scene.add(ambient)

  // const inten = 0.3
  // // const pointLight1 = createPointLight(inten)
  // const pointLight2 = createPointLight(inten)
  // const pointLight3 = createPointLight(inten)
  // // const pointLight4 = createPointLight(inten)
  // // pointLight1.position.set(4, -4, -2)
  // pointLight2.position.set(-4, 4, -2)
  // pointLight3.position.set(2, -6, 6)
  // // pointLight4.position.set(-4, -4, 6)
}

/**
 * Load Model
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("draco/")

const loadModel = () => {
  const gltfLoader = new GLTFLoader(loadingManager)
  gltfLoader.setDRACOLoader(dracoLoader)

  gltfLoader.load(modelSrc, (gltf) => {
    model = gltf.scene
    /**
     * Uncomment later to put model back in
     */
    //
    scene.add(modelGroup)
    modelGroup.add(model)
    setModel(model)

    // modelGroup.position.set(0, 0, 0)
    // modelGroup.rotation.x = -0.1
    modelGroup.rotation.y = 0.2

    model.traverse(function (child) {
      child.castShadow = true
      child.receiveShadow = true

      if (child.name === "01") one = child
      if (child.name === "02") two = child
      if (child.name === "03") thr = child
      if (child.name === "04") four = child
    })
    const meshes = [one, two, thr, four]
    addVideos(meshes)

    // Color
    // var targetColor = new THREE.Color(0xcdcc64)
    // gsap.to(faceBack.material.color, {
    //   duration: 3,
    //   r: targetColor.r,
    //   g: targetColor.g,
    //   b: targetColor.b,
    //   repeat: -1,
    //   yoyo: true,
    //   ease: "power2.inOut",
    // })

    let duration = 1.7
    gsap.from(model.position, {
      duration,
      z: -10,
      ease: "power4.out",
    })
    gsap.from(model.scale, {
      duration: (duration += 0.5),
      x: 0.1,
      y: 0.1,
      z: 0.1,
      ease: "power4.out",
    })
    gsap.from(model.rotation, {
      duration,
      y: -Math.PI * 2,
      ease: "power4.out",
    })
  })
}

/**
 * Tick
 */
const clock = new THREE.Clock()
let previousTime = 0
let speedPosY = 0,
  speedRotY = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  controls.update()

  renderer.render(scene, camera)
  stats.update()

  // x-axis
  // console.log(controls.getPolarAngle())
  // y-axis
  console.log(controls.getAzimuthalAngle())

  // const parallaxX = cursor.x * 0.1
  // const parallaxY = -cursor.y * 0.1

  // modelGroup.position.y += Math.sin(deltaTime * Math.PI) * 0.01
  const distPosY = 0.04
  const distRotY = 0.2

  // modelGroup.position.y = distPosY * Math.cos(speedPosY)
  modelGroup.rotation.y = distRotY * Math.cos(speedRotY)

  speedPosY += 0.01
  speedRotY += 0.005

  // gear1.rotation.z += 0.02
  // faceAlpha.rotation.z += 0.1 * deltaTime
  // faceAlpha2.rotation.z -= 0.01 * deltaTime

  // one.rotation.z -= 0.3 * deltaTime
  // two.rotation.z += 0.3 * deltaTime

  // if (mesh) {
  //   mesh.rotation.x += 0.01
  //   mesh.rotation.y += 0.01
  // }

  // modelGroup.position.x -= (parallaxX - cameraGroup.position.x) * 2 * deltaTime
  // modelGroup.position.y -= (parallaxY - cameraGroup.position.y) * 2 * deltaTime

  // modelGroup.rotation.y -= (parallaxX - cameraGroup.position.x) * 8 * deltaTime
  // modelGroup.rotation.x += (parallaxY - cameraGroup.position.y) * 2 * deltaTime

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
