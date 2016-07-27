'use strict'

const fs = require('fs')
const asc = (a, b) => a - b
const cache = {}

const escape = (v) => {
  if (!/["\t]/.test(v)) return v
  return '"' + v.replace(/"/g, '""').replace(/\t/g, '\\t') + '"'
}
const unescape = (v) => {
  if (v[0] !== '"') return v
  return v.substr(1, v.length-2).replace(/""/g, '"').replace(/\\t/g, '\t')
}

function words(v) { return Number(v) }

const util = module.exports = {
  events: (date) =>
    fs.readFileSync(`./data/events/${dt(date)}.tsv`).toString()
    .split('\n')
    .filter((line) => !!line)
    .map((line) => {
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
    }),
  tsv: {
    save: function (path, obj, columns) {
      var out = Object.keys(obj).map(Number).sort(asc).map((id) =>
        columns.map((col) =>
          col === 'id' ? id : escape(obj[id][col.name || col])
        )
        .join('\t')
      )
      fs.writeFileSync(path, out.join('\n') + '\n')
    },
    open: function (path, columns) {
      if (!fs.existsSync(path)) return // console.log('Not Found', path)
      const out = {}
      fs.readFileSync(path).toString().split('\n').forEach((line) => {
        if (!line) return
        const parts = line.split('\t')
        const row = out[parts[0]] = {}
        parts.forEach((part, i) => {
          const col = columns[i]
          if(typeof col === 'function') {
            return row[col.name] = col(part)
          }

          row[col] = unescape(part)
        })
      })
      return out
    }
  },
  columns: {
    comments: ['id', 'number', 'user', 'pr', 'created_at', 'updated_at', words, 'path'],
    issues: ['id', 'user', 'pr', 'state', 'locked', 'comments', 'review_comments', 'created_at', 'updated_at', 'closed_at', 'title', words, 'merged_by', 'merged_at'],
    users: ['id', 'login']
  },
  escape,
  unescape
}
util.tsv.open.comments = (path) => cache[path] || (cache[path] = util.tsv.open(path, util.columns.comments))
util.tsv.open.issues = (path) => cache[path] || (cache[path] = util.tsv.open(path, util.columns.issues))
util.tsv.open.users = (path) => cache[path] || (cache[path] = util.tsv.open(path, util.columns.users))

// get a YYYY-MM-DD string
function dt (date) {
  if (typeof date !== 'string') {
    date = date.toISOString()
  }
  return date.substr(0, 10)
}
