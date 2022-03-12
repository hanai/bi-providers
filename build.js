const pkg = require('./package.json')

require('esbuild')
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/main.js',
    format: 'cjs',
    bundle: true,
    platform: 'node',
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  })
  .catch(() => process.exit(1))

require('esbuild')
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/module.js',
    format: 'esm',
    bundle: true,
    platform: 'node',
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  })
  .catch(() => process.exit(1))
