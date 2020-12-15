/*!
 * A series of gulp tasks for Web development.
 *
 */
const { Transform } = require( 'stream' );
const fs = require( 'fs' );
const gulp = require( 'gulp' );
const $ = require( 'gulp-load-plugins' )();
const mergeStream = require( 'merge-stream' );
const webpack = require( 'webpack-stream' );
const named = require( 'vinyl-named' );
const mozjpeg = require( 'imagemin-mozjpeg' );
const pngquant = require( 'imagemin-pngquant' );
const browserSync = require( 'browser-sync' );
const { dumpSetting } = require('@kunoichi/grab-deps');


const gulpAssetsTaskSet = {

	/**
	 * Convert images to webp.
	 *
	 * @see https://github.com/imagemin/imagemin-webp#imageminwebpoptions
	 * @param {string|array} src     Target files.
	 * @param {string}       dist    Destination directory.
	 * @param {object}       options Option imagemin-webp.
	 * @returns {Transform}
	 */
	webp( src= 'dist/img/**/*.{jpg,jpeg,png}', dist= 'dist/img', options = {} ) {
		return gulp.src( src )
			.pipe( $.cached( 'webp', {
				optimizeMemory: true,
			} ) )
			.pipe( $.webp( options ) )
			.pipe( $.revertPath() )
			.pipe( $.rename( function( path ) {
				return {
					dirname: path.dirname,
					basename: path.basename + path.extname,
					extname: ".webp",
				};
			} ) )
			.pipe( gulp.dest( dist ) );
	},

	/**
	 *
	 * @param src
	 * @param dist
	 * @returns {*}
	 */
	jpeg2( src = 'dist/img/**/*.{jpg,jpeg}', dist = 'dist/img', done = null ) {
		return gulp.src( src )
			.pipe( $.plumber( {
				errorHandler: $.notify.onError( 'JPEG2000: <%= error.message %>' ),
			} ) )
			.pipe( $.jpeg2000() )
			.on( 'error', function( error ) {
				if ( done ) {
					console.error( error );
					done( error );
				}
			} )
			.pipe( $.revertPath() )
			.pipe( $.rename( function( path ) {
				console.log( path );
				return {
					dirname: path.dirname,
					basename: path.basename + path.extname,
					extname: ".jp2",
				};
			} ) )
			.pipe( gulp.dest( dist ) );
	},

	/**
	 * Minimize SVG.
	 *
	 * @param {string|array} src     Target files.
	 * @param {string}       dist    Destination
	 * @param {object}       options
	 * @returns {Transform}
	 */
	svgmin( src = 'assets/img/**/*.svg', dist = 'dist/img', options = {} ) {
		return gulp.src( src )
			.pipe( $.cached( 'svgmin', {
				optimizeMemory: true,
			} ) )
			.pipe( $.svgmin( options ) )
			.pipe( gulp.dest( dist ) );
	},

	/**
	 * Minify images.
	 *
	 * @param {string|array} src     Target files.
	 * @param {string}       dist    Destination
	 * @param {object}       options
	 * @returns {Transform}
	 */
	imagemin( src = 'assets/img/**/*.{jpg,jpeg,png,gif}', dist = 'dist/img', options = {} ) {
		const quality = Object.assign( options, {
			pngQualify: [ .65, .8 ],
			jpgQuality: 85,
		} );
		return gulp.src( src )
			.pipe( $.cached( 'imagemin', {
				optimizeMemory: true,
			} ) )
			.pipe( $.imagemin( [
				pngquant( {
					quality: quality.pngQualify,
					speed: 1,
					floyd: 0,
				} ),
				mozjpeg( {
					quality: quality.jpgQuality,
					progressive: true,
				} ),
				$.imagemin.svgo(),
				$.imagemin.optipng(),
				$.imagemin.gifsicle(),
			] ) )
			.pipe( gulp.dest( dist ) );
	},

	/**
	 * Register tasks.
	 *
	 * @param {string} src  Image source directory.
	 * @param {string} dist Image destination directory.
	 */
	imageTasks( src = 'assets/img', dist = 'dist/img' ) {
		gulp.task( 'imagemin:misc', () => {
			return this.imagemin( `${src}/**/*.{jpg,jpeg,png,gif}`, dist );
		} );
		gulp.task( 'imagemin:svg', () => {
			return this.svgmin( `${src}/**/*.svg`, dist );
		} );
		gulp.task( 'imagemin:webp', () => {
			return this.webp( `${dist}/**/*.{jpg,png,jpeg}`, dist );
		} );
		gulp.task( 'imagemin:jpeg2', ( done ) => {
			return this.jpeg2( `${dist}/**/*.{jpg,jpeg}`, dist, done );
		} );
		// Minimize all.
		gulp.task( 'imagemin', gulp.series( gulp.parallel( 'imagemin:misc', 'imagemin:svg' ), 'imagemin:webp' ) );
	},

	/**
	 * Stylelint with stylelint config.
	 *
	 * @param {string|array} src     Target files.
	 * @param {object}       options Option for stylelint
	 * @returns {Transform}
	 */
	stylelint( src = 'assets/scss/**/*.scss', options = null ) {
		if ( null === options ) {
			options = {
				reporters: [
					{
						formatter: 'string',
						console: true,
					},
				],
			};
		}
		return gulp.src( src )
			.pipe( $.cached( 'stylelint' ) )
			.pipe( $.plumber( {
				errorHandler: $.notify.onError( 'Stylelint: <%= error.message %>' ),
			} ) )
			.pipe( $.stylelint( options ) );
	},

	/**
	 * Scss compiler
	 *
	 * @param {string|array} src         Target files.
	 * @param {string}       dist        Destination
	 * @param {string}       sassOptions Config file path.
	 * @returns {Transform}
	 */
	scss( src = 'assets/scss/**/*.scss', dist = 'dist/css', sassOptions = {} ) {
		sassOptions = Object.assign( {
			errLogToConsole: true,
			outputStyle: 'compressed',
		}, sassOptions );
		return gulp.src( src )
			.pipe( $.plumber( {
				errorHandler: $.notify.onError( 'SCSS: <%= error.message %>' ),
			} ) )
			.pipe( $.sourcemaps.init( { loadMaps: true } ) )
			.pipe( $.sassGlob() )
			.pipe( $.sass( sassOptions ) )
			.pipe( $.autoprefixer() )
			.pipe( $.sourcemaps.write( './map' ) )
			.pipe( gulp.dest( dist ) );
	},

	/**
	 * Register CSS tasks.
	 *
	 * @param {string} src
	 * @param {string} dist
	 *
	 */
	cssTask( src = 'assets/scss/**/*.scss', dist = 'dist/css' ) {
		gulp.task( 'css:generate', () => {
			return this.scss( src, dist );
		} );
		gulp.task( 'css:stylelint', () => {
			return this.stylelint( src );
		} );
		gulp.task( 'css', gulp.parallel( 'css:generate', 'css:stylelint' ) );
	},

	/**
	 * Eslint with eslintrc.
	 *
	 * @see https://eslint.org/docs/developer-guide/nodejs-api#cliengine
	 * @param {string|array} src          Target files.
	 * @param {object}       eslintOption Options for eslint.
	 * @returns {Transform}
	 */
	eslint( src= 'assets/js/**/*.js' , eslintOption = {} ) {
		eslintOption = Object.assign( {
				useEslintrc: true,
		}, eslintOption );
		return gulp.src( src )
			.pipe( $.cached( 'eslint' ) )
			.pipe( $.eslint( eslintOption ) )
			.pipe( $.eslint.format() );
	},

	/**
	 * Bundle NexsJS and transpile them to browser-compatible JS.
	 *
	 * @param {string|array} src               Target files.
	 * @param {string}       dist              Destination
	 * @param {string}       webpackConfigPath Config file path.
	 * @returns {Transform}
	 */
	es6( src = 'assets/js/**/*.js', dist = 'dist/js', webpackConfigPath = './webpack.config.js' ) {
		const tmp = {};
		// check file exists.
		if ( ! fs.existsSync( webpackConfigPath ) ) {
			throw Error( `webpack.config.js does not exist at ${webpackConfigPath}` );
		}
		const webpackConfig = require( webpackConfigPath );
		return gulp.src( src )
			.pipe( $.plumber( {
				errorHandler: $.notify.onError( 'JS: <%= error.message %>' ),
			} ) )
			.pipe( named() )
			.pipe( $.rename( function( path ) {
				tmp[ path.basename ] = path.dirname;
			} ) )
			.pipe( webpack( webpackConfig ) )
			.pipe( $.rename( function( path ) {
				if ( tmp[ path.basename ] ) {
					path.dirname = tmp[ path.basename ];
				} else if ( '.map' === path.extname && tmp[ path.basename.replace( /\.js$/, '' ) ] ) {
					path.dirname = tmp[ path.basename.replace( /\.js$/, '' ) ];
				}
				return path;
			} ) )
			.pipe( gulp.dest( dist ) );
	},

	/**
	 * Register JS tasks.
	 *
	 * @param {string} src
	 * @param {string} dist
	 *
	 */
	jsTasks( src = 'assets/js', dist = 'dist/js' ) {
		gulp.task( 'js:es6', () => {
			return this.es6( [
				`${src}/**/*.js`,
				`!${src}/**/_*.js`,
			], dist );
		} );
		gulp.task( 'js:eslint', () => {
			return this.eslint( `${src}/**/*.js` );
		} );
		gulp.task( 'js', gulp.parallel( 'js:es6', 'js:eslint' ) );
	},

	/**
	 * Copy libraries.
	 *
	 * @param {[{ src: '', dist: ''}]} pairs Array of object
	 * @returns {PassThrough}
	 */
	copy( pairs = [] ) {
		const stream = new mergeStream();
		pairs.forEach( pair => {
			if ( pair.hasOwnProperty( 'src' ) && pair.hasOwnProperty( 'dist' ) ) {
				stream.add( gulp.src( pair.src ).pipe( gulp.dest( pair.dist ) ) )
			}
		} );
		return stream;
	},

	/**
	 * Register copy tasks.
	 */
	copyTask() {
		gulp.task( 'copy', ( done ) => {
			const pairs = [];
			if ( pairs.length ) {
				return this.copy( pairs );
			} else {
				console.log( 'Nothing to copy.' );
				done();
			}
		} );
	},

	/**
	 * Compile pug to HTMML.
	 *
	 * @param {string|array} src       Target files.
	 * @param {string}       dist      Destination
	 * @param {object}       pugOption Option for pug.
	 * @returns {Transform}
	 */
	pug( src = [ 'assets/html/**/*.pug', '!assets/html/**/_*.pug' ], dist = 'dist', pugOption = {} ) {
		pugOption = Object.assign( {
			pretty: true,
		}, pugOption );
		return gulp.src( src )
			.pipe( $.plumber( {
				errorHandler: $.notify.onError( 'PUG: <%= error.message %>' ),
			} ) )
			.pipe( $.pug( pugOption ) )
			.pipe( gulp.dest( dist ) );
	},

	/**
	 * Lint generated html.
	 *
	 * @param {string|array} src Target files.
	 * @returns {Transform}
	 */
	htmlLint( src = 'dist/**/*.html' ) {
		return gulp.src( src )
			.pipe( $.cached( 'htmllint' ) )
			.pipe( $.htmllint( '.htmllintrc' ) );
	},

	/**
	 * Register html related tasks.
	 *
	 * @param {string} src
	 * @param {string} dist
	 */
	htmlTask( src = 'assets', dist = 'dist' ) {
		gulp.task( 'html:pug', () => {
			return this.pug( [
				`${src}/html/**/*.pug`,
				`!${src}/html/**/_*.pug`,
			], dist );
		} );
		gulp.task( 'html:lint', () => {
			return this.htmlLint( `${dist}/**/*.html` );
		} );
		gulp.task( 'html', gulp.series( 'html:pug', 'html:lint' ) );
	},

	/**
	 * Register gup task for BrowserSync
	 *
	 * @param {string|string[]} dir     Base directory.
	 * @param {string|string[]} watch   Files to watch.
	 * @param {object}          options Options for BrowserSync
	 */
	bs( dir = 'dist', watch = 'dist/**/*', options = {} ) {
		options = Object.assign( {
			server: {
				baseDir: dir,
				index: 'index.html'
			},
			reloadDelay: 500
		}, options );
		// Register start task.
		gulp.task( 'bs-start', ( done ) => {
			browserSync( options );
			done();
		} );
		// Register reload task.
		gulp.task( 'bs-reload', ( done ) => {
			browserSync.reload();
			done();
		} );
		// Watch.
		gulp.task( 'bs-watch', ( done ) => {
			gulp.watch( watch, gulp.task( 'bs-reload' ) );
			done();
		} );
		// Register all tasks.
		gulp.task( 'bs', gulp.series( 'bs-start', 'bs-watch' ) );
	},

	/**
	 * Register dump task to gulp.
	 *
	 * @param {string} target   Target directory to parse and dump.
	 * @param {string} dumpFile Dumped file path.
	 */
	dumpTask( target = 'dist', dumpFile = './wp-dependencies.json' ) {
		// Register task.
		gulp.task( 'dump', ( done ) => {
			dumpSetting( target, dumpFile );
			done();
		} );
	},

	/**
	 * Register all tasks.
	 *
	 * @param {string} src  Source directory.
	 * @param {string} dist Target directory.
	 */
	all( src = 'assets', dist = 'dist' ) {
		// Register tasks.
		this.imageTasks( `${src}/img`, `${dist}/img` );
		this.jsTasks(  `${src}/js`, `${dist}/js` );
		this.cssTask( `${src}/scss/**/*.scss`, `${dist}/css`  );
		this.htmlTask( src, dist );
		this.dumpTask( `${src}/`);
		this.copyTask();
		// Dump task.
		this.dumpTask( dist );
		// Register watch task.
		gulp.task( 'watch', ( done ) => {
			this.watchAll( src, dist );
			done();
		} );
		// BrowserSync.
		this.bs( dist, `${dist}/**/*` );
		// Packaged tasks.
		gulp.task( 'build', gulp.series( 'copy', gulp.parallel( 'js:es6', 'css:generate', 'imagemin', 'html:pug' ), 'dump' ) );
		gulp.task( 'lint', gulp.parallel( 'css:stylelint', 'js:eslint', 'html:lint' ) )
	},

	/**
	 * Register watch tasks.
	 *
	 * @param {string} src
	 * @param {string} dist
	 */
	watchAll( src = 'assets', dist = 'dist' ) {
		// Watch JS.
		gulp.watch( `${src}/js/**/*.js`, gulp.task( 'js' ) );
		// Watch CSS
		gulp.watch( `${src}/scss/**/*.scss`, gulp.task( 'css' ) );
		// Watch HTML
		gulp.watch( `${src}/html/**/*.html`, gulp.task( 'html' ) );
		// Imagemin.
		gulp.watch( `${src}/img/**/*`, gulp.parallel( 'imagemin:misc', 'imagemin:svg' ) );
		// webp.
		gulp.watch( `${dist}/img/**/*.{jpg,png,jpeg}`, gulp.task( 'imagemin:webp' ) );
		// Dump.
		gulp.watch( `${dist}/**/*.{js,css}`, gulp.task( 'dump' ) );
	}
};

module.exports = gulpAssetsTaskSet;
