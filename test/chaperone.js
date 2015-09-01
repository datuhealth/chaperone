'use strict'

var test = require('tape')
var chaperone = require('../chaperone')
var basicConfig = require('./lib/basic.json')

test('The tool fails if no tour is provided', function (t) {
  t.throws(function () {
    chaperone.init(null)
  }, 'It throws without a tour')
  t.end()
})
