# github-basic

Basic https interface to GitHub

[![Build Status](https://img.shields.io/travis/ForbesLindesay/github-basic/master.svg)](https://travis-ci.org/ForbesLindesay/github-basic)
[![Dependency Status](https://img.shields.io/gemnasium/ForbesLindesay/github-basic.svg)](https://gemnasium.com/ForbesLindesay/github-basic)
[![NPM version](https://img.shields.io/npm/v/github-basic.svg)](http://badge.fury.io/js/github-basic)

## Installation

    npm install github-basic

## API

## github(method, path, query, options, callback)

Make a request to one of the github APIs.  Handles redirects transparently and makes errors into proper error objects

### Usage

```js
var github = require('github-basic')

//get all 'ForbesLindesay's gists in the last year

var since = new Date()
since.setUTCFullYear(since.getUTCFullYear() - 1)

// using callbacks

github('GET', '/users/:user/gists', {user: 'ForbesLindesay', since: since}, function (err, res) {
  if (err) throw err;
  res.body.pipe(process.stdout)
})

// or

github('GET', '/users/ForbesLindesay/gists', {since: since}, function (err, res) {
  if (err) throw err;
  res.body.pipe(process.stdout)
})

// using promises

github('GET', '/users/:user/gists', {user: 'ForbesLindesay', since: since}).done(function (res) {
  res.body.pipe(process.stdout)
})

//or

github('GET', '/users/ForbesLindesay/gists', {since: since}).done(function (res) {
  res.body.pipe(process.stdout)
})

// getting raw github data

github('GET', 'https://raw.githubusercontent.com/:owner/:repo/master/README.md', {
  owner: 'ForbesLindesay',
  repo: 'github-basic'
}).done(function (res) {
  res.body.pipe(process.stdout);
});
```

### Parameters

- @param {String} method:     Can be `head`, `get`, `delete`, `post`, `patch` or `put`
- @param {String} path:       Path from the docs, e.g. `/gists/public` or `/users/:user/gists`
- @param {Object} query:      Query options, e.g. `{since: new Date(2000, 0, 1)}` or `{user: 'ForbesLindesay'}`
- @param {Object} options:    All the other options
- @param {Function} callback: If ommitted, a promise is returned

### Options

 - auth: (default: null) `{ type: 'oauth', token: '<my oauth token>' }` or `{ type: 'basic', username: 'my user', password: 'my password' }` or just pass a string and it will be used as an oauth token
 - timeout: (default: 2 minutes) timeout in ms or string parsed by `ms` like `'30 minutes'`
 - headers: (default: `{}`) override default headers in the request

### Result

A standard response object with a readable stream as the `.body` property. (N.B. don't stream `res`, stream `res.body`)

## github.buffer(method, path, query, options, callback)

Same as `github(method, path, query, options, callback)` except `res.body` is a string containing the buffered response.

Pass `options.cache = true` to enable a file system cache for GET requests with support for ETag/304 responses. This is recommended as it makes it much easier to avoid going over GitHub's rate limits.

## github.json(method, path, query, options, callback)

Same as `github(method, path, query, options, callback)` except `res.body` is a JSON object containing the parsed response.

Pass `options.cache = true` to enable a file system cache for GET requests with support for ETag/304 responses. This is recommended as it makes it much easier to avoid going over GitHub's rate limits.

## github.stream(path, query, options)

Sometimes the easiest way to handle GitHub's paginated results is to treat them as a stream.  This method isn't (currently) clever enough to do streaming JSON parsing of the response, but it will keep requesting more pages as needed and it works properly with back pressure so as to not request more pages than are needed.

This method only supports `'GET'` requests, so doesn't take a `method` parameter

Pass `options.cache = true` to enable a file system cache for GET requests with support for ETag/304 responses. This is recommended as it makes it much easier to avoid going over GitHub's rate limits.

### Usage

```js
var github = require('github-basic')

//stream all of ForbesLindesay's repos
github.stream('/users/:user/repos', {user: 'ForbesLindesay'})
  .pipe(JSONify())
  .pipe(process.stdout)
```

Output:

```js
{"id":11285217,"name":"affair","full_name":"ForbesLindesay/affair","owner":{"login":"ForbesLindesay","id":1260646,"avatar_url":"https://secure.gravatar.com/avatar/eb3e104452d654350a5d1a65caa2e49e?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png","gravatar_id":"eb3e104452d654350a5d1a65caa2e49e","url":"https://api.github.com/users/ForbesLindesay","html_url":"https://github.com/ForbesLindesay","followers_url":"https://api.github.com/users/ForbesLindesay/followers","following_url":"https://api.github.com/users/ForbesLindesay/following{/other_user}","gists_url":"https://api.github.com/users/ForbesLindesay/gists{/gist_id}","starred_url":"https://api.github.com/users/ForbesLindesay/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/ForbesLindesay/subscriptions","organizations_url":"https://api.github.com/users/ForbesLindesay/orgs","repos_url":"https://api.github.com/users/ForbesLindesay/repos","events_url":"https://api.github.com/users/ForbesLindesay/events{/privacy}","received_events_url":"https://api.github.com/users/ForbesLindesay/received_events","type":"User"},"private":false,"html_url":"https://github.com/ForbesLindesay/affair","description":"Cheating on event emitters with mixins and special browser NodeElement handling","fork":false,"url":"https://api.github.com/repos/ForbesLindesay/affair","forks_url":"https://api.github.com/repos/ForbesLindesay/affair/forks","keys_url":"https://api.github.com/repos/ForbesLindesay/affair/keys{/key_id}","collaborators_url":"https://api.github.com/repos/ForbesLindesay/affair/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/ForbesLindesay/affair/teams","hooks_url":"https://api.github.com/repos/ForbesLindesay/affair/hooks","issue_events_url":"https://api.github.com/repos/ForbesLindesay/affair/issues/events{/number}","events_url":"https://api.github.com/repos/ForbesLindesay/affair/events","assignees_url":"https://api.github.com/repos/ForbesLindesay/affair/assignees{/user}","branches_url":"https://api.github.com/repos/ForbesLindesay/affair/branches{/branch}","tags_url":"https://api.github.com/repos/ForbesLindesay/affair/tags","blobs_url":"https://api.github.com/repos/ForbesLindesay/affair/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/ForbesLindesay/affair/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/ForbesLindesay/affair/git/refs{/sha}","trees_url":"https://api.github.com/repos/ForbesLindesay/affair/git/trees{/sha}","statuses_url":"https://api.github.com/repos/ForbesLindesay/affair/statuses/{sha}","languages_url":"https://api.github.com/repos/ForbesLindesay/affair/languages","stargazers_url":"https://api.github.com/repos/ForbesLindesay/affair/stargazers","contributors_url":"https://api.github.com/repos/ForbesLindesay/affair/contributors","subscribers_url":"https://api.github.com/repos/ForbesLindesay/affair/subscribers","subscription_url":"https://api.github.com/repos/ForbesLindesay/affair/subscription","commits_url":"https://api.github.com/repos/ForbesLindesay/affair/commits{/sha}","git_commits_url":"https://api.github.com/repos/ForbesLindesay/affair/git/commits{/sha}","comments_url":"https://api.github.com/repos/ForbesLindesay/affair/comments{/number}","issue_comment_url":"https://api.github.com/repos/ForbesLindesay/affair/issues/comments/{number}","contents_url":"https://api.github.com/repos/ForbesLindesay/affair/contents/{+path}","compare_url":"https://api.github.com/repos/ForbesLindesay/affair/compare/{base}...{head}","merges_url":"https://api.github.com/repos/ForbesLindesay/affair/merges","archive_url":"https://api.github.com/repos/ForbesLindesay/affair/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/ForbesLindesay/affair/downloads","issues_url":"https://api.github.com/repos/ForbesLindesay/affair/issues{/number}","pulls_url":"https://api.github.com/repos/ForbesLindesay/affair/pulls{/number}","milestones_url":"https://api.github.com/repos/ForbesLindesay/affair/milestones{/number}","notifications_url":"https://api.github.com/repos/ForbesLindesay/affair/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/ForbesLindesay/affair/labels{/name}","created_at":"2013-07-09T14:51:59Z","updated_at":"2013-07-22T20:56:07Z","pushed_at":"2013-07-22T20:56:06Z","git_url":"git://github.com/ForbesLindesay/affair.git","ssh_url":"git@github.com:ForbesLindesay/affair.git","clone_url":"https://github.com/ForbesLindesay/affair.git","svn_url":"https://github.com/ForbesLindesay/affair","homepage":null,"size":86,"watchers_count":0,"language":"JavaScript","has_issues":true,"has_downloads":true,"has_wiki":true,"forks_count":0,"mirror_url":null,"open_issues_count":0,"forks":0,"open_issues":0,"watchers":0,"master_branch":"master","default_branch":"master","permissions":{"admin":false,"push":false,"pull":true}}
{"id":5729415,"name":"ajax","full_name":"ForbesLindesay/ajax","owner":{"login":"ForbesLindesay","id":1260646,"avatar_url":"https://secure.gravatar.com/avatar/eb3e104452d654350a5d1a65caa2e49e?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png","gravatar_id":"eb3e104452d654350a5d1a65caa2e49e","url":"https://api.github.com/users/ForbesLindesay","html_url":"https://github.com/ForbesLindesay","followers_url":"https://api.github.com/users/ForbesLindesay/followers","following_url":"https://api.github.com/users/ForbesLindesay/following{/other_user}","gists_url":"https://api.github.com/users/ForbesLindesay/gists{/gist_id}","starred_url":"https://api.github.com/users/ForbesLindesay/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/ForbesLindesay/subscriptions","organizations_url":"https://api.github.com/users/ForbesLindesay/orgs","repos_url":"https://api.github.com/users/ForbesLindesay/repos","events_url":"https://api.github.com/users/ForbesLindesay/events{/privacy}","received_events_url":"https://api.github.com/users/ForbesLindesay/received_events","type":"User"},"private":false,"html_url":"https://github.com/ForbesLindesay/ajax","description":"Standalone AJAX library inspired by jQuery/zepto","fork":false,"url":"https://api.github.com/repos/ForbesLindesay/ajax","forks_url":"https://api.github.com/repos/ForbesLindesay/ajax/forks","keys_url":"https://api.github.com/repos/ForbesLindesay/ajax/keys{/key_id}","collaborators_url":"https://api.github.com/repos/ForbesLindesay/ajax/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/ForbesLindesay/ajax/teams","hooks_url":"https://api.github.com/repos/ForbesLindesay/ajax/hooks","issue_events_url":"https://api.github.com/repos/ForbesLindesay/ajax/issues/events{/number}","events_url":"https://api.github.com/repos/ForbesLindesay/ajax/events","assignees_url":"https://api.github.com/repos/ForbesLindesay/ajax/assignees{/user}","branches_url":"https://api.github.com/repos/ForbesLindesay/ajax/branches{/branch}","tags_url":"https://api.github.com/repos/ForbesLindesay/ajax/tags","blobs_url":"https://api.github.com/repos/ForbesLindesay/ajax/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/ForbesLindesay/ajax/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/ForbesLindesay/ajax/git/refs{/sha}","trees_url":"https://api.github.com/repos/ForbesLindesay/ajax/git/trees{/sha}","statuses_url":"https://api.github.com/repos/ForbesLindesay/ajax/statuses/{sha}","languages_url":"https://api.github.com/repos/ForbesLindesay/ajax/languages","stargazers_url":"https://api.github.com/repos/ForbesLindesay/ajax/stargazers","contributors_url":"https://api.github.com/repos/ForbesLindesay/ajax/contributors","subscribers_url":"https://api.github.com/repos/ForbesLindesay/ajax/subscribers","subscription_url":"https://api.github.com/repos/ForbesLindesay/ajax/subscription","commits_url":"https://api.github.com/repos/ForbesLindesay/ajax/commits{/sha}","git_commits_url":"https://api.github.com/repos/ForbesLindesay/ajax/git/commits{/sha}","comments_url":"https://api.github.com/repos/ForbesLindesay/ajax/comments{/number}","issue_comment_url":"https://api.github.com/repos/ForbesLindesay/ajax/issues/comments/{number}","contents_url":"https://api.github.com/repos/ForbesLindesay/ajax/contents/{+path}","compare_url":"https://api.github.com/repos/ForbesLindesay/ajax/compare/{base}...{head}","merges_url":"https://api.github.com/repos/ForbesLindesay/ajax/merges","archive_url":"https://api.github.com/repos/ForbesLindesay/ajax/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/ForbesLindesay/ajax/downloads","issues_url":"https://api.github.com/repos/ForbesLindesay/ajax/issues{/number}","pulls_url":"https://api.github.com/repos/ForbesLindesay/ajax/pulls{/number}","milestones_url":"https://api.github.com/repos/ForbesLindesay/ajax/milestones{/number}","notifications_url":"https://api.github.com/repos/ForbesLindesay/ajax/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/ForbesLindesay/ajax/labels{/name}","created_at":"2012-09-08T15:19:29Z","updated_at":"2013-07-25T02:02:41Z","pushed_at":"2013-04-28T00:50:49Z","git_url":"git://github.com/ForbesLindesay/ajax.git","ssh_url":"git@github.com:ForbesLindesay/ajax.git","clone_url":"https://github.com/ForbesLindesay/ajax.git","svn_url":"https://github.com/ForbesLindesay/ajax","homepage":"https://component.jit.su/ForbesLindesay/ajax","size":168,"watchers_count":28,"language":"JavaScript","has_issues":true,"has_downloads":true,"has_wiki":true,"forks_count":6,"mirror_url":null,"open_issues_count":0,"forks":6,"open_issues":0,"watchers":28,"master_branch":"master","default_branch":"master","permissions":{"admin":false,"push":false,"pull":true}}
{"id":11011911,"name":"alagator","full_name":"ForbesLindesay/alagator","owner":{"login":"ForbesLindesay","id":1260646,"avatar_url":"https://secure.gravatar.com/avatar/eb3e104452d654350a5d1a65caa2e49e?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png","gravatar_id":"eb3e104452d654350a5d1a65caa2e49e","url":"https://api.github.com/users/ForbesLindesay","html_url":"https://github.com/ForbesLindesay","followers_url":"https://api.github.com/users/ForbesLindesay/followers","following_url":"https://api.github.com/users/ForbesLindesay/following{/other_user}","gists_url":"https://api.github.com/users/ForbesLindesay/gists{/gist_id}","starred_url":"https://api.github.com/users/ForbesLindesay/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/ForbesLindesay/subscriptions","organizations_url":"https://api.github.com/users/ForbesLindesay/orgs","repos_url":"https://api.github.com/users/ForbesLindesay/repos","events_url":"https://api.github.com/users/ForbesLindesay/events{/privacy}","received_events_url":"https://api.github.com/users/ForbesLindesay/received_events","type":"User"},"private":false,"html_url":"https://github.com/ForbesLindesay/alagator","description":"Write algorithms that can be re-used for synchronous and asynchronous code using promises and `yield`","fork":false,"url":"https://api.github.com/repos/ForbesLindesay/alagator","forks_url":"https://api.github.com/repos/ForbesLindesay/alagator/forks","keys_url":"https://api.github.com/repos/ForbesLindesay/alagator/keys{/key_id}","collaborators_url":"https://api.github.com/repos/ForbesLindesay/alagator/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/ForbesLindesay/alagator/teams","hooks_url":"https://api.github.com/repos/ForbesLindesay/alagator/hooks","issue_events_url":"https://api.github.com/repos/ForbesLindesay/alagator/issues/events{/number}","events_url":"https://api.github.com/repos/ForbesLindesay/alagator/events","assignees_url":"https://api.github.com/repos/ForbesLindesay/alagator/assignees{/user}","branches_url":"https://api.github.com/repos/ForbesLindesay/alagator/branches{/branch}","tags_url":"https://api.github.com/repos/ForbesLindesay/alagator/tags","blobs_url":"https://api.github.com/repos/ForbesLindesay/alagator/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/ForbesLindesay/alagator/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/ForbesLindesay/alagator/git/refs{/sha}","trees_url":"https://api.github.com/repos/ForbesLindesay/alagator/git/trees{/sha}","statuses_url":"https://api.github.com/repos/ForbesLindesay/alagator/statuses/{sha}","languages_url":"https://api.github.com/repos/ForbesLindesay/alagator/languages","stargazers_url":"https://api.github.com/repos/ForbesLindesay/alagator/stargazers","contributors_url":"https://api.github.com/repos/ForbesLindesay/alagator/contributors","subscribers_url":"https://api.github.com/repos/ForbesLindesay/alagator/subscribers","subscription_url":"https://api.github.com/repos/ForbesLindesay/alagator/subscription","commits_url":"https://api.github.com/repos/ForbesLindesay/alagator/commits{/sha}","git_commits_url":"https://api.github.com/repos/ForbesLindesay/alagator/git/commits{/sha}","comments_url":"https://api.github.com/repos/ForbesLindesay/alagator/comments{/number}","issue_comment_url":"https://api.github.com/repos/ForbesLindesay/alagator/issues/comments/{number}","contents_url":"https://api.github.com/repos/ForbesLindesay/alagator/contents/{+path}","compare_url":"https://api.github.com/repos/ForbesLindesay/alagator/compare/{base}...{head}","merges_url":"https://api.github.com/repos/ForbesLindesay/alagator/merges","archive_url":"https://api.github.com/repos/ForbesLindesay/alagator/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/ForbesLindesay/alagator/downloads","issues_url":"https://api.github.com/repos/ForbesLindesay/alagator/issues{/number}","pulls_url":"https://api.github.com/repos/ForbesLindesay/alagator/pulls{/number}","milestones_url":"https://api.github.com/repos/ForbesLindesay/alagator/milestones{/number}","notifications_url":"https://api.github.com/repos/ForbesLindesay/alagator/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/ForbesLindesay/alagator/labels{/name}","created_at":"2013-06-28T00:57:46Z","updated_at":"2013-06-28T01:06:45Z","pushed_at":"2013-06-28T01:06:45Z","git_url":"git://github.com/ForbesLindesay/alagator.git","ssh_url":"git@github.com:ForbesLindesay/alagator.git","clone_url":"https://github.com/ForbesLindesay/alagator.git","svn_url":"https://github.com/ForbesLindesay/alagator","homepage":null,"size":112,"watchers_count":0,"language":"JavaScript","has_issues":true,"has_downloads":true,"has_wiki":true,"forks_count":0,"mirror_url":null,"open_issues_count":0,"forks":0,"open_issues":0,"watchers":0,"master_branch":"master","default_branch":"master","permissions":{"admin":false,"push":false,"pull":true}}
{"id":4331001,"name":"alpha-beta-pruning","full_name":"ForbesLindesay/alpha-beta-pruning","owner":{"login":"ForbesLindesay","id":1260646,"avatar_url":"https://secure.gravatar.com/avatar/eb3e104452d654350a5d1a65caa2e49e?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png","gravatar_id":"eb3e104452d654350a5d1a65caa2e49e","url":"https://api.github.com/users/ForbesLindesay","html_url":"https://github.com/ForbesLindesay","followers_url":"https://api.github.com/users/ForbesLindesay/followers","following_url":"https://api.github.com/users/ForbesLindesay/following{/other_user}","gists_url":"https://api.github.com/users/ForbesLindesay/gists{/gist_id}","starred_url":"https://api.github.com/users/ForbesLindesay/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/ForbesLindesay/subscriptions","organizations_url":"https://api.github.com/users/ForbesLindesay/orgs","repos_url":"https://api.github.com/users/ForbesLindesay/repos","events_url":"https://api.github.com/users/ForbesLindesay/events{/privacy}","received_events_url":"https://api.github.com/users/ForbesLindesay/received_events","type":"User"},"private":false,"html_url":"https://github.com/ForbesLindesay/alpha-beta-pruning","description":"A toy JavaScript Implimentation of alpha-beta pruning for a search tree.","fork":false,"url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning","forks_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/forks","keys_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/keys{/key_id}","collaborators_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/teams","hooks_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/hooks","issue_events_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/issues/events{/number}","events_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/events","assignees_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/assignees{/user}","branches_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/branches{/branch}","tags_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/tags","blobs_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/git/refs{/sha}","trees_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/git/trees{/sha}","statuses_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/statuses/{sha}","languages_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/languages","stargazers_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/stargazers","contributors_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/contributors","subscribers_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/subscribers","subscription_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/subscription","commits_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/commits{/sha}","git_commits_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/git/commits{/sha}","comments_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/comments{/number}","issue_comment_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/issues/comments/{number}","contents_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/contents/{+path}","compare_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/compare/{base}...{head}","merges_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/merges","archive_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/downloads","issues_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/issues{/number}","pulls_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/pulls{/number}","milestones_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/milestones{/number}","notifications_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/ForbesLindesay/alpha-beta-pruning/labels{/name}","created_at":"2012-05-15T01:43:48Z","updated_at":"2013-04-23T21:59:27Z","pushed_at":"2012-06-02T14:03:12Z","git_url":"git://github.com/ForbesLindesay/alpha-beta-pruning.git","ssh_url":"git@github.com:ForbesLindesay/alpha-beta-pruning.git","clone_url":"https://github.com/ForbesLindesay/alpha-beta-pruning.git","svn_url":"https://github.com/ForbesLindesay/alpha-beta-pruning","homepage":null,"size":284,"watchers_count":2,"language":"JavaScript","has_issues":true,"has_downloads":true,"has_wiki":true,"forks_count":0,"mirror_url":null,"open_issues_count":0,"forks":0,"open_issues":0,"watchers":2,"master_branch":"master","default_branch":"master","permissions":{"admin":false,"push":false,"pull":true}}
```

## License

  MIT