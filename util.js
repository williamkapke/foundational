'use strict'

require('extensions')
var fs = require('fs')

module.exports = {
  events: (date) =>
    fs.readFileSync(`./data/events/${dt(date)}.tsv`).toString()
    .split('\n')
    .filter(line => !!line)
    .map(line => {
      if (!line) return

      var parts = line.split('\t')
      return {
        created_at: parts[0],
        actor: parts[2],
        repo: parts[3],
        type: parts[4],
        payload: parts[5] && parts[5] !== '""'
          ? JSON.parse(parts[5].substr(1, parts[5].length - 2).replace(/""/g, '"'))
          : undefined
      }
    })
}

// get a YYYY-MM-DD string
function dt (date) {
  if (typeof date !== 'string') {
    date = date.toISOString()
  }
  return date.substr(0, 10)
}
