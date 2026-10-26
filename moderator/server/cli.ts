import { readSnapshot } from '../../plugins/content'
import { createInvite } from './auth'
import { all, audit, run, type UserRow } from './db'
import { changesTo, load, publish, verifyChain } from './store'

// Server-side administration, run inside the container (docs/MODERACE.md):
//   node moderator/dist-server/cli.mjs invite "Jméno" [admin|moderator]   a single-use invite link (72 h)
//   node moderator/dist-server/cli.mjs users                                 accounts
//   node moderator/dist-server/cli.mjs disable <user-id>                     switch an account off and sign it out
//   node moderator/dist-server/cli.mjs verify                                check the hash chain of the content history
//   node moderator/dist-server/cli.mjs import <dir> "<reason>"               publish the content of a folder (e.g. the git mirror)
//                                                                            as a new release; restart the server afterwards
// The first admin is created with `invite "<name>" admin`; everything else is done in the app.

const [cmd, ...args] = process.argv.slice(2)

switch (cmd) {
  case 'invite': {
    const name = (args[0] ?? '').trim()
    const role = args[1] === 'admin' ? 'admin' : 'moderator'
    if (name.length < 2) { console.error('Usage: invite "<name>" [admin|moderator]'); process.exit(1) }
    const { url, expiresAt } = createInvite(null, 'user', name, role)
    audit('invite.created', null, { name, role, via: 'cli' })
    console.log(`Invite for ${name} (${role}), valid until ${new Date(expiresAt).toISOString()}, single use:\n${url}`)
    break
  }
  case 'users':
    for (const u of all<UserRow>('SELECT * FROM users ORDER BY name')) console.log(`${u.id}  ${u.active ? 'active  ' : 'disabled'}  ${u.role.padEnd(9)}  ${u.name}`)
    break
  case 'disable': {
    const n = run('UPDATE users SET active = 0 WHERE id = ?', args[0] ?? '').changes
    run('DELETE FROM sessions WHERE user_id = ?', args[0] ?? '')
    run('DELETE FROM api_tokens WHERE user_id = ?', args[0] ?? '')
    run("DELETE FROM invites WHERE user_id = ? AND used_at IS NULL", args[0] ?? '')
    audit('user.disabled', null, { user: args[0], via: 'cli' })
    console.log(n ? 'Disabled and signed out.' : 'No such user.')
    break
  }
  case 'verify': {
    const c = verifyChain()
    console.log(c.ok ? `OK: ${c.count} versions, chain ${c.last}` : `BROKEN at version ${c.brokenAt} (${c.count} checked)`)
    process.exit(c.ok ? 0 : 1)
    break
  }
  case 'import': {
    const [dir, reason] = args
    if (!dir || !reason) { console.error('Usage: import <content dir> "<reason>"'); process.exit(1) }
    load()
    const changes = changesTo(readSnapshot(dir))
    if (!changes.length) { console.log('Nothing to import: the content is the same.'); break }
    const r = publish(changes, { userId: null, reason: 'import', note: reason })
    audit('content.imported', null, { release: r.release, docs: changes.length, via: 'cli', reason })
    console.log(`Imported ${changes.length} document(s) as release ${r.release}. Restart the server so it serves it.`)
    break
  }
  default:
    console.log('Commands: invite "<name>" [admin|moderator] · users · disable <user-id> · verify · import <dir> "<reason>"')
}
