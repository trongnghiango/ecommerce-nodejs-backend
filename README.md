# express-mvc-framework

nodejs + express + mongodb to do MVC example

# How to use

### clone git

```
> git clone https://github.com/ntnghiatn/structure-api-mvc-express-nodejs.git your-project
> cd your-project
> npm i
> npm run dev
```

# Try

[localhost](http://localhost:3051)

# Đây là dự án Web Service chạy code trực tiếp trên ngôn ngữ `javascript`. (trong khi mot so du an dung `esbuild` se co cau hinh khac- co the se dung babel trong development va esbuild trong production)

## Su dung @ - `module-alias`:

- install package:

```sh
yarn add module-alias
```

- them doan code sau vao `package.json`

```json
{
  "_moduleAliases": {
    "@models": "src/models",
    "@controllers": "src/controllers",
    "@utils": "src/utils"
  }
}
```

## Cach set up style code backend using airbnb

```
yarn add -D eslint eslint-config-airbnb-base eslint-plugin-import
```

- add them vao file `.eslintrc.cjs`

```js
...
extends: ['airbnb-base'],
...
```

- khi su dung airbnb thuong ket hop voi import package:

```sh
yarn add -D eslint-config-airbnb-base eslint-plugin-import
```

- Phan import se co show loi o editor khi su dung `module-alias`, tuy nhien code van chay duoc
  -> de fix loi nay ta cai them package `eslint-import-resolver-alias`

```sh
yarn add -D eslint-import-resolver-alias
```

- va cau hinh trong file `.eslintrc.cjs`

```js
extends: [ ... ],
settings: {
  'import/resolver': {
    alias: {
      map: [
        ['@', './src'], // Đường dẫn đến thư mục gốc
      ],
      extensions: ['.js', '.json'], // Các phần mở rộng file
    },
  },
},
plugins: [...]
```

> Luu y: hien tai thi airbnb chua cap nhat style code tuong thich voi eslint 9 nen ta van dung eslint 8

## Them prettier ket hop eslint

```sh
yarn add -D prettier eslint-config-prettier eslint-plugin-prettier
```

- cau hinh trong file eslint

```js
...
extends: ['airbnb-base', 'plugin:prettier/recommended'],
...
```

- cau hinh prettier

```json
{
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5"
}
```
