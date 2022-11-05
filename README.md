# specjs

## Project Structure

Specjs enables mocking and testing within (what I call) "spec style" code, which is code that recasts the relationship between application logic and tests such that tests take primacy. *I.e.,* the primary unit of organization within in a project is the specification files (which contain tests). So, here's an example specification file (./foo.mjs):

```js
import assert from 'node:assert/strict'
import { mock, test } from '@jeffmcmahan/specjs'
import { foo } from './foo.src.mjs'
export { foo } from './foo.src.mjs'

test((done) => {

    // Behaviors are specified here, with assertions.

    const result = foo()
    assert(result % 7 === 0)
    done()
})

test(async (done) => {

    // As many tests as we like can be defined here or 
    // imported from elsewhere - whatever.

})
```

This spec file imports the `foo` function and tests it, and also exports it again - passing it through, as it were. And now we have the application source code itself (./foo.src.js):

```js
export const foo = () => {

    // Returns a multiple of 7.

    const digits = String(Math.random()).slice(3, 6)
    const int = parseInt(digits)
    return (7 * int)
}
```

Client code thus accesses `foo` not by importing the file that defines `foo`, but by way of the file that tests it:

```js
import { foo } from './foo.mjs' // <-- The spec file, not src.
```

## Spooky Mocking at a Distance

The `fn` function is a decorator which adds the ability to easily redefine any function within the context of a single specific test.

```js
import { fn } from '@jeffmcmahan/specjs'

export const dbQuery = fn (query => {
    // Some I/O stuff we want to be able to mock 
    // at test time.
})
```

```js
import assert from 'node:assert/strict'
import { test, mock } from '@jeffmcmahan/specjs'
import { dbQuery } from '../wherever/dbQuery.mjs'
import { getUser } from './getUser.src.mjs'
export { getUser } from './getUser.src.mjs'

test(async (done) => {

    mock(dbQuery)(async () => []) 
    const result = await getUser(5)

    assert.equal(result.length, 0)
    done()
})
```

When the test is `done()`, the dbQuery function's mock is released, and it goes back to firing the real I/O-inducing code.

## Test Failure Beep (Mac only)

When tests fail if .beepOnFailure is set to true, a system alert sound will play (MacOS only).

```js
import assert from 'node:assert/strict'
import { test } from '@jeffmcmahan/specjs'

test.beepOnFailure = true

test((done) => {
    assert.equal(1, 2)
})

// Beep
```
