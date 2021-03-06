import { Neutrino } from 'neutrino'
import merge from 'deepmerge'
import react from 'neutrino-preset-react'
import {
  env,
  ssr,
  betterOpen,
  betterDev,
  extractStyle,
  html,
  minifyStyle,
} from './middlewares'
import { Options } from './Options'

export default (neutrino: Neutrino, opts: Partial<Options> = {}) => {
  const isProd = process.env.NODE_ENV === 'production'
  const options = merge<Options>(
    {
      devServer: {
        quiet: neutrino.options.quiet,
        noInfo: neutrino.options.quiet,
        port: 5000,
        https: false,
        open: true,
        stats: {
          errorDetails: false,
        },
      },
      hot: true,
      polyfills: {
        async: true,
      },
      tux: {
        admin: process.env.NODE_ENV !== 'production',
      },
      html: {},
    },
    opts as Options
  )
  // This preset depends on a target option, let's give it a default.
  neutrino.options.target = neutrino.options.target || 'browser'

  // Build on top of the offical react preset (overriding open functionality).
  neutrino.use(react, merge<any>(options, { devServer: { open: false } }))

  // Switch to custom html plugin.
  neutrino.use(html, options.html)

  // Add more environment variables.
  neutrino.use(env, options)

  // prettier-ignore
  neutrino.config
    // Neutrino defaults to relative paths './'. Tux is optimized for SPAs, where apsolute paths
    // are a better default.
    .output
      .publicPath('/')
      .end()
    // Use a better open utility.
    .when(options.devServer.open, () => neutrino.use(betterOpen, options))
    .when(isProd, () => {
      neutrino.use(extractStyle)
      neutrino.use(minifyStyle)
    })
    .when(!isProd, () => {
      neutrino.use(betterDev, options)
    })

  // Wait until all presets and middlewares have run before
  // adapting the config for SSR.
  if (neutrino.options.target === 'server') {
    neutrino.on('prerun', () => neutrino.use(ssr, options))
  }
}
