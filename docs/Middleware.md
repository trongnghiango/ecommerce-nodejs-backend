# Middleware

### 1 emiddlware trong express là 1 func với các đối số (req, res, next)

### Các cách sử dụng middleware:

#### 1.

```js

//
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        // Xác thực token (đơn giản)
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};


app.get('/api/v1/products', authenticate, (req, res, next) => {
  ....
})
```

#### 2.

```js

//
// Middleware cơ bản
app.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next(); // Gọi hàm next để tiếp tục xử lý
});

app.get('/api/v1/products', (req, res, next) => {
  ....
})
```

#### 3.

```js

//
const middle1 = (req, res, next) => {
  if (isError) throw Error('Error ... ') // Ta phải build 1 middleware riêng dùng để handle Error

  // ...
  next()
}

//
const middle2 = (req, res, next) => {

  // ...
  next()
}

app.get('/api/v1/products', middle1, middle2, (req, res, next) => {
  ....
})
```
