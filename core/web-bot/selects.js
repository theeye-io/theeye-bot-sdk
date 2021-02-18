
module.exports = {
  selectOptionByTextWithId: (page, id, text) => {
    return page.evaluate(({ id, text }) => {
      const select = document.getElementById(id)
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].text === text) {
          select.selectedIndex = i
        }
      }
    }, { id, text })
  },

  selectOptionByTextWithSelector: (page, selector, text) => {
    return page.evaluate(({ selector, text }) => {
      const select = document.querySelector(selector)
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].text === text) {
          select.selectedIndex = i
        }
      }
    }, { selector, text })
  }
}
