import EventBus from "eventing-bus"

const START_EXPERIENCE = "startExperience",
  SCENE_CHANGED = "sceneChanged",
  ASSETS_LOADED = "assetsLoaded",
  START_ANIMATION = "startAnimation"

let currScene = 0,
  isTesting = false,
  modelsArr = [],
  threeScene = null,
  camera = null,
  currHotspot = null,
  orbitControls = null,
  animatedObjectsArr = [],
  guitar = null,
  isMouseOrbitMove = false

export const getIsTesting = () => {
  return isTesting
}

export const setIsTesting = (bool) => {
  isTesting = bool
}

export const setAssetsLoaded = () => {
  console.log("loaded...")
  EventBus.publish(ASSETS_LOADED)
}

export const getModelsArr = () => {
  return modelsArr
}

export const setModelsArr = (arr) => {
  modelsArr = arr
}

export const getCurrScene = () => {
  return currScene
}

export const setCurrScene = (scn) => {
  currScene = scn
  EventBus.publish(SCENE_CHANGED)
}

export const getThreeScene = () => {
  return threeScene
}

export const setThreeScene = (scn) => {
  threeScene = scn
}

export const getIsDesktop = () => {
  return window.innerWidth > window.innerHeight
}

export const getCamera = () => {
  return camera
}

export const setCamera = (cam) => {
  camera = cam
}

export const getOrbitControls = () => {
  return orbitControls
}

export const setOrbitControls = (cont) => {
  orbitControls = cont
}

export const getAnimatedObjectsArr = () => {
  return animatedObjectsArr
}

export const setAnimatedObjectsArr = (arr) => {
  animatedObjectsArr = arr
}

export const getCurrHotspot = () => {
  return currHotspot
}

export const setCurrHotspot = (hotspot) => {
  currHotspot = hotspot
}

export const getGuitar = () => {
  return guitar
}

export const setGuitar = (gtr) => {
  guitar = gtr
}

export const getMouseOrbitMove = () => {
  return isMouseOrbitMove
}

export const setMouseOrbitMove = (bool) => {
  isMouseOrbitMove = bool
}

export const constants = { START_EXPERIENCE, SCENE_CHANGED, START_ANIMATION, ASSETS_LOADED }
