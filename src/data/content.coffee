top_icons = document.getElementById 'top_icons'
if top_icons
  link = document.createElement 'a'
  link[prop] = val for prop, val of {
    id: 'Backup'
    innerHTML: 'Backup'
    href: '#Backup'
  }
  link.addEventListener 'click', (e)->
    alert 'hello world'
    # TODO
    e.preventDefault()
    e.stopPropagation()

  top_icons.parentNode.insertBefore link, top_icons