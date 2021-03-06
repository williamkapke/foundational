'use strict'

require('extensions')
var fs = require('fs')
var cp = require('child_process')
var github = require('./github.js')
var px = require('./px.js')
var util = require('./util.js')
var users = util.tsv.open.users('./data/users.tsv')
var summary = require('./data/summary.json')
var stop = { created_at: new Date(summary.last_event.created_at), id: summary.last_event.id }
var first
var events = {}
var issues = {}
var comments = {}

function updateIssue (repo, issue) {
  if (!issues[repo]) {
    issues[repo] = tryOpen(`./data/repos/${repo}/`, 'issues')
  }
  issues[repo][issue.number] = px.issue.copy(issue)
  updateUser(issue.user)
  if (issue.assignee) updateUser(issue.assignee)
  if (issue.merged_by) updateUser(issue.merged_by)
}
function updateComment (repo, comment) {
  if (!comments[repo]) {
    comments[repo] = tryOpen(`./data/repos/${repo}/`, 'comments')
  }
  comments[repo][comment.id] = px.comment.copy(comment)
  updateUser(comment.user)
}
var processors = {
  IssuesEvent: (e) => {
    updateIssue(e.repo.name, e.payload.issue)
  },
  IssueCommentEvent: (e) => {
    updateComment(e.repo.name, e.payload.comment)
    updateIssue(e.repo.name, e.payload.issue)
  },
  PullRequestReviewCommentEvent: (e) => {
    updateComment(e.repo.name, e.payload.comment)
    updateIssue(e.repo.name, e.payload.pull_request)
  },
  PullRequestEvent: (e) => {
    updateIssue(e.repo.name, e.payload.pull_request)
  },
  CommitCommentEvent: (e) => {
    updateComment(e.repo.name, e.payload.comment)
  }
}

github.get.pages('/orgs/nodejs/events?per_page=100', (results, next) => {
  var more = true
  if (!first) first = results[0]

  for (var i = 0; i < results.length; i++) {
    var e = results[i]
    e.repo.name = e.repo.name.split('/')[1]
    if (e.id === stop.id || new Date(e.created_at) < stop.created_at) {
      more = false
      break
    }
    var date = e.created_at.substr(0, 10)
    if (!events[date]) events[date] = []
    var payload = px[e.type] ? px[e.type].copy(e.payload).$json.replace(/"/g, '""') : ''
    events[date].push(`${e.created_at}	${e.id}	${e.actor.id}	${e.repo.name}	${e.type}	"${payload}"`)

    if (processors[e.type]) {
      updateUser(e.actor)
      processors[e.type](e)
    }
  }

  if (!more) console.log('All caught up!')
  next(more)
})
.then(() => {
  console.log('Writing Data...')
  Object.keys(events).forEach((date) => {
    console.log(`  ${date}.tsv`)
    fs.appendFileSync(`./data/events/${date}.tsv`, events[date].reverse().join('\n') + '\n')
  })

  console.log('  summary.json')
  summary.last_event = { created_at: first.created_at, id: first.id }
  fs.writeFileSync('./data/summary.json', summary.$json2)

  util.tsv.save('./data/users.tsv', users, ['id', 'login'])

  Object.keys(issues).forEach((repo) => {
    console.log(`${repo}/issues.tsv`)
    util.tsv.save(`./data/repos/${repo}/issues.tsv`, issues[repo], util.columns.issues)
  })
  Object.keys(comments).forEach((repo) => {
    console.log(`${repo}/comments.tsv`)
    util.tsv.save(`./data/repos/${repo}/comments.tsv`, comments[repo], util.columns.comments)
  })
})
.catch((e) => {
  console.error(e.stack)
})

function tryOpen (path, type) {
  var out = util.tsv.open[type](path + type + '.tsv')
  if (out) return out

  cp.execSync('mkdir -p ' + path)
  return {}
}
function updateUser (user) {
  if (!user) return
  if (!users[user.id]) users[user.id] = {}
  users[user.id].login = user.login
}
function save (path, obj) {
  var out = Object.keys(obj).map(Number).sort((a, b) => a - b).map((id) =>
    `"${id}":${obj[id].$json}`
  )
  fs.writeFileSync(path, '{\n' + out.join(',\n') + '\n}')
}
