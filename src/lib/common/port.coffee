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
      @timeout = 20

    emit: (type, args, callback)->
      if typeof args is 'function'
        [callback, args] = [args, []]

      if callback
        cb = 'cb' + (+new Date())
        offListener = @once cb, ->
          clearTimeout cbTimer
          callback.apply @, Array.prototype.slice.call arguments, 0
        cbTimer = setTimeout ->
          console.log "Auto remove emit listener with timeout: listener:#{ cb } source: #{ type }"
          offListener()
        , @timeout * 1000

      @port.emit type, {cb, args}

    on: (type, listener)->
      self = @
      handle = ({cb, args})->
        listener.call this, args, (args, ccallback)->
          self.emit cb, args, ccallback if cb

      @port.on type, handle
      ()=>
        @port.removeListener type, handle

    # offListener: (type, listener)->
    #   @port.removeListener type, listener

    once: (type, listener)->
      offListener = @on type, ->
        offListener()
        listener.apply @, Array.prototype.slice.call arguments, 0
  
  exports.Port = Port
)