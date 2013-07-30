_ = require('sdk/l10n').get
pm = require 'page-mod'
self = require 'self'
notes = require 'notifications'
Port = (require './common/port').Port

contextEvents = 
  # notify: (opts)->
  #   notes.notify opts
  #   @done()

  # error: (opts)->
  #   notes.notify
  #     title: _ 'Error'
  #     text: opts
  #   @done()
  openSaveFileDialog: (args, callback)->
    # TODO
    callback '/foo/bar', (args)->
      console.log 'callback\'s callback' + args
  


pm.PageMod
  include: 'https://todoist.com/app*'
  contentScriptWhen: 'ready'
  contentStyleFile: self.data.url 'content.css'
  contentScriptFile: (self.data.url i for i in [
    'common/port.js'
    'content.js'
  ])
  onAttach: (worker)->
    port = new Port worker.port
    for name, func of contextEvents
      port.on name, func
    return
  
  

