import * as THREE from "three"
import typefaceFont from "three/examples/fonts/helvetiker_regular.typeface.json"
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load("textures/matcaps/8.png"),
  fontLoader = new THREE.FontLoader()

export const addText = (obj, txt, pos) => {
  fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
    // const material = new THREE.MeshStandardMaterial({ matcap: matcapTexture })
    const material = new THREE.MeshStandardMaterial()
    material.metalness = 1

    //Text
    const textGeometry = new THREE.TextGeometry(txt, {
      font: font,
      size: 0.1,
      height: 0,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.005,
      bevelOffset: 0,
      bevelSegments: 3,
    })
    textGeometry.center()
    const text = new THREE.Mesh(textGeometry, material)
    text.position.x = pos.x
    text.position.y = pos.y
    text.position.z = pos.z
    obj.add(text)
  })
}
