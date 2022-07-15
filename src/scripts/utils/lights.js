import * as THREE from "three"
import { getThreeScene } from "../../model"

export const createPointLight = (intensity) => {
  const pointLight = new THREE.PointLight(0xffffff, intensity, 50)
  pointLight.castShadow = true
  pointLight.shadow.bias = -0.0004
  pointLight.shadow.mapSize.width = 1024
  pointLight.shadow.mapSize.height = 1024
  getThreeScene().add(pointLight)
  const sphereSize = 0.5
  // const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize)
  // getThreeScene().add(pointLightHelper)
  return pointLight
}
