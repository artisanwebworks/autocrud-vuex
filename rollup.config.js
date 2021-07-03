
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
    external: ['axios', 'lodash'],

    input: 'src/autocrud-store-module.js',

    output: {
        file: 'dist/autocrud-store-module.es.js',
        format: 'cjs'
    },

    plugins: [
        resolve(),
        babel({ babelHelpers: 'bundled' })
    ]
};
