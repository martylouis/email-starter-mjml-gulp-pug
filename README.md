## Email Starter with MJML, Gulp & Pug

---

## Install

Install dependencies (requires a local installation of [Node.js](https://nodejs.org/))
```sh

npm install
# or
yarn
```

## Dev

This will run a local [Gulp](https://gulpjs.com/) script to watch your `.pug` files and generate your emails from [Pug](https://pugjs.org/api/getting-started.html) to [MJML](https://mjml.io/) to HTML. Open `http//localhost:3000` to preview the HTML.

All templates can be updated in `src/templates`.

```sh
npm run dev
# or
yarn dev
```



## Build & Preview

Build and preview what your final HTML will look like locally.

```sh
npm run build && npm run start
# or
yarn build && yarn start
```