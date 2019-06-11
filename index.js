const tests = []
const mocks = new Map
const onReadyHandlers = []

let testCount = 0
let testStart = 0

const runTests = async () => {

	// Execute tests 1-at-a-time until they're all done.

	if (tests.length) {
		mocks.clear()
		if (!testCount) {
			testStart = Date.now()
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

export const test = (
	
	// Example - test(done => { ... done() })

	f => tests.push(f)
)

export const onReady = (

	// Example - onReady(funcToRunWhenTestsAreDone)
	
	f => onReadyHandlers.push(f)
)