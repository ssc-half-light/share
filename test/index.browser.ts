import { test } from '@socketsupply/tapzero'
import { Program } from '@oddjs/odd'
import { example } from '../dist/index.js'

// @ts-ignore
const wn = self.oddjs

let program:Program
test('setup', async t => {
    const APP_INFO = { name: 'testing', creator: 'test' }
    program = await wn.program({
        namespace: APP_INFO,
        debug: true
    })

    t.ok(wn, 'wn should exist')
    t.ok(program, 'should create a program')
})

test('example', t => {
    const random = example(program.components.crypto)
    t.ok(random, 'should return something')
})
