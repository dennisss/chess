'use strict';

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	rename = require('gulp-rename'),
	jshint = require('gulp-jshint'),
	jsdoc = require("gulp-jsdoc3"),
	autoprefixer = require('gulp-autoprefixer'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	gutil = require('gulp-util'),
	sourcemaps = require('gulp-sourcemaps'),
	merge = require('merge-stream'),
	child_process = require('child_process'),
	rimraf = require('gulp-rimraf');



gulp.task('watch', function(){
	gulp.watch(['src/app/**/*'], ['server']);

	var watcher = gulp.watch(['src/web/**/*'], ['build']);
	watcher.on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});

})

gulp.task('lint', function(){
	gulp.src('./src/**/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
})

gulp.task('doc', function(){
	return gulp.src(["./src/**/*.js", "README.md"])
	.pipe(jsdoc(require('./config/jsdoc')))
})

gulp.task('clean', function(){
	return gulp.src('./public/assets/**/*', {read: false})
	.pipe(rimraf());
})

gulp.task('build', ['clean'], function(){

	var b = browserify({
		entries: './src/web/scripts/index.js',
		debug: true,
	});

	var buildJs = b.bundle()
	.pipe(source('app.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	// Add transformation tasks to the pipeline here.
	.on('error', gutil.log)
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('./public/assets/scripts/'));



	var buildCss = gulp.src('./src/web/styles/index.scss')

	.pipe(sass().on('error', sass.logError))
	//.pipe(less({
	//	paths: [ './bower_components' ]
	//}))

	.pipe(autoprefixer())
	.pipe(rename('app.css'))
	.pipe(gulp.dest('./public/assets/styles/'));


	return merge(buildJs, buildCss);
})





var server = null;
function runServer(env){
	function start(){
		console.log('Starting server')
		server = child_process.spawn('node', ['src/app'], {
			stdio: ['ignore', 1, 2]
		})

		server.on('exit', function(code, signal){
			console.log('Server exited.')
			start();
		})
	}

	if(server){
		console.log('Stopping server')
		server.kill('SIGINT')
		return;
	}
	else{
		start();
	}
}

process.on('exit', function(){
	if(server != null){
		console.log('Killing server')
		server.kill('SIGINT');
	}
})


gulp.task('server', function(){
	runServer();
});



gulp.task('default', ['build', 'watch', 'server']);
