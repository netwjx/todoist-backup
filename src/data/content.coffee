port = new Port self.port

top_icons = document.getElementById 'top_icons'
if top_icons
  link = document.createElement 'a'
  link[prop] = val for prop, val of {
    id: 'Backup'
    innerHTML: '备份'
    href: '#Backup'
  }
  link.addEventListener 'click', (e)->
    port.emit 'openSaveFileDialog', {
      title: '选择文件'
      mode: 'save'
      defaultExtension: 'json'
      defaultString: "todoist_backup_#{ new Date().toISOString().replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).+/g, '$1$2$3_$4$5$6') }"
    }, (path, callback)->
      console.log path
      setTimeout ->
        callback 'bar'
      , 3000



    # TODO
    e.preventDefault()
    e.stopPropagation()

  top_icons.parentNode.insertBefore link, top_icons