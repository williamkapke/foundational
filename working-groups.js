'use strict'

require('extensions')
var GET = require('get-then')
var wgs = require('./data/working-groups.json')

var readmeParsers = {
  'Technical Steering Committee': readme => /### Current Members[^#]+##/i.exec(readme)[0],
  'Core Technical Committee': readme => /### CTC \(Core Technical Committee\)[^#]+##/i.exec(readme)[0],

  'Inclusivity': readme => /### Members[^#]+## /i.exec(readme)[0],

  'Addon API': readme => /### WG Members \/ Collaborators[^#]+## Licence/i.exec(readme)[0],
  'Benchmarking': readme => /## Current Project Team Members[^$]+/i.exec(readme)[0],
  'Build': readme => /People\n------[^$]+/i.exec(readme)[0],
  'Docker': readme => /## Docker Working Group Members[^#]+##/i.exec(readme)[0],
  'Documentation': readme => /## Current Documentation WG Members[^$]+/i.exec(readme)[0],
  'Evangelism': readme => /### Evangelism WG Members[^$]+/i.exec(readme)[0],
  // 'HTTP': '', doesn't have a members section at this time
  'Intl': readme => /## Current WG Members[^$]+/i.exec(readme)[0],
  'Post Mortem': readme => /members of the working group include:[^$]+/i.exec(readme)[0],
  'Roadmap': readme => /Current WG Members:[^$]+/i.exec(readme)[0],
  'Streams': readme => /# Streams WG Team Members[^$]+/i.exec(readme)[0],
  'Testing': readme => /## Current Project Team Members:[^$]+/i.exec(readme)[0],
  'Tracing': readme => /### Members[^$]+/i.exec(readme)[0],
  'Website': readme => /### Website Working Group Collaborators[^$]+/i.exec(readme)[0],

  'Help': readme => /## Help WG Members[^$]+/i.exec(readme)[0],
  'Promises': readme => /Working Group Members[^$]+/i.exec(readme)[0]
  // 'LTS': '', doesn't have a members section at this time
  // 'Hardware': '', doesn't have a members section at this time
  // 'Collaboration': '', doesn't have a members section at this time
  // 'API': '', doesn't have a members section at this time
}
var parseMentions = section => section.match(/(^|\W)[@|＠]([a-z0-9-]{1,39})(\b|$)/ig).map(x => x.substr(2).toLowerCase())
var parseGithubURL = section => section.match(/(?:github.com\/)([a-z0-9-]{1,39})(\b|$)/ig).map(x => x.substr(11).toLowerCase())
var nameParsers = {
  'Technical Steering Committee': parseMentions,
  'Core Technical Committee': parseGithubURL,

  'Inclusivity': parseMentions,

  'Addon API': parseGithubURL,
  'Benchmarking': parseMentions,
  'Build': parseGithubURL,
  'Docker': parseGithubURL,
  'Documentation': parseMentions,
  'Evangelism': parseGithubURL,
  // 'HTTP': '', doesn't have a members section at this time
  'Intl': parseMentions,
  'Post Mortem': parseMentions,
  'Roadmap': parseMentions,
  'Streams': parseGithubURL,
  'Testing': parseGithubURL,
  'Tracing': parseMentions,
  'Website': parseGithubURL,

  'Help': parseGithubURL,
  'Promises': parseMentions
  // 'LTS': '', doesn't have a members section at this time
  // 'Hardware': '', doesn't have a members section at this time
  // 'Collaboration': '', doesn't have a members section at this time
  // 'API': '', doesn't have a members section at this time
}
const dedupe = arr => Array.from(new Set(arr))

Promise.all(
  Object.keys(wgs).map(type =>
    Promise.all(
      wgs[type].$map((value, key) =>
        /^(i18n|HTTP|LTS|Hardware|Collaboration|API)/i.test(key) ? Promise.resolve(null)

        : GET(`https://raw.githubusercontent.com/nodejs/${value.repo}/master/README.md`)
          .then(String)
          .then(readmeParsers[key])
          .then(nameParsers[key])
          .then((names) =>
            (wgs[type][key].members = dedupe(names).sort())
          )
          .catch(e => {
            if (Buffer.isBuffer(e)) e = new Error(String(e))
            e.message = `Failed to download/parse readme for ${key}\n` + e.message
            console.error(e)
            return Promise.reject(e)
          })
      )
    )
  )
)
.then(() => {
  console.log(wgs.$json2)
})
.catch(x => console.log(String(x)))









