#!/usr/bin/env node
const commandLineArgs = require('command-line-args')
const fs = require( 'fs' );

const options = Object.assign( {
	webpack: false,
	stylelint: false,
	editorconfig: false,
	eslint: false,
	browserslist: false,
	gulpfile: false,
}, commandLineArgs( [
	{ name: 'webpack', alias: 'w', type: Boolean },
	{ name: 'stylelint', alias: 's', type: Boolean },
	{ name: 'eslint', alias: 'e', type: Boolean },
	{ name: 'editorconfig', alias: 'c', type: Boolean },
	{ name: 'browserslist', alias: 'b', type: Boolean },
	{ name: 'gulpfile', alias: 'g', type: Boolean },
] ) );

// check if all options are empty.
let falses = 0;
let propLength = 0;
for ( const prop in options ) {
	propLength++;
	if ( options.hasOwnProperty( prop ) ) {
		falses += options[ prop ] ? 0 : 1;
	}
}

if ( falses === propLength ) {
	for ( const props in options ) {
		if ( ! options.hasOwnProperty( props ) ) {
			continue;
		}
		options[ props ] = true;
	}
}

for ( const prop in options ) {
	if ( ! options.hasOwnProperty( prop ) || ! options[ prop ] ) {
		continue;
	}
	let fileToCopy = '';
	let target     = '';
	switch ( prop ) {
		case 'editorconfig':
			fileToCopy = `${__dirname}/.${prop}`;
			target = `./.${prop}`;
			break;
		case 'browserslist':
		case 'eslint':
			fileToCopy = `${__dirname}/.${prop}rc`;
			target = `./.${prop}rc`;
			break;
		case 'webpack':
		case 'stylelint':
			fileToCopy = `${__dirname}/${prop}.config.js`;
			target = `./${prop}.config.js`;
			break;
		case 'gulpfile':
			fileToCopy = `${__dirname}/gulpfile.dist.js`;
			target = `./gulpfile.js`;
			break;
	}
	if ( fs.existsSync( target ) ) {
		console.log( 'Target path %s is already exists. Skipped.', target );
	} else {
		try {
			fs.copyFileSync( fileToCopy, target );
		} catch ( err ) {
			console.error( err );
		}
	}
}
