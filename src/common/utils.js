// import { positionsData } from "../data/position-data"

// export const getDeviceAppropriateData = (name) => {
//   const data = positionsData.find((element) => element.name === name)

//   if (window.innerWidth > window.innerHeight) {
//     return data.desktop
//   } else {
//     return data.mobile
//   }
// }

export const el = (selector) => {
  return document.querySelector(selector)
}
