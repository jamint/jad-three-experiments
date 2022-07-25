import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { getThreeScene, getCamera, getRenderer } from "../model"

let composer = null

const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0,
}

export const addUnrealBloom = () => {
  console.log(window.innerWidth)
  const renderScene = new RenderPass(getThreeScene(), getCamera())
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  )
  bloomPass.threshold = params.bloomThreshold
  bloomPass.strength = params.bloomStrength
  bloomPass.radius = params.bloomRadius

  composer = new EffectComposer(getRenderer())
  composer.addPass(renderScene)
  composer.addPass(bloomPass)

  tick()
}

const tick = () => {
  console.log("t")
  composer.render()
  window.requestAnimationFrame(tick)
}
