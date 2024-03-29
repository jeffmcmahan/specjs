const tests = []
let mocks = new Map
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
	tests.push(args[ 0 ])
}

export function onReady(f) {
	return onReadyHandlers.push(f)
}

function printDescription(test) {
	if (test.toString().includes('DESCRIPTION:')) {
		const descOnset = test.toString().split('DESCRIPTION:')[1].trim()
		let pos = 0
		while (pos < descOnset.length) {
			if (descOnset[ pos ] == '}') {
				console.log('DESCRIPTION: ' + descOnset.slice(0, pos + 1).trim().replaceAll(/\s+/g, ' '))
				break
			}
			pos++
		}
	} else {
		console.log('Test has no DESCRIPTION block.')
		console.log(test.toString())
	}
}

async function runTests () {

	mocks.clear()

	if (tests.length) {

		if (!testStart) {
			testStart = Date.now()
		}

		const test = tests.shift()
		printDescription(test)
		test(runTests)

	} else {
		if (testCount) {
			const time = (Date.now() - testStart)
			console.log(`${ testCount } test(s) completed in ${ time }ms.`)
		}

		mocks.clear()
		onReadyHandlers.forEach((f) => f())
	}
}

export function setEnv(env) {

	const node = (globalThis?.process)
	const browser = (globalThis?.location)

	if (env !== 'development') {
		if (node) {
			setTimeout(() => {
				mocks.clear()
				onReadyHandlers.forEach((f) => f())
			})
		} else if (browser) {
			window.addEventListener('DOMContentLoaded', () => {
				mocks.clear()
				onReadyHandlers.forEach((f) => f())
			})
		}
	} else if (browser) {
		window.addEventListener('DOMContentLoaded', runTests)
	} else {
		setTimeout(runTests)
	}
}
