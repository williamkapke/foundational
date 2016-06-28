'use strict'

require('extensions')
var _px = require('propex')
var Px = module.exports = (value) => {
  return _px(value).$set('copy.handlers', handlers)
}
var handlers = {
  id: (prop, name, value, result) => (result[name] = value && value.id),
  name: (prop, name, value, result) => (result[name] = value.name),
  number: (prop, name, value, result) => (result[name] = value.number),
  words: (prop, name, value, result, parent) => (result.words = (parent.body.replace(/^\s*> [^\0]+?(?=\n\n)/gm, '').match(/\S+/g) || '').length),
  pr: (prop, name, value, result, parent) => (result[name] = parent.html_url.includes('/pull/')),
  parent: (prop, name, value, result, parent) => (result[name] = (parent.issue_url || parent.pull_request_url).match(/\d+$/)[0])
}

module.exports = {
  event: Px('{created_at,id,type,actor$id,repo$name,payload}'),
  issue: Px('{created_at,number,pr$pr,user$id,state,locked,comments,review_comments,updated_at,closed_at,title,words$words,merged_by$id,merged_at}'),
  comment: Px('{created_at,number$parent,pr$pr,user$id,updated_at,words$words,path}'),

  IssuesEvent: Px('{action,issue$number}'), // action = assigned, unassigned, labeled, unlabeled, opened, edited, closed, or reopened.
  IssueCommentEvent: Px('{action,issue$number,comment$id}'), // action = created, edited, or deleted.
  PullRequestReviewCommentEvent: Px('{action,comment$id,pull_request$number}'), // action = created, edited, or deleted
  PullRequestEvent: Px('{action,number,pull_request$number}') // action = assigned, unassigned, labeled, unlabeled, opened, edited, closed, reopened, or synchronized.
}

