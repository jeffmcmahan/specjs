import { execSync } from 'node:child_process'
const tests = []
const mocks = new Map
const onReadyHandlers = []

let testCount = 0
let testStart = 0
let testing = true

process.on('unhandledRejection', () => {
	if (test.beepOnFailure && testing) {
		execSync(`afplay /System/Library/Sounds/Basso.aiff`)
	}
})

const runTests = async () => {

	// Execute tests 1-at-a-time until they're all done.
	// Note: Triggers tests, which are in continuation passing style.

	mocks.clear()

	if (tests.length) {

		if (!testCount) {
			testStart = Date.now()
			testCount = tests.length
		}
		tests.shift()(runTests)

	} else {

		const time = Date.now() - testStart
		if (testCount) {
			console.log(`${ testCount } test(s) completed in ${ time }ms.`)
		}
		testing = false
		onReadyHandlers.forEach(f => f())
	}
}

setTimeout(runTests) // Invoke the tests asynchronously.

export const mock = (f) => (m) => mocks.set(f, m)

export const fn = f => {

	// Example - fn (funcThatCanBeMocked)
	
	const wrapped = (...args) => (mocks.get(wrapped) || f)(...args)
	return wrapped
}

export const test = (...args) => {
	
	// Registers a new test case.
	// Note: If 2 arguments, the first is a file URL indicating where the 
	// test is being run from - if from node_modules, it'll be ignored.

	if (args.length === 2) {
		const [meta, test] = args
		if (!meta.url.includes('/node_modules/')) {
			test.url = meta.url.slice()
			tests.push(test)
		}
	} else {
		tests.push(args[0])
	}
}

test.beepOnFailure = false

export const onReady = (

	// Example - onReady(funcToRunWhenTestsAreDone)
	
	f => onReadyHandlers.push(f)
)
