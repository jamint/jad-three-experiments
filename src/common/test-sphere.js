import * as THREE from "three"
import { getThreeScene, getOrbitControls } from "../model"

let sphereMesh = null

export const createOrbitPositionTestSphere = () => {
  const geometry = new THREE.SphereGeometry(2, 10, 10)
  const material = new THREE.MeshStandardMaterial({ color: 0xffff00 })
  sphereMesh = new THREE.Mesh(geometry, material)

  sphereMesh.scale.set(0.2, 0.2, 0.2)
  getThreeScene().add(sphereMesh)

  start()
}

const start = () => {
  const c = getOrbitControls()
  const tick = () => {
    sphereMesh.position.set(c.target.x, c.target.y, c.target.z)
    requestAnimationFrame(tick)
  }
  tick()
}
