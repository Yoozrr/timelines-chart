import resolve from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import postCss from 'rollup-plugin-postcss';
import postCssSimpleVars from 'postcss-simple-vars';
import postCssNested from 'postcss-nested';
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";
import dts from 'rollup-plugin-dts';
import { name, homepage, version, dependencies, peerDependencies } from './package.json';

const umdConf = {
  format: 'umd',
  name: 'TimelinesChart',
  banner: `// Version ${version} ${name} - ${homepage}`
};

const reg = name.match(/(@[\w-]+\/)?([\w-]+)/i)
const subName = reg[2]

export default [
  {
    input: 'src/index.js',
    output: [
      { // umd
        ...umdConf,
        file: `dist/${subName}.js`,
        sourcemap: true,
      },
      { // minify
        ...umdConf,
        file: `dist/${subName}.min.js`,
        plugins: [terser({
          output: { comments: '/Version/' }
        })]
      }
    ],
    plugins: [
      postCss({
        plugins: [
          postCssSimpleVars(),
          postCssNested()
        ]
      }),
      resolve(),
      commonJs(),
      babel({ exclude: 'node_modules/**' })
    ]
  },
  { // commonJs and ES modules
    input: 'src/index.js',
    output: [
      {
        format: 'cjs',
        file: `dist/${subName}.common.js`
      },
      {
        format: 'es',
        file: `dist/${subName}.module.js`
      }
    ],
    external: [...Object.keys(dependencies || {}), ...Object.keys(peerDependencies || {})],
    plugins: [
      postCss({
        plugins: [
          postCssSimpleVars(),
          postCssNested()
        ]
      }),
      babel()
    ]
  },
  { // expose TS declarations
    input: 'src/index.d.ts',
    output: [{
      file: `dist/${subName}.d.ts`,
      format: 'es'
    }],
    plugins: [dts()]
  }
];