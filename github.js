'use strict'

require('extensions')
var GET = require('get-then')
var parse = require('parse-link-header')
var auth = process.env.GITHUB_AUTH || ''
var base = `https://${auth}@api.github.com`

module.exports = {
  get: (path) => get(base + path)
}
module.exports.get.all = (path) => getAll(base + path, [])
module.exports.get.pages = (path, cb, out) => getPage(base + path, cb, out)

function get (path) {
  console.log('GET', path)
  return GET(path)
  .then(res => {
    const data = JSON.parse(String(res))
    const links = parse(res.headers.link)
    if (links) {
      if (links.prev) data.prev = links.prev.url
      if (links.next) data.next = links.next.url
      if (links.last) data.last = links.last.url
    }
    //   var reset = new Date(parseInt(res.headers['x-ratelimit-reset'] + '000'))
    //   console.log('x-ratelimit-limit', res.headers['x-ratelimit-limit'])
    //   console.log('x-ratelimit-remaining', res.headers['x-ratelimit-remaining'])
    //   console.log('x-ratelimit-reset', res.headers['x-ratelimit-reset'], (reset - Date.now()) / 60000 + ' minutes')
    //
    return data
  })
}

var events = require('./events.json')
var count = 0
function getPage (path, cb, out) {
  return Promise.resolve(events.slice((count++) * 100, count * 100)) // get(path)
  .then(x => count < 3 ? x.$set('next', 'ok') : x)
  .then(res => new Promise((resolve, reject) => {
    const next = (more) => {
      if (more === false || !res.next) return resolve(out)
      getPage(res.next, cb, out).then(resolve, reject)
    }
    cb(res, next, out)
  }))
}
function getAll (path, results) {
  return get(path)
    .then(res => {
      results = results.concat(res)
      return res.next
        ? getAll(res.next, results)
        : results
    })
}
