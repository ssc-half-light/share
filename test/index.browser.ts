import { test } from '@socketsupply/tapzero'
import { FileSystem, Program, Session, path } from '@oddjs/odd'
import { createUsername } from '@ssc-hermes/profile'
import { ShareDetails } from '@oddjs/odd/fs/types'

// @ts-ignore
const wn = self.oddjs

let program:Program
let alicesUsername:string
let session:Session
let wnfs:FileSystem
let APP_INFO:{ name, creator }

let program2:Program
let bobsUsername:string
let session2:Session|null
let wnfs2:FileSystem
let APP_INFO2:{ name, creator }

test('setup', async t => {
    APP_INFO = { name: 'testing', creator: 'test' }
    program = await wn.program({
        namespace: APP_INFO,
        debug: true
    })

    t.ok(wn, 'wn should exist')
    t.ok(program, 'should create a program')

    alicesUsername = await createUsername(program.components.crypto)

    await program.auth.register({ username: alicesUsername })
    session = await program.auth.session() as Session

    if (!session || !session.fs) throw new Error('not wnfs')
    wnfs = session?.fs

    if (!(await program.fileSystem.hasPublicExchangeKey(wnfs))) {
        await program.fileSystem.addPublicExchangeKey(wnfs)
    }

    await wnfs.publish()
    const published = await once(program, 'fileSystem:publish')
    t.ok(published, 'should emit a publish event')
})

test('setup bob', async t => {
    APP_INFO2 = { name: 'testing2', creator: 'test2' }
    program2 = await wn.program({
        namespace: APP_INFO2,
        debug: true
    })

    t.ok(wn, 'wn should exist')
    t.ok(program2, 'should create a program')

    bobsUsername = await createUsername(program2.components.crypto)

    await program2.auth.register({ username: bobsUsername })
    session2 = await program2.auth.session()

    if (!session2 || !session2.fs) throw new Error('not wnfs')
    wnfs2 = session2?.fs

    if (!(await program2.fileSystem.hasPublicExchangeKey(wnfs2))) {
        await program2.fileSystem.addPublicExchangeKey(wnfs2)
    }

    await wnfs2.publish()
    const published = await once(program2, 'fileSystem:publish')
    t.ok(published, 'should emit a publish event')
})

let shareDetails:ShareDetails

test('share a file', async t => {
    await wnfs.write(path.appData(APP_INFO, path.file('hello.txt')),
        new TextEncoder().encode('hello'))

    if (!session.fs) throw new Error('not fs')  // for TS

    shareDetails = await session.fs.sharePrivate(
        [path.appData(APP_INFO, path.file('hello.txt'))],
        { shareWith: bobsUsername }
    )

    t.ok(shareDetails.shareId, 'should return a shareId')
    t.equal(shareDetails.sharedBy.username, alicesUsername,
        'should be shared by the right username')

    await wnfs.publish()
    const published = await once(program, 'fileSystem:publish')
    t.ok(published, 'should emit a publish event')
})

test('accept the shared directory', async t => {
    await wnfs2.acceptShare({
        shareId: shareDetails.shareId,
        sharedBy: shareDetails.sharedBy.username
    })

    const buf = await wnfs2.read(path.file(
        path.RootBranch.Private,
        'Shared with me',
        shareDetails.sharedBy.username,
        'hello.txt'
    ))

    const hello = new TextDecoder().decode(buf)
    t.equal(hello, 'hello', 'should read the file from Alice')
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
