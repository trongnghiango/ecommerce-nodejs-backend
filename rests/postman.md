# POSTMAN

### LOGIN
```shell
curl -X POST http://localhost:3051/v1/api/access/shop/signin \
-H "Content-Type: application/json" \
-H "x-api-key: e42e73eba28523492ce0c53c327dc8ba76a81fb4813314a52ea0586bd51f11ab298ba6d257dd0914247817b23b2bb53fc0dde0ec2007a2d9ff2725f1db9f0114" \
-d '{
  "email": "nghia@mail.com",
  "password": "123456"
}'
```

### SignUP


```shell
curl -X POST http://localhost:3051/v1/api/access/shop/signup \
-H "Content-Type: application/json" \
-H "x-api-key: e42e73eba28523492ce0c53c327dc8ba76a81fb4813314a52ea0586bd51f11ab298ba6d257dd0914247817b23b2bb53fc0dde0ec2007a2d9ff2725f1db9f0114" \
-d "{\"email\":\"nghiadt@gmail.com\", \"password\":\"123456\",\"name\": \"Qua Do\"}"
```