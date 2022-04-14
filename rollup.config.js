import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import { string } from "rollup-plugin-string";
//import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const version = `1.0.3.${Math.floor((Date.now() / 1000))}`;

export default [
	// {
	// 	input: 'src/index.js',
	// 	output: {
	// 		file: 'dist/bsbiappframework.js',
	// 		format: 'es', // 'cjs'
	// 		exports: "named",
	// 		sourcemap: true,
	// 		name: 'bsbiappframework',
	// 		globals: { BsbiDb: 'BsbiDb', MapboxGeocoder: 'MapboxGeocoder' },
	// 	},
	// 	external: ['BsbiDb'],
	//
	// 	plugins: [
	// 		resolve(), // tells Rollup how to find files in node_modules
	// 		replace({
	// 			preventAssignment: true,
	// 			values: {
	// 				BSBI_APP_VERSION: version,
	// 				// ENVIRONMENT: JSON.stringify('development')
	// 			},
	// 		}),
	//
	// 		string({
	// 			// Required to be specified
	// 			include: "**/*.html",
	//
	// 			// Undefined by default
	// 			exclude: ["**/index.html"]
	// 		}),
	// 		sourcemaps(),
	// 		babel({
	// 			exclude: 'node_modules/**', // only transpile our source code
	// 			babelHelpers: 'runtime', // building library rather than app
	// 			inputSourceMap: false, // see https://github.com/rollup/rollup/issues/3457
	// 		}),
	// 		commonjs(), // converts npm packages to ES modules
	// 		production && terser() // minify, but only in production
	// 	]
	// },
	{
		input: 'src/index.js',
		output: {
			dir: 'dist/esm',
			format: 'esm',
			exports: "named",
			sourcemap: true,
			globals: { BsbiDb: 'BsbiDb', MapboxGeocoder: 'MapboxGeocoder' },
		},
		external: ['BsbiDb'],

		plugins: [
			resolve(), // tells Rollup how to find files in node_modules
			replace({
				preventAssignment: true,
				values: {
					BSBI_APP_VERSION: version,
					// ENVIRONMENT: JSON.stringify('development')
				},
			}),

			string({
				// Required to be specified
				include: "**/*.html",

				// Undefined by default
				exclude: ["**/index.html"]
			}),
			sourcemaps(),
			// babel({
			// 	exclude: 'node_modules/**', // only transpile our source code
			// 	babelHelpers: 'runtime' // building library rather than app
			// }),
			commonjs(), // converts npm packages to ES modules
			//production && terser() // minify, but only in production
			terser()
		]
	}
	];
