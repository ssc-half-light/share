import { test } from '@socketsupply/tapzero'
import * as odd from '@oddjs/odd'
import { components } from '@ssc-hermes/node-components'
import { createUsername } from '@ssc-hermes/profile'
import { example } from '../dist/index.js'

let program:odd.Program
let alicesUsername:string
let session:odd.Session|null

test('setup', async t => {
    program = await odd.assemble({
        namespace: { creator: 'test', name: 'testing' },
        debug: false
    }, components)

    t.ok(program, 'program exists')
    alicesUsername = await createUsername(program.components.crypto)
    await program.auth.register({ username: alicesUsername })
    session = await program.auth.session()
    const wnfs = session?.fs
    if (!wnfs) throw new Error('not wnfs')

    if (!(await program.fileSystem.hasPublicExchangeKey(wnfs))) {
        await program.fileSystem.addPublicExchangeKey(wnfs)
    }
    const published = await once(program, 'fileSystem:publish')
    t.ok(published, 'should emit a publish event')

    // await wnfs.publish()
})

test('example', t => {
    const random = example(program.components.crypto)
    t.ok(random, 'should return something')
})

function once (bus:odd.Program, eventName:string) {
    return new Promise(resolve => {
        // @ts-ignore
        bus.on(eventName, onEvent)

        function onEvent (ev) {
            resolve(ev)
            // @ts-ignore
            bus.off(eventName, onEvent)
        }
    })
}
