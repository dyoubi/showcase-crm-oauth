import {Hook} from '@oclif/core'

const hook: Hook<'init'> = async function (opts) {
  console.profile('cli:exec');
}

export default hook
