import * as THREE from "three"
import EventBus from "eventing-bus"
import gsap from "gsap"
import HDRbg from "../static/hdr_500.hdr"
import Stats from "stats-js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { constants, setAssetsLoaded, setThreeScene, getModel, setModel, setOrbitControls, getCamera, setCamera } from "./model"
import { createOrbitPositionTestSphere } from "./common/test-sphere"

const showOrbitTestSphere = false,
  directional1Position = [5, 30, 3],
  envMapExposure = 0.3,
  directionali1Intensity = 1,
  ambientIntensity = 1,
  canvasContainer = document.querySelector(".canvas-container"),
  modelSrc = "model-01/model-53.glb"

let canvas = null,
  fov = null,
  scene = null,
  renderer = null,
  camera = null,
  controls = null,
  pmremGenerator = null,
  sizes = null,
  camPos = [-40, 25, 60],
  controlsPos = [5, 8, -5]

let sun = null,
  planets01 = null,
  planets02 = null,
  planets03 = null,
  fanMotor = null,
  blades = null

/**
 * Loaders
 */
const stats = new Stats()

const statsEl = document.querySelector("#stats-container")
statsEl.appendChild(stats.dom)

let loadingStarted = false
const loadingManager = new THREE.LoadingManager(
  () => {
    setAssetsLoaded()
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal
    loadingStarted = true
    document.querySelector(".progress-text").innerHTML = Math.round(progressRatio * 100) + "%"
  }
)

let fakeLodingProgress = 0
const incrementLoading = () => {
  if (!loadingStarted) {
    if (fakeLodingProgress < 30) requestAnimationFrame(incrementLoading)
  }
  const newNum = fakeLodingProgress++
  document.querySelector(".progress-text").innerHTML = newNum + "%"
}
requestAnimationFrame(incrementLoading)

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

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.enabled = true
  renderer.shadowMapSoft = true
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(sizes.width, sizes.height)
  renderer.setClearColor(0xbbdbc1, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = envMapExposure

  fov = window.innerWidth < 600 ? 45 : 30
  camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, 3000)
  camera.position.set(camPos[0], camPos[1], camPos[2])
  scene.add(camera)
  setCamera(camera)

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enablePan = false
  controls.target.set(controlsPos[0], controlsPos[1], controlsPos[2])
  setOrbitControls(controls)

  pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()
}

const loadLights = () => {
  new RGBELoader().setDataType(THREE.UnsignedByteType).load(HDRbg, function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture
    scene.environment = envMap
    texture.dispose()
    pmremGenerator.dispose()
    texture.encoding = THREE.RGBEEncoding
    setTimeout(() => {
      loadModel()
    }, 100)
  })

  const directional1 = new THREE.DirectionalLight("#ffffff", directionali1Intensity)
  directional1.position.set(directional1Position[0], directional1Position[1], directional1Position[2])
  scene.add(directional1)

  let ambient = new THREE.AmbientLight(0xffffff, ambientIntensity)
  scene.add(ambient)
}

/**
 * Model
 */

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("draco/")

const loadModel = () => {
  // Particles
  const textureLoader = new THREE.TextureLoader(),
    particleTexture = textureLoader.load("/star-particle.png"),
    particlesGeometry = new THREE.BufferGeometry(),
    count = 10000,
    positions = new Float32Array(count * 3)

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 300
  }

  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  const particlesMaterial = new THREE.PointsMaterial()
  particlesMaterial.size = 0.8
  particlesMaterial.sizeAttenuation = true
  particlesMaterial.transparent = true
  particlesMaterial.alphaMap = particleTexture

  const particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)

  if (showOrbitTestSphere) createOrbitPositionTestSphere()

  const gltfLoader = new GLTFLoader(loadingManager)
  gltfLoader.setDRACOLoader(dracoLoader)

  gltfLoader.load(modelSrc, (gltf) => {
    let model = gltf.scene
    scene.add(model)
    setModel(model)

    model.position.set(0, 0, 0)
    model.scale.set(3, 3, 3)
    model.traverse(function (child) {
      if (child.name === "Planets01") planets01 = child
      if (child.name === "Planets02") planets02 = child
      if (child.name === "Planets03") planets03 = child
      if (child.isMesh && child.geometry) {
        if (child.name === "Sun") sun = child
        if (child.name === "FanMotor") fanMotor = child
        if (child.name === "Blades") blades = child
      }
    })

    /**
     * Animation
     */

    gsap.from(getCamera().position, { duration: 2, z: 1000, delay: 0, ease: "power4.out" })
    gsap.fromTo(
      getModel().rotation,
      { y: -0.3 },
      {
        duration: 3.2,
        y: 0.4,
        ease: "power4.out",
        onComplete: () => {
          controls.minAzimuthAngle = -1.25
          controls.maxAzimuthAngle = 0.4
          controls.minPolarAngle = 1
          controls.maxPolarAngle = 1.6
          controls.minDistance = 55
          controls.maxDistance = 100
        },
      }
    )
    gsap.fromTo(fanMotor.rotation, { y: 1.7 }, { duration: 6, y: 0, yoyo: true, repeat: -1, ease: "none" })
  })
}

/**
 * Tick
 */

const tick = () => {
  window.requestAnimationFrame(tick)
  controls.update()
  renderer.render(scene, camera)
  stats.update()

  planets01.rotation.y += 0.0003
  planets02.rotation.y -= 0.003
  planets03.rotation.y += 0.002

  sun.rotation.y -= 0.003
  blades.rotation.y += 0.15
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

EventBus.on(constants.ASSETS_LOADED, handleAssetsLoaded)
