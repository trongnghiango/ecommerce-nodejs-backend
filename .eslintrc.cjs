module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
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
  plugins: [
    // 'import', // Thêm plugin import vào danh sách
  ],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Cảnh báo cho các biến không sử dụng, nhưng cho phép biến với dấu gạch dưới
  },
};
