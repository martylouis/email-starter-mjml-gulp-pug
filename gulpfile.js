const gulp = require("gulp");
const mjmlGulp = require("gulp-mjml");
const mjml = require("mjml");
const pug = require("gulp-pug");
const fs = require("fs");
const yaml = require("js-yaml");
const yamlMerge = require("gulp-yaml-merge");
const data = require("gulp-data");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const bs = require("browser-sync");
const robots = require("gulp-robots");

const srcFiles = [
  "./src/**/*.pug",
  "./src/templates/*.pug",
  "!./src/_*/",
  "!./src/_*/**/*",
  "!./src/**/_*/",
  "!./src/**/_*/**/*",
];

const mjmlFiles = {
  src: "./.tmp/mjml/**/*.mjml",
  dest: "./.tmp/mjml",
};

const htmlPath = "./html";
const dataFiles = "./data/*.yml";

gulp.task("mergeData", () => {
  return gulp
    .src(dataFiles)
    .pipe(yamlMerge("data.bundle.yaml"))
    .pipe(gulp.dest("./.tmp/"));
});

const load_data = () => {
  const yml = fs.readFileSync("./.tmp/data.bundle.yaml", "utf8");
  return yaml.load(yml);
};

gulp.task("buildMjml", () => {
  return (
    gulp
      .src(srcFiles)
      .pipe(data(load_data))
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
      // .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest(mjmlFiles.dest))
  );
});

gulp.task("buildHtml", () => {
  const options = {
    validationLevel: "strict",
  };

  return gulp
    .src(mjmlFiles.src)
    .pipe(mjmlGulp(mjml, options))
    .pipe(gulp.dest(htmlPath));
});

gulp.task("robots", () => {
  return gulp
    .src(["./html/**/index.html"])
    .pipe(
      robots({
        useragent: "*",
        disallow: ["/"],
      })
    )
    .pipe(gulp.dest(["./html/"]));
});

gulp.task("browser-sync", (cb) => {
  bs.init(
    {
      server: {
        baseDir: htmlPath,
      },
      port: 3000,
      open: false,
    },
    cb
  );
});

gulp.task("minifyHtml", () => {
  return gulp
    .src("html/**/*.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        minifyCSS: true,
      })
    )
    .pipe(gulp.dest(".tmp/html/min/"));
});

gulp.task("watch", () => {
  return gulp
    .watch("./src/**/**/*.pug", gulp.series("buildMjml", "buildHtml"))
    .on("change", bs.reload);
});

gulp.task(
  "build",
  gulp.series("mergeData", "buildMjml", "buildHtml", "robots")
);

gulp.task("default", gulp.series("build", "browser-sync", "watch"));