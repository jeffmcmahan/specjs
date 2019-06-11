import assert from 'assert'
import {fn, mock, test, onReady} from './index.js'

void (() => {

	// Aim: See to it that fn produces wrapped functions.

	const wrapped = fn (num => (num + 1))
	assert.equal(typeof wrapped, 'function')
	assert.equal(wrapped(1), 2)
})()

void (() => {

	// Aim: See to it that fn produces mock-able functions.

	const wrapped = fn (num => (num + 1))
	assert.equal(typeof wrapped, 'function')
	mock(wrapped)(num => (num - 1))
	assert.equal(wrapped(1), 0)
})()

void (() => {

	// Aim: Ensure that tests can be defined and and run.

	let testRan = false

	test(done => {
		testRan = true
		done()
	})

	// Wait for test to run (its going to run CPS/async).
	setTimeout(() => assert.equal(testRan, true))
})()

void (() => {

	// Aim: Ensure that the onReady callbacks fire.

	let callback1Ran = false
	let callback2Ran = false

	onReady(() => callback1Ran = true)
	onReady(() => callback2Ran = true)

	setTimeout(() => {
		assert.equal(callback1Ran, true)
		assert.equal(callback2Ran, true)
	})
})()