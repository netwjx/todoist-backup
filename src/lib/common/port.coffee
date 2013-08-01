((definition)->
  if exports?
    definition undefined, exports
  else if window?
    definition undefined, window
  
)((r, exports)->
  if require?
    timers = require 'timers'
    @[n] = v for n, v of timers

  class Port
    constructor: (@port)->

    emit: (type, args, callback)->
      if typeof args is 'function'
        [callback, args] = [args, []]

      if callback
        cb = "cb#{ +new Date() }_#{ Math.random()*1000|0 }"
        @once cb, callback

      @port.emit type, {cb, args}

    on: (type, listener)->
      self = @
      handle = ({cb, args})->
        listener.call this, args, (args, ccallback)->
          self.emit cb, args, ccallback if cb

      @port.on type, handle
      ()=>
        @port.removeListener type, handle

    once: (type, listener)->
      offListener = @on type, ->
        offListener()
        listener.apply @, Array.prototype.slice.call arguments, 0
  
  exports.Port = Port
)