_ = require('sdk/l10n').get
pm = require 'page-mod'
self = require 'self'
notes = require 'notifications'

contextEvents = 
  notify: (opts)->
    notes.notify opts
    @done()

  error: (opts)->
    notes.notify
      title: _ 'Error'
      text: opts
    @done()
  # TODO

main = ->
  pm.PageMod
    include: 'https://todoist.com/app*'
    contentScriptWhen: 'ready'
    contentStyleFile: self.data.url 'content.css'
    contentScriptFile: self.data.url 'content.js'
    onAttach: (worker)->
      for name, func of contextEvents
        do (name, func)->
          worker.port.on name, (arg)->
            func.apply {
              done: ->
                worker.port.emit 'portEmitCallback', {
                  callback: arg.callback
                  args:[]
                }
            }, arg.args
      return
  
  

main()