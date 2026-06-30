const body = document.body
const visionButtons = document.querySelectorAll('[data-vision-toggle]')
const menuButton = document.querySelector('[data-menu-toggle]')
const mobileMenu = document.querySelector('#mobile-menu')
const printButton = document.querySelector('[data-print]')
const searchInput = document.querySelector('[data-search]')
const searchStatus = document.querySelector('[data-search-status]')
const sections = [...document.querySelectorAll('[data-official-section]')]
const searchableItems = [...document.querySelectorAll('.official-section, .mini-section, .document-item, .info-card, .notice-card, .person-card, .teacher-placeholder')]
const navLinks = [...document.querySelectorAll('.section-nav a')]

const savedVisionMode = localStorage.getItem('aso-vision-mode')
if (savedVisionMode === 'enabled') {
  body.classList.add('accessible-mode')
}

function syncVisionLabels() {
  const enabled = body.classList.contains('accessible-mode')
  visionButtons.forEach((button) => {
    button.textContent = enabled ? 'Обычная версия' : 'Версия для слабовидящих'
  })
}

syncVisionLabels()

visionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    body.classList.toggle('accessible-mode')
    localStorage.setItem('aso-vision-mode', body.classList.contains('accessible-mode') ? 'enabled' : 'disabled')
    syncVisionLabels()
  })
})

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.hasAttribute('hidden')
    mobileMenu.toggleAttribute('hidden', !isOpen)
    menuButton.setAttribute('aria-expanded', String(isOpen))
  })

  mobileMenu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      mobileMenu.setAttribute('hidden', '')
      menuButton.setAttribute('aria-expanded', 'false')
    }
  })
}

if (printButton) {
  printButton.addEventListener('click', () => window.print())
}

function normalize(value) {
  return value.toLowerCase().replaceAll('ё', 'е').trim()
}

function applySearch() {
  const query = normalize(searchInput.value)
  if (!query) {
    searchableItems.forEach((item) => item.classList.remove('is-hidden-by-search'))
    searchStatus.textContent = ''
    return
  }

  let matches = 0
  searchableItems.forEach((item) => {
    const text = normalize(item.textContent || '')
    const found = text.includes(query)
    item.classList.toggle('is-hidden-by-search', !found)
    if (found) matches += 1
  })

  searchStatus.textContent = matches
    ? `Найдено совпадений: ${matches}`
    : 'Ничего не найдено. Попробуйте другой запрос.'
}

if (searchInput && searchStatus) {
  searchInput.addEventListener('input', applySearch)
}

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

    if (!visible) return

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`)
    })
  },
  {
    rootMargin: '-32% 0px -58% 0px',
    threshold: [0.1, 0.35, 0.6],
  },
)

sections.forEach((section) => observer.observe(section))
