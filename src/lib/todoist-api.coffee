request = (require 'request').Request

exports.API = class API
  constructor: (@token)->
    
  request: (path, params, callback)->
    if typeof params is 'function'
      callback = params
      params = {}
    params.token = @token
    request
      url: "http://api.todoist.com/API#{ path }"
      content: params
      onComplete: (resp)->
        callback resp.json
    .get()

  getProjects: (callback)->
    console.log 'API /getProjects'
    @request '/getProjects', callback

  getUncompletedItems: (project_id, callback)->
    console.log 'API /getUncompletedItems'
    @request '/getUncompletedItems', { project_id }, callback

  getCompletedItems: (project_id, callback)->
    console.log 'API /getCompletedItems'
    @request '/getCompletedItems', { project_id }, callback


