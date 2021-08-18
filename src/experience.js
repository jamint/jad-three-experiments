import * as THREE from "three"
import EventBus from "eventing-bus"
import HDRbg from "../static/hdr_500.hdr"
import Stats from "stats-js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { constants, setAssetsLoaded, setThreeScene, setOrbitControls } from "./model"

import { createOrbitPositionTestSphere } from "./common/test-sphere"

const fov = 30,
  showOrbitTestSphere = false,
  directional1Position = [5, 30, 3],
  // envMapExposure = 0.5,
  // directionali1Intensity = 0.5,
  // ambientIntensity = 1,
  envMapExposure = 0.3,
  directionali1Intensity = 1,
  ambientIntensity = 1,
  canvasContainer = document.querySelector(".canvas-container"),
  modelSrc = "model-11/model-11.gltf"

let canvas = null,
  scene = null,
  renderer = null,
  camera = null,
  controls = null,
  mixer = null,
  pmremGenerator = null,
  sizes = null,
  delta = 0,
  clock = new THREE.Clock(),
  camPos = [-40, 25, 60],
  controlsPos = [5, 8, -5]

/**
 * Loaders
 */
const stats = new Stats()

const statsEl = document.querySelector("#stats-container")
statsEl.appendChild(stats.dom)

let sceneReady = false
const loadingManager = new THREE.LoadingManager(
  () => {
    setAssetsLoaded()
    sceneReady = true
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    // const progressRatio = itemsLoaded / itemsTotal
  }
)

const init = () => {
  /**
   * Reg
   */

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

  camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, 3000)
  camera.position.set(camPos[0], camPos[1], camPos[2])
  scene.add(camera)

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.target.set(controlsPos[0], controlsPos[1], controlsPos[2])
  setOrbitControls(controls)

  controls.addEventListener("change", (e) => {
    EventBus.publish("ORBIT_CHANGED", camera.position)
  })

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
  if (showOrbitTestSphere) createOrbitPositionTestSphere()

  const gltfLoader = new GLTFLoader(loadingManager)
  gltfLoader.setDRACOLoader(dracoLoader)

  gltfLoader.load(modelSrc, (gltf) => {
    let model = gltf.scene
    scene.add(model)

    model.position.set(0, 0, 0)
    model.scale.set(3, 3, 3)

    /**
     * Animation
     */

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene)
      scene.add(gltf.scene)
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play()
      })
    }
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

  // delta = clock.getDelta()
  // if (mixer) mixer.update(delta)
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
