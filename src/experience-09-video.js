import * as THREE from "three"

const videosArr = [
  { src: "havas-h/video/grammys-sm.mp4", repeatX: 0.5, repeatY: 1 },
  { src: "havas-h/video/dos-equis-sm.mp4", repeatX: 0.5, repeatY: 1 },
  { src: "havas-h/video/riteaid-sm.mp4", repeatX: 0.5, repeatY: 1 },
  { src: "havas-h/video/adp-sm.mp4", repeatX: 0.5, repeatY: 1 },
  { src: "havas-h/video/tda-blockchain-smss.mp4", repeatX: 0.5, repeatY: 1 },
  { src: "havas-h/video/tda-lionelrichie-sm.mp4", repeatX: 0.5, repeatY: 1 },
  { src: "havas-h/video/lacoste-sm.mp4", repeatX: 0.5, repeatY: 1 },
  { src: "havas-h/video/film-fest-sm.mp4", repeatX: 0.5, repeatY: 1 },
  { src: "havas-h/video/keurig-sm.mp4", repeatX: 0.5, repeatY: 1 },
  { src: "havas-h/video/adidas-sm.mp4", repeatX: 0.5, repeatY: 1 },
]

export const addVideos = (meshes) => {
  const videoContainer = document.getElementById("video-container")

  meshes.forEach((videoMesh, i) => {
    const video = document.createElement("video")
    video.src = videosArr[i].src
    video.style.display = "none"

    video.addEventListener(
      "canplay",
      function () {
        video.autoplay = true
        video.controls = false
        video.muted = true
        video.loop = true
        video.play()

        videoContainer.appendChild(video)

        const videoTexture = new THREE.VideoTexture(video)
        videoTexture.needsUpdate = true
        videoTexture.repeat.set(videosArr[i].repeatX, videosArr[i].repeatY)
        videoTexture.center = new THREE.Vector2(0, 0)
        videoTexture.encoding = THREE.sRGBEncoding

        const videoMaterial = new THREE.MeshStandardMaterial({
          map: videoTexture,
          side: THREE.FrontSide,
          toneMapped: false,
          roughness: 0.2,
        })
        videoMaterial.needsUpdate = true
        meshes[i].material = videoMaterial
      },
      true
    )
  })
}
