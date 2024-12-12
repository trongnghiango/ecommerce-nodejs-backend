# Note

- Vi eslint version 9 khong co ho tro extends
- du an nodejs thi su dung airbnb -> ma airbnb chua cap nhat version moi nen van con su dung extends
- Vi vay khi se up backend nodejs ta van su dung eslint 8._._

### Khi cai dat cau hinh style theo airbnb:

```
yarn add -D eslint-config-airbnb-base eslint-plugin-import
```

### Ket hop voi prettier:

```
yarn add prettier eslint-plugin-prettier eslint-config-prettier --save-dev
```

```js
extends: [
  'airbnb-base', // Kế thừa cấu hình từ Airbnb
  'plugin:prettier/recommended', // Tích hợp với Prettier
],
```
