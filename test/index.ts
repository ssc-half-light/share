import { test } from '@socketsupply/tapzero'
import * as odd from '@oddjs/odd'
import { components } from '@ssc-hermes/node-components'
import { example } from '../dist/index.js'

let program:odd.Program

test('setup', async t => {
    program = await odd.assemble({
        namespace: { creator: 'test', name: 'testing' },
        debug: false
    }, components)

    t.ok(program, 'create a program')
})

test('example', t => {
    const random = example(program.components.crypto)
    t.ok(random, 'should return something')
})
