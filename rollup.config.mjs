import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import prettier from 'rollup-plugin-prettier';

const banner = '/*! simple observable proxy v' + process.env.npm_package_version + ' | MIT License | © 2022 Aleph1 Technologies Inc */';

export default [
  // production build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/simple-observable-proxy.js',
      exports: 'named',
      format: 'esm',
      banner
    },
    plugins: [
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
  // minified production build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/simple-observable-proxy.min.js',
      exports: 'named',
      format: 'esm',
      banner
    },
    plugins: [
      typescript({
        compilerOptions: {
          target: 'es6'
        }
      }),
      terser({
        toplevel: true
      })
    ]
  }
];