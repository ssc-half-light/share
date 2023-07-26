import { test } from '@socketsupply/tapzero'
import { Program, Session } from '@oddjs/odd'
import { createUsername } from '@ssc-hermes/profile'
import { example } from '../dist/index.js'

// @ts-ignore
const wn = self.oddjs

let program:Program
let alicesUsername:string
let session:Session|null

test('setup', async t => {
    const APP_INFO = { name: 'testing', creator: 'test' }
    program = await wn.program({
        namespace: APP_INFO,
        debug: true
    })

    t.ok(wn, 'wn should exist')
    t.ok(program, 'should create a program')

    alicesUsername = await createUsername(program.components.crypto)

    await program.auth.register({ username: alicesUsername })
    session = await program.auth.session()
    const wnfs = session?.fs
    if (!wnfs) throw new Error('not wnfs')

    if (!(await program.fileSystem.hasPublicExchangeKey(wnfs))) {
        await program.fileSystem.addPublicExchangeKey(wnfs)
    }

    await wnfs.publish()
    const published = await once(program, 'fileSystem:publish')
    t.ok(published, 'should emit a publish event')
})

test('example', t => {
    const random = example(program.components.crypto)
    t.ok(random, 'should return something')
})

function once (bus:Program, eventName:string) {
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
