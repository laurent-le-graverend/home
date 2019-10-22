const { src, dest, watch, series, parallel, lastRun } = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const browserSync = require('browser-sync')
const del = require('del')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const { argv } = require('yargs')

const $ = gulpLoadPlugins()
const server = browserSync.create()

const port = argv.port || 9000

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

function styles () {
  return src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.if(!isProd, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer()
    ]))
    .pipe($.if(!isProd, $.sourcemaps.write()))
    .pipe(dest('.tmp/styles'))
    .pipe(server.reload({ stream: true }))
};

function scripts () {
  return src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.if(!isProd, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(!isProd, $.sourcemaps.write('.')))
    .pipe(dest('.tmp/scripts'))
    .pipe(server.reload({ stream: true }))
};

function html () {
  return src('app/*.html')
    .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }))
    .pipe($.if(/\.js$/, $.uglify({ compress: { drop_console: true } })))
    .pipe($.if(/\.css$/, $.postcss([cssnano({ safe: true, autoprefixer: false })])))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: { compress: { drop_console: true } },
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(dest('dist'))
}

function images () {
  return src('app/images/**/*', { since: lastRun(images) })
    .pipe($.imagemin())
    .pipe(dest('dist/images'))
};

function extras () {
  return src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(dest('dist'))
};

function clean () {
  return del(['.tmp', 'dist'])
}

function measureSize () {
  return src('dist/**/*')
    .pipe($.size({ title: 'build', gzip: true }))
}

const build = series(
  clean,
  parallel(
    series(parallel(styles, scripts), html),
    images,
    extras
  ),
  measureSize
)

function startAppServer () {
  server.init({
    notify: false,
    port,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })

  watch([
    'app/*.html',
    'app/images/**/*'
  ]).on('change', server.reload)

  watch('app/styles/**/*.scss', styles)
  watch('app/scripts/**/*.js', scripts)
}

function startDistServer () {
  server.init({
    notify: false,
    port,
    server: {
      baseDir: 'dist',
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

let serve
if (isDev) {
  serve = series(clean, parallel(styles, scripts), startAppServer)
} else if (isProd) {
  serve = series(build, startDistServer)
}

exports.serve = serve
exports.build = build
exports.default = build
