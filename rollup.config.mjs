import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import prettier from 'rollup-plugin-prettier';

const banner = '/*! simple observable proxy v' + process.env.npm_package_version + ' | MIT License | © 2022 Aleph1 Technologies Inc */';

export default [
  // browser build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/simple-observable-proxy.js',
      exports: 'named',
      format: 'esm',
      banner
    },
    plugins: [
      replace({
        preventAssignment: true,
        BROWSER: true
      }),
      typescript({
        compilerOptions: {
          target: 'es6'
        }
      }),
      terser({
        mangle: false,
        toplevel: true,
        module: true
      }),
      prettier()
    ]
  },
  // browser build minified
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/simple-observable-proxy.min.js',
      exports: 'named',
      format: 'esm',
      banner
    },
    plugins: [
      replace({
        preventAssignment: true,
        BROWSER: true
      }),
      typescript({
        compilerOptions: {
          target: 'es6'
        }
      }),
      terser({
        toplevel: true
      })
    ]
  },
  // typescript commonJS
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      exports: 'named',
      format: 'cjs',
      banner
    },
    plugins: [
      replace({
        preventAssignment: true,
        BROWSER: false
      }),
      typescript({
        compilerOptions: {
          target: 'es6'
        }
      }),
      terser({
        mangle: false,
        toplevel: true,
        module: true
      }),
      prettier()
    ]
  },
  // typescript commonJS
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.mjs',
      exports: 'named',
      format: 'esm',
      banner
    },
    plugins: [
      replace({
        preventAssignment: true,
        BROWSER: false
      }),
      typescript({
        compilerOptions: {
          target: 'es6'
        }
      }),
      terser({
        mangle: false,
        toplevel: true,
        module: true
      }),
      prettier()
    ]
  }
];