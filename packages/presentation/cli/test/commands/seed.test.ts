import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('seed', () => {
  it('runs seed cmd', async () => {
    const {stdout} = await runCommand('seed')
    expect(stdout).to.contain('hello world')
  })

  it('runs seed --name oclif', async () => {
    const {stdout} = await runCommand('seed --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
