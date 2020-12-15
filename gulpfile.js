const gulp = require( 'gulp' );
const gulpTask = require( './index.js' );

// Register all defined tasks.
gulpTask.all( 'assets', 'dist' );
