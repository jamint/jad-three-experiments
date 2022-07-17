import * as THREE from "three"
import EventBus from "eventing-bus"
import gsap from "gsap"
import HDRbg from "../static/hdr_500.hdr"
// import HDRbg from "../static/hdr/studio_small_03_4k.hdr"
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

import { createPointLight } from "./scripts/utils/lights"

const textureLoader = new THREE.TextureLoader(),
  directional1Position = [1, 20, 3],
  directionali1Intensity = 1,
  envMapExposure = 0.6,
  // envMapExposure = 1,
  canvasContainer = document.querySelector(".canvas-container"),
  modelSrc = "model-06/watch-06-c.glb",
  // modelSrc = "model-05/watches-01-b.glb",
  modelGroup = new THREE.Group()
// days = ["SUN", "MON", "TUE", "WED", "THU", "F R I", "SAT"]

let canvas = null,
  fov = 15,
  scene = null,
  renderer = null,
  camera = null,
  controls = null,
  pmremGenerator = null,
  sizes = null,
  camPos = [0, 0, 23],
  controlsPos = [0, 0, 0],
  model = null,
  secondHand = null,
  minuteHand = null,
  hourHand = null,
  cameraGroup = null,
  mesh = null,
  // gear0 = null,
  // gear1 = null
  // gear2 = null,
  // gear3 = null,
  faceAlpha = null

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

  // fov = window.innerWidth < 600 ? 45 : 30
  // fov = 20
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
  controls.enableZoom = false
  // controls.target.set(controlsPos[0], controlsPos[1], controlsPos[2])
  // controls.minAzimuthAngle = -1
  // controls.maxAzimuthAngle = 1
  // controls.minPolarAngle = 1.1
  // controls.maxPolarAngle = 1.8
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
        loadHTMLCanvas()
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

  // const ambientIntensity = 0.3,
  //   ambient = new THREE.AmbientLight(0xffffff, ambientIntensity)
  // scene.add(ambient)

  // const inten = 1
  // const pointLight1 = createPointLight(inten)
  // const pointLight2 = createPointLight(inten)
  // const pointLight3 = createPointLight(inten)
  // const pointLight4 = createPointLight(inten)
  // pointLight1.position.set(4, -4, -2)
  // pointLight2.position.set(-4, 4, -2)
  // pointLight3.position.set(4, 4, 6)
  // pointLight4.position.set(-4, -4, 6)
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

    scene.add(modelGroup)
    modelGroup.add(model)
    setModel(model)

    modelGroup.position.set(0, 0, 0)
    modelGroup.rotation.x = -0.1
    modelGroup.rotation.y = 0.1

    model.traverse(function (child) {
      child.castShadow = true
      child.receiveShadow = true

      // if (child.name === "Gear0") gear0 = child
      if (child.name === "Face") faceAlpha = child
      // if (child.name === "Gear2") gear2 = child
      // if (child.name === "Gear3") gear3 = child

      if (child.name === "SecondHand") secondHand = child
      if (child.name === "MinuteHand") minuteHand = child
      if (child.name === "HourHand") hourHand = child

      // })
      // startClock()
      // const date = String(new Date().getDate())
      // // addText(modelGroup, date, {
      // //   x: 0.45,
      // //   y: 0.02,
      // //   z: 1.3,
      // })

      // const day = days[new Date().getDay()]

      // // addText(modelGroup, day, {
      // //   x: -0.387,
      // //   y: 0.02,
      // //   z: 1.3,
    })
    startClock()
    let duration = 1.7
    gsap.from(modelGroup.position, {
      duration,
      x: -10,
      ease: "power4.out",
    })
    gsap.from(modelGroup.scale, {
      duration: (duration += 0.5),
      x: 0.1,
      y: 0.1,
      z: 0.1,
      ease: "power4.out",
    })
    gsap.from(modelGroup.rotation, {
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

  // const parallaxX = cursor.x * 0.1
  // const parallaxY = -cursor.y * 0.1

  // modelGroup.position.y += Math.sin(deltaTime * Math.PI) * 0.01
  const distPosY = 0.04
  const distRotY = 0.1

  // modelGroup.position.y = distPosY * Math.cos(speedPosY)
  // modelGroup.rotation.y = distRotY * Math.cos(speedRotY)

  speedPosY += 0.01
  speedRotY += 0.005

  // gear1.rotation.z += 0.02
  faceAlpha.rotation.z += 0.001

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

/**
 * Time
 */
const setTime = () => {
  const current = new Date(),
    minuteTickDistance = (Math.PI * 2) / 60,
    hourTickDistance = (Math.PI * 2) / 12

  const percOfMinute = current.getSeconds() / 60
  const percOfHour = current.getMinutes() / 60

  // secondHand.rotation.z = -Math.PI * 2 * (current.getSeconds() / 60)
  gsap.to(secondHand.rotation, {
    duration: 0.3,
    z: -Math.PI * 2 * (current.getSeconds() / 60),
    ease: "elastic.out(1, 0.6)",
  })
  minuteHand.rotation.z =
    -current.getMinutes() * minuteTickDistance -
    minuteTickDistance * percOfMinute
  hourHand.rotation.z =
    -current.getHours() * hourTickDistance - hourTickDistance * percOfHour

  // console.log(gear0)
  // gsap.to(gear0.rotation, {
  //   duration: 0.1,
  //   z: -Math.PI * 2 * (current.getSeconds() / 60),
  // })
  // gear1.rotation.z += 0.01
}

const startClock = () => {
  setInterval(() => {
    setTime()
  }, 1000)
  setTime()
}

const loadHTMLCanvas = () => {
  // const drawingCanvas = document.getElementById("drawing-canvas")
  // const drawingContext = drawingCanvas.getContext("2d")
  // const material = new THREE.MeshStandardMaterial()
  // material.map = new THREE.CanvasTexture(drawingCanvas)
  // renderer.capabilities.getMaxAnisotropy()
  // material.map.minFilter = THREE.LinearFilter
  // drawingContext.fillStyle = "#00FF00"
  // drawingContext.fillRect(0, 0, 256, 256)
  // drawingContext.width = 256
  // drawingContext.height = 256
  // drawingContext.beginPath()
  // drawingContext.moveTo(0, 0)
  // drawingContext.lineTo(50, 20)
  // drawingContext.stroke()
  // // material.map.needsUpdate = true
  // const g = new THREE.PlaneGeometry(5, 5)
  // const m = new THREE.MeshBasicMaterial({ color: 0x0000ff })
  // const c = new THREE.Mesh(g, material)
  // scene.add(c)
}
