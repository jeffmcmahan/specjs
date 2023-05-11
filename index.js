const tests = []
const mocks = new Map
const onReadyHandlers = []

let testCount = 0
let testStart = 0

export function mock(f) {
	return (m) => mocks.set(f, m)
}

export function fn(f) {
	const wrapped = (...args) => (mocks.get(wrapped) || f)(...args)
	return wrapped
}

export function test(...args) {
	testCount++
	if (args.length === 2) {
		const [ meta, test ] = args
		if (!meta.url.includes('/node_modules/')) {
			test.url = meta.url.slice()
			tests.push(test)
		}
	} else {
		tests.push(args[ 0 ])
	}
}

export function onReady(f) {
	return onReadyHandlers.push(f)
}

async function runTests () {

	mocks.clear()

	if (tests.length) {
		if (!testStart) {
			testStart = Date.now()
		}
		tests.shift()(runTests)
	} else {
		if (testCount) {
			const time = (Date.now() - testStart)
			console.log(`${ testCount } test(s) completed in ${ time }ms.`)
		}
		onReadyHandlers.forEach((f) => f())
	}
}

const nodeDev = (globalThis?.process?.environment === 'development')
const browserDev = (globalThis?.location?.hostname === 'localhost')

if (!nodeDev && !browserDev) {
	
	if (globalThis?.process) {
		setTimeout(() => {
			mocks.clear()
			onReadyHandlers.forEach((f) => f())
		})
	}

	if (globalThis?.location) {
		window.addEventListener('DOMContentLoaded', () => {
			mocks.clear()
			onReadyHandlers.forEach((f) => f())
		})
	}

} else if (browserDev) {
	window.addEventListener('DOMContentLoaded', runTests)
} else {
	setTimeout(runTests)
}
