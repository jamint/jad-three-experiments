import EventBus from "eventing-bus"
import gsap from "gsap"
import { constants, getCurrSection, setCurrScene } from "../model"

const viewEl = document.querySelector("#loading-view")

/**
 * Event handlers
 */

const handleAssetsLoaded = () => {
  gsap.to(viewEl, { duration: 0.3, opacity: 0, onComplete: () => viewEl.classList.remove("show") })
}

EventBus.on(constants.ASSETS_LOADED, handleAssetsLoaded)
