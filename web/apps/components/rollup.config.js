import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    // {
    //   file: "dist/index.js",
    //   format: "cjs",
    //   sourcemap: true,
    //   exports: "named",
    // },
    {
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      dir: 'dist',
    },
  ],
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'react-dom/client',
  ],
  plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })],
};
