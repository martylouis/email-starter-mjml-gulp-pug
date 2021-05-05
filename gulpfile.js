const gulp = require("gulp");
const mjmlGulp = require("gulp-mjml");
const mjml = require("mjml");
const pug = require("gulp-pug");
const fs = require("fs");
const del = require("del");
const yaml = require("js-yaml");
const yamlMerge = require("gulp-yaml-merge");
const data = require("gulp-data");
const rename = require("gulp-rename");
const bs = require("browser-sync");
const robots = require("gulp-robots");

const paths = {
  data_src: "./data/*.yml",
  pug: {
    watch: "./src/**/*.pug",
    build: [
      "./src/**/*.pug",
      "./src/templates/*.pug",
      "!./src/_*/",
      "!./src/_*/**/*",
      "!./src/**/_*/",
      "!./src/**/_*/**/*",
    ],
  },
  mjml: {
    src: "./.tmp/mjml/**/*.mjml",
    dest: "./.tmp/mjml",
  },
  html: "./html",
  tmp: "./.tmp",
};

gulp.task("merge:data", () => {
  return gulp
    .src(paths.data_src)
    .pipe(yamlMerge("data.bundle.yaml"))
    .pipe(gulp.dest(paths.tmp));
});

const getDataBundle = () => {
  const yml_bundle = fs.readFileSync(`${paths.tmp}/data.bundle.yaml`, "utf8");
  return yaml.load(yml_bundle);
};

gulp.task("build:mjml", () => {
  return gulp
    .src(paths.pug.build)
    .pipe(data(getDataBundle))
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(
      rename({
        extname: ".mjml",
      })
    )
    .pipe(gulp.dest(paths.mjml.dest));
});

gulp.task("clean:html", () => {
  return del([paths.html]);
});

gulp.task("build:html", () => {
  const options = {
    validationLevel: "strict",
  };

  return gulp
    .src(paths.mjml.src)
    .pipe(mjmlGulp(mjml, options))
    .pipe(gulp.dest(paths.html));
});

gulp.task("build:robots", () => {
  return gulp
    .src([`${paths.html}/**/index.html`])
    .pipe(
      robots({
        useragent: "*",
        disallow: ["/"],
      })
    )
    .pipe(gulp.dest([paths.html]));
});

gulp.task("browser-sync", (cb) => {
  bs.init(
    {
      server: {
        baseDir: paths.html,
      },
      port: 3000,
      open: false,
    },
    cb
  );
});

gulp.task("watch", () => {
  return gulp
    .watch(paths.pug.watch, gulp.series("build:mjml", "build:html"))
    .on("change", bs.reload);
});

gulp.task(
  "build",
  gulp.series(
    "clean:html",
    "merge:data",
    "build:mjml",
    "build:html",
    "build:robots"
  )
);

gulp.task("default", gulp.series("build", "browser-sync", "watch"));
