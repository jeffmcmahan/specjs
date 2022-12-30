# specjs

## Project Structure

Specjs enables mocking and testing within (what I call) "spec style" code, which is code that recasts the relationship between application logic and tests such that tests take primacy. *I.e.,* the primary unit of organization within in a project is the specification files, which contain tests and define each module's public API surface. The spec file takes the name of the module and the file that defines the module's contents gets a `.src` affix.

On the server, tests run if `process.env.NODE_ENV` is set to `development`. In the browser, the tests run if the hostname is `localhost` (however, in production it is best to redirect spec file URLs to source file URLs to avoid the additional network overhead).

## Example

First, let's define a dummy module called `randomEvenInteger`:

`./randomEvenInteger.src.mjs`
```js
export function randomEvenInteger() {

    let randomInt = 1
    while ((randomInt % 2) !== 0) {
        randomInt = parseInt(String(Math.random()).slice(2))
    }

    return randomInt
}
```

Here's the specification file:

`./randomEvenInteger.mjs`
```js
import assert from 'node:assert/strict'
import { mock, test } from '@jeffmcmahan/specjs'
import { randomEvenInteger } from './randomEvenInteger.src.mjs'
export { randomEvenInteger }

test((done) => {
    const randomInt = randomEvenInteger()
    assert(randomInt > 0)
    assert(Number.isInteger(randomInt))
    assert(randomInt % 2 === 0)
    done()
})
```

This spec file imports the `randomEvenInteger` function and tests it, and then exports it - passing it through, as it were. Client code will accesses `randomEvenInteger` by importing the spec file *not* the source file. As shown:

```js
import { randomEvenInteger } from './randomEvenInteger.mjs'
```

Importing the module this way causes the tests to be defined and run as a matter of course.

## Spooky Mocking at a Distance

The `fn` function is a decorator which adds the ability to easily redefine any function within the context of a single specific test. So here's an example of the kind of code we might want to make mockable:

```js
import { fn } from '@jeffmcmahan/specjs'

export const dbQuery = fn (async (queryStatement, bindings) => {

    const connection = await db.getConnection()
    const results = await connection.query(queryStatement, bindings)

    return results.rows
})
```

And here's how the mock gets used:

```js
import assert from 'node:assert/strict'
import { test, mock } from '@jeffmcmahan/specjs'
import { dbQuery } from '../db/dbQuery.mjs'
import { getUser } from './getUser.src.mjs'
export { getUser }

test(async (done) => {

    // dbQuery will be called by getUser(), so we mock it.
    mock(dbQuery)(async (queryStatement, bindings) => {

        assert(queryStatement.includes('select * from users'))
        assert.equal(bindings.id, 5)

        return [{
            id: 5,
            username: 'john.smith',
            email: 'john@johnsmith.com'
        }]
    })

    const user = await getUser(5)

    assert(user)
    assert.equal(user.username, 'john.smith')
    assert.equal(user.id, 5)
    done()
})
```

When the test is `done()`, the dbQuery function's mock is released, and it goes back to firing the real I/O-inducing code.
