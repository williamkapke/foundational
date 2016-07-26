'use strict'

const fs = require('fs')
const asc = (a, b) => a - b;

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
  ,
  tsv: {
    save: function (path, obj, columns) {
      var out = Object.keys(obj).map(Number).sort(asc).map((id) =>
        columns.map((col) =>
          col === 'id' ? id : obj[id][col]
        )
        .join('\t')
      )
      fs.writeFileSync(path, out.join('\n') + '\n')
    },
    open: function (path, columns) {
      const out = {}
      fs.readFileSync(path).toString().split('\n').forEach((line) => {
        if (!line) return
        const parts = line.split('\t')
        const row = out[parts[0]] = {}
        parts.forEach((part, i) => {
          row[columns[i]] = part
        })
      })
      return out
    }
  }
}

// get a YYYY-MM-DD string
function dt (date) {
  if (typeof date !== 'string') {
    date = date.toISOString()
  }
  return date.substr(0, 10)
}
