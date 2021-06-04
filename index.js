const tests = []
const mocks = new Map
const onReadyHandlers = []

let testCount = 0
let testStart = 0

const runTests = async () => {

	// Execute tests 1-at-a-time until they're all done.
	// Note: Triggers tests, which are in continuation passing style.

	if (!testStart) {
		testStart = Date.now()
	}
	if (tests.length) {
		mocks.clear()
		if (!testCount) {
			testCount = tests.length
		}
		tests.shift()(runTests)
	} else {
		mocks.clear()
		const time = Date.now() - testStart
		console.log(`${testCount} test(s) completed in ${time}ms.`)
		onReadyHandlers.forEach(f => f())
	}
}

setTimeout(runTests) // Invoke the tests asynchronously.

export const mock = f => (

	// Example - mock(referenceToSrcFunction)(mockFunction)

	m => mocks.set(f, m)
)

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
			tests.push(test)
		}
	} else {
		tests.push(args[0])
	}
}

export const onReady = (

	// Example - onReady(funcToRunWhenTestsAreDone)
	
	f => onReadyHandlers.push(f)
)