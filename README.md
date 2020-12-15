# Gulp Assets Task Set

A series of gulp task set for Web Development.

## Installation

Install via npm library.

```
npm install --save-dev @kunoichi/gulp-assets-task-set
```

Run command and copy configs if wanted.

```
# Copy all config files.
npx copy-config
```

Or else, you can specify 1 by 1.

```
# copy gulp file and webpack.
npx copy-config --gulpfile --webpack
```

Here's a list of command options:

| Option         | Shorhand | File                |
|----------------|----------|---------------------|
| --gulpfild     | -g       | gulpfile.js         |
| --browserlist  | -b       | .browserlistrc      |
| --eslint       | -e       | .eslintrc           |
| --editorconfig | -c       | .editorconfig       |
| --stylelint    | -s       | stylelint.config.js |
| --webpack      | -w       | webpack.config.js   |

After installation, try `npx gulp --tasks` to find all tasks.

## How to Use

This library registers many tasks. Basic directory structure is:

```
src
├img/(*.jpg, *.png, *.gif, *.svg)
├js/*.js
├scss/*.scss
└html/*.pug
```

These source files are transpiled like:

```
dist
├img/(*.jpg, *.png, *.gif, *.svg, *.webp)
├js/*.js
├scss/*.css
└*.html
```

To customize directory name, change task registration in `gulpfile.js` like `gulpTask.all( 'src', 'public' );`.

## Jobs

### HTML & BrowserSync

All `src/html/*.pug` files are compiled to HTML by [pug](https://pugjs.org/api/getting-started.html). And you can watch them with [BrowserSync](https://browsersync.io/) by `gulp bs`.

### JS 

All `src/js/*.js` will be transpiled by [webpack](https://webpack.js.org/) + [babel](https://babeljs.io/).

- Support [ES6](http://www.ecma-international.org/ecma-262/6.0/index.html) syntax.
- Support [React JSX](https://reactjs.org/docs/introducing-jsx.html).
- Scripts are minimized with [Terser Webpack Plugin](https://webpack.js.org/plugins/terser-webpack-plugin/).

You can import libraries with module loader `import { foo } from 'var';`. But on WordPress development we recommend `@deps` comment.

### CSS

All `src/scss/**/*.scss` will be transpiled by [gulp-sass](https://www.npmjs.com/package/gulp-sass).

### Images

- All images in `src/img/**/*` will be optimized and minified.
- Minified `dist/img/**/*.{jpg,jpeg,png}` will be ottimized into [webp](https://developers.google.com/speed/webp) `dist/img/**/*.jpg.webp`.

### Dependencies

All css and JS in `dist/{js,css}/**/*.{js,css}` will be parsed and dumped in `wp-dependencies.json` with [@kunoichi/grab-deps](https://www.npmjs.com/package/@kunoichi/grab-deps).

## Acknowlegement

- Photo `assets/img/cat.jpg` is by [Snapwire in Pexels](https://www.pexels.com/photo/730896/) with CC-0.

## License

MIT &copy; [Kunoichi INC](https://kunoichiwp.com)
