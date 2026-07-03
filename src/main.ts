import './styles.css'
import { fetchSeatsLeft, updateSeatsDisplay, CONFIG } from './config'
import { initCountdown } from './modules/countdown'
import { initPrizeCounter } from './modules/prize-counter'
import { initReveal } from './modules/reveal'
import { initStickyCta } from './modules/sticky-cta'
import { initShip } from './modules/ship'
import { initForm } from './modules/form'
import { initComets } from './modules/comets'
import { initStars } from './modules/stars'

document.addEventListener('DOMContentLoaded', () => {
  updateSeatsDisplay(CONFIG.DEFAULT_SEATS_LEFT)
  fetchSeatsLeft().then(updateSeatsDisplay)

  initCountdown()
  initPrizeCounter()
  initReveal()
  initStickyCta()
  initShip()
  initForm()
  initComets()
  initStars()
})
