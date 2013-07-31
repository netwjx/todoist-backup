{Cc, Ci} = require 'chrome'
_ = require('sdk/l10n').get
pm = require 'page-mod'
self = require 'self'
notes = require 'notifications'
Port = (require './common/port').Port
simplePrefs = require 'sdk/simple-prefs'

class AsyncQueue
  constructor: (queues...)->
    @q = queues

  push: (funcs...)->
    @q.push.apply @q, funcs

  pop: ()->
    func = @q.shift()
    if func
      func.call @, =>
        @pop()
    else
      @onfinish?()

pm.PageMod
  include: 'https://todoist.com/app*'
  contentScriptWhen: 'ready'
  contentStyleFile: self.data.url 'content.css'
  contentScriptFile: (self.data.url i for i in [
    'common/port.js'
    'content.js'
  ])
  onAttach: (worker)->
    savePath = null
    port = new Port worker.port
    port.on type, listener for type, listener of {
      openSaveFileDialog: (args, callback)->
        nsIFilePicker = Ci.nsIFilePicker
        filePicker = Cc['@mozilla.org/filepicker;1'].createInstance nsIFilePicker
        filePicker.init Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator).getMostRecentWindow(null),
          '选择备份到的文件路径',
          nsIFilePicker.modeSave
        filePicker.appendFilter 'JSON (*.json)', '*.json'
        filePicker.defaultExtension = 'json'
        filePicker.defaultString = "todoist_backup#{ new Date().toISOString().replace(/[-:]|(\.\d+Z$)/g, '').replace('T', '_') }"
        defaultDir = simplePrefs.prefs['defaultBackupDirectory']
        console.log 'openSaveFileDialog defaultDir:', defaultDir
        if defaultDir
          dir = Cc['@mozilla.org/file/local;1'].createInstance Ci.nsILocalFile
          dir.initWithPath defaultDir
          filePicker.displayDirectory = dir
        if filePicker.show() in [nsIFilePicker.returnOK, nsIFilePicker.returnReplace]
          file = filePicker.file
          defaultDir = file.parent.path
          savePath = file.path
          simplePrefs.prefs['defaultBackupDirectory'] = defaultDir
          savePath += '.json' if not savePath.endsWith '.json'
          console.log 'openSaveFileDialog savePath:', savePath, 'defaultDir:', defaultDir
        callback savePath

      getAPIToken: (args, callback)->
        apiToken = simplePrefs.prefs['apiToken']
        console.log 'getAPIToken apiToken:', apiToken
        callback if /[0-9a-f]/.test apiToken then apiToken else null

      backup: (apiToken)->
        if apiToken
          simplePrefs.prefs['apiToken'] = apiToken
        else
          apiToken = simplePrefs.prefs['apiToken']

        console.log 'backup apiToken:', apiToken, 'savePath:', savePath

        if apiToken and savePath
          console.log 'backup starting'
          [path, savePath] = [savePath, null]

          result = null
          api = new (require './todoist-api').API apiToken
          queue = new AsyncQueue (done)->
            api.getProjects (data)->
              console.log "Got #{ data.length }'s projects"
              result = data
              for p in data
                do (p)->
                  queue.push (done)->
                    api.getUncompletedItems p.id (data)->
                      console.log "Got project #{ p.name } uncompleted items"
                      p.uncompleted_items = data
                      done()
                  , (done)->
                    api.getCompletedItems p.id (data)->
                      console.log "Got project #{ p.name } completed items"
                      p.completed_items = data
                      done()
              done()

          queue.onfinish = ->
            console.log 'Got finished'
            if result
              text = (require './beautify').js_beautify JSON.stringify result
              try
                ws = (require 'file').open path, 'w'
                ws.write text
              finally
                ws?.close()
                ws = null

              notes.notify
                title: '备份完成'
                text: "路径: #{ path }"

          queue.pop()

    }
