import Response from './response'

var __fetch
var handlers = []

function farfetched (url, options) {
  var handler = makeHandler(url, options)
  var index = handlers.length
  handlers[index] = handler
  return index
}

function makeHandler (url, options) {
  let { response } = options
  return {
    url,
    respond: function (url) {
      return new Response(
        typeof response === 'function'
          ? response(url)
          : response
      )
    }
  }
}

function handleRequest (url) {
  return new Promise(function (resolve) {
    var handler = findHandler(url)
    if (handler) {
      resolve(handler.respond(url))
    } else {
      resolve(__fetch(url))
    }
  })
}

function findHandler (requestURL) {
  if (!requestURL) return false

  var matching = handlers.filter(function (h) {
    if (typeof h.url === 'string') {
      return h.url === requestURL
    } else if (requestURL.match) {
      return requestURL.match(h.url)
    }
    return false
  })

  return matching.length > 0 ? matching[0] : false
}

farfetched.attach = function attach (global) {
  __fetch = global.fetch
  global.fetch = handleRequest
}

farfetched.clear = function clear (id) {
  delete handlers[id]
}

export default farfetched

