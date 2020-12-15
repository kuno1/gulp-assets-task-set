'use strict';

/*!
 * jQuery depending JavaScript.
 *
 * @license GPL-3.0-or-later
 * @deps jquery
 */

const $ = jQuery;

$( document ).on( '.btn', 'click', () => {
	// eslint-disable-next-line no-console
	console.log( 'Clicked!' );
} );

// This line should slow error.
console.log( 'Loaded' );
