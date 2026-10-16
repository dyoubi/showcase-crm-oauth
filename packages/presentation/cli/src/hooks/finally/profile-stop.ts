import {Hook} from '@oclif/core'

const hook: Hook<'finally'> = async function (opts) {
  console.profileEnd('cli:exec');
}

export default hook
