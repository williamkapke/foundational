'use strict'

require('extensions')
const util = require('./util.js')
const users = require('./data/users.json')

const out = {
  words: 0, // total for the day
  comments: 0,  // total for the day
  prs: { opened: 0, closed: 0, words: 0 },
  issues: { opened: 0, closed: 0, words: 0 },
  activity: {},
  users: {}
}
const getRepo = (name, open) => out.activity[name] || (out.activity[name] = {
  open: open,
  name: () => name // this is created as a function so it doesn't show in the JSON output
})
const getIssue = (repo, number) => repo[number] || (repo[number] = {
  comments: 0,
  words: 0,
  toJSON: () => `<${repo.name()}›${number}>` // add special tokens that get placed later
})
const handlers = {
  'IssuesEvent': (e, repo) => {
    var issue = require(`./data/repos/${e.repo}/issues.json`)[e.payload.issue]
    var i = getIssue(repo, e.payload.issue)
    var action = e.payload.action

    user(issue.user, e.repo, 'issues', e.payload.issue, issue.words, action)
    count.issue(issue.words, repo, i, action, issue.pr)

    i[action] = action === 'opened' ? issue.created_at : issue.closed_at
    i[action.replace('ed', 'er')] = e.actor
    if (issue.pr) i.pr = true
  },
  'PullRequestEvent': (e, repo) => {
    var issue = require(`./data/repos/${e.repo}/issues.json`)[e.payload.pull_request]
    var i = getIssue(repo, e.payload.pull_request)
    var action = e.payload.action

    user(issue.user, e.repo, 'pulls', e.payload.pull_request, issue.words, action)
    count.issue(issue.words, repo, i, action, true, e.repo)

    i.pr = true
    i[action] = action === 'opened' ? issue.created_at : issue.closed_at
    i[action.replace('ed', 'er')] = e.actor
  },
  'IssueCommentEvent': (e, repo) => {
    var comment = require(`./data/repos/${e.repo}/comments.json`)[e.payload.comment]
    var i = getIssue(repo, e.payload.issue)
    count.comment(comment.words, repo, i, comment.pr ? true : undefined)
    user(comment.user, e.repo, comment.pr ? 'pulls' : 'issues', comment.number, comment.words, null, e.payload.comment)
  },
  'PullRequestReviewCommentEvent': (e, repo) => {
    var comment = require(`./data/repos/${e.repo}/comments.json`)[e.payload.comment]
    var i = getIssue(repo, e.payload.pull_request)
    count.comment(comment.words, repo, i, true)
    user(comment.user, e.repo, 'pulls', comment.number, comment.words, null, e.payload.comment)
  },
  'CommitCommentEvent': (e, repo) => {
    if (!e.payload) return // initially, payloads were missed
    var comment = require(`./data/repos/${e.repo}/comments.json`)[e.payload.id]
    var i = getIssue(repo, e.payload.commit_id)
    count.comment(comment.words, repo, i, false)
    user(comment.user, e.repo, 'comments', comment.number, comment.words, null, e.payload.id)
  }
}
const count = {
  comment: function count (words, repo, issue, pr) {
    if (typeof pr !== 'undefined') issue.pr = pr
    issue.comments++
    out.comments++
    words = words || 0
    issue.words += words
    out.words += words
    repo.words = (repo.words || 0) + words
    repo.comments = (repo.comments || 0) + 1
    out[pr ? 'prs' : 'issues'].words += words
  },
  issue: function count (words, repo, issue, action, pr) {
    words = words || 0
    out.words += words
    repo.words = (repo.words || 0) + words
    issue.words = (issue.words || 0) + words
    repo[action] = (repo[action] || 0) + 1
    var type = out[pr ? 'prs' : 'issues']
    type.words += words
    type[action]++
  }
}

function user (id, repo, type, issue, words, action, commentid) {
  var longid = `${repo}/${type}/${issue}`
  if (commentid) longid += '#' + commentid
  var user = out.users[id] || (out.users[id] = users[id].$set('words', {}))
  user.words[longid] = words
  if (action) {
    (user[action] || (user[action] = [])).push(longid)
  }
}
function existingSummary (date) {
  console.log('getting existing repos')
  try {
    return require('./data/events/' + date + '.json').activity || {}
  } catch (e) {
    return {}
  }
}

// let's get to work!...
var date = (process.argv[2] || Date.$nowISO()).substr(0, 10)
console.log('Summarizing ' + date);
(
  Date.$nowISO().substr(0, 10) === date // only get the totals for today!
  ? require('./github.js').get.all('/orgs/nodejs/repos?per_page=100')
    .then(repos =>
      repos.$keyBy('name').$mapValues(repo => getRepo(repo.name, repo.open_issues_count))
    )
  : Promise.resolve(
      existingSummary(date).$mapValues((repo, name) => getRepo(name, repo.open))
    )
)
.then(repos => {
  out.activity = repos

  util.events(date).forEach(e => {
    var handler = handlers[e.type]
    if (!handler) return
    handler(e, getRepo(e.repo))
  })

  // I want to compact some of the output, so special tokens are
  // first put in the JSON (find the toJSON function above) and
  // then those are replaced with single line JSON text below...
  const final = out.$json2
  .replace(/{\n\s+"open": \d+\n\s+}/g, x => x.replace(/\s+/g,''))
  .replace(/"<([^>]+)>"/g, function (match, path) {
    var issue = out.activity.$get(path.split('›'))
    delete issue.toJSON
    return issue.$json
  })

  require('fs').writeFileSync('./data/events/' + date + '.json', final)
})
.catch(console.error)

