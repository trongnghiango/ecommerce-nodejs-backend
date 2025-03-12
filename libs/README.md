# README

## Huong dan cach tao va cai thu vien local trong nodejs backend
### 

```shell
.
├── src
├── server.js
├── package.json
└── libs
    ├── README.md
    └── xxx
        ├── index.js
        └── package.json
```

- Noi dung file `package.json` cua `libs/xxx/`
```json
{
  "name": "xxx",
  "version": "1.0.0",
  "description": "testing for fun",
  "main": "index.js"
}
```
- Luu y: truong `main` trong file tren phai tro dung file chinh trong thu muc `xxx` 
### De su dung ta import theo duong dan den thu muc chua lib la `xxx`
### Ngoai ra ta con 1 cai la cai package tren thong qua `npm install ./libs/xxx`
-> sau khi cai co the su dung nhu 1 package ngoai.

- Noi dung file `server.js`
```js
const xxx = require('xxx');


```