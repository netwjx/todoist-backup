port = new Port self.port

top_icons = document.getElementById 'top_icons'
if top_icons
  link = document.createElement 'a'
  link[prop] = val for prop, val of {
    id: 'backup'
    innerHTML: '备份'
    href: '#'
  }
  link.addEventListener 'click', (e)->
    port.emit 'openSaveFileDialog', ->
      port.emit 'backup'

    port.emit 'getAPIToken', (apiToken)->
      if not apiToken
        console.log 'Request API token'
        xhr = new XMLHttpRequest()
        xhr.onreadystatechange = ->
          if xhr.readyState is 4 and xhr.status is 200
            apiToken = /var TOKEN = "([0-9a-f]{40})";/.exec(xhr.responseText)[1]
            console.log 'Got API token', apiToken
            port.emit 'backup', apiToken
        xhr.open 'GET', 'https://todoist.com/Users/viewPrefs?page=account'
        xhr.send()
      else
        console.log 'Got API token', apiToken
        port.emit 'backup', apiToken

    e.preventDefault()
    e.stopPropagation()

  top_icons.parentNode.insertBefore link, top_icons