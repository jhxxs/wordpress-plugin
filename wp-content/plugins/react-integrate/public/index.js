window.addEventListener("hashchange", hilightSubMenu)
document.addEventListener("DOMContentLoaded", hilightSubMenu)

function hilightSubMenu() {
  console.log("🥰 haschange")

  const currentHash = window.location.hash
  if (!currentHash) return

  const submenuLinks = document.querySelectorAll(
    "#toplevel_page_promoware li a"
  )

  console.log({ currentHash, submenuLinks })

  submenuLinks.forEach((link, index) => {
    const href = link.getAttribute("href")
    if (index == 0) {
      link.parentElement.classList.remove("current")
    }

    if (href && href.includes(currentHash)) {
      console.log("🚀 ~ href:", href)
      // Add the 'current' class to the parent li element
      link.parentElement.classList.add("current")

      // Also, add classes to open the parent top-level menu item
      const menuTop = document.querySelector("#toplevel_page_promoware")
      if (menuTop) {
        menuTop.classList.add("wp-has-current-submenu", "wp-menu-open")
      }
    }
  })
}
