import { Neutrino, Middleware } from 'neutrino'
import tuxStaticPreset from 'neutrino-preset-tux'
import tuxSsrPreset from 'neutrino-preset-tux/server'
import optional from 'optional'
import { pathOr } from 'ramda'
import { join, resolve } from 'path'
import { Options } from './options'

type Command = 'inspect' | 'build' | 'start'

export async function run(command: Command, options: Options) {
  const neutrinoOptions = await getOptions(options)
  const builders = []

  builders.push(runNeutrino(command, tuxStaticPreset, neutrinoOptions))
  if (options.ssr) {
    builders.push(runNeutrino(command, tuxSsrPreset, neutrinoOptions))
  }

  return Promise.all(builders)
}

async function runNeutrino(command: Command, middleware: Middleware, options: any) {
  const neutrino = new Neutrino(options)

  neutrino.use(middleware)

  if (options.neutrino.use) {
    await neutrino.requiresAndUses(options.neutrino.use).promise()
  }

  const result = await neutrino.run(command)
      .promise()
      .catch(err => { throw err[0] })

  return result
}

async function getOptions(options: Options) {
  const { host, port, admin } = options
  const cwd = process.cwd()
  const pkg = optional(join(cwd, 'package.json')) || {}
  const neutrino = pkg.neutrino || {}
  let document = pathOr(null, ['tux', 'document'], pkg)
  if (document) {
    document = resolve(document)
  }

  return {
    config: {
      devServer: {
        host,
        port,
      },
    },
    tux: {
      admin,
    },
    html: {
      document,
    },
    neutrino,
  };
}
