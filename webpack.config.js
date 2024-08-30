const path = require('path');

module.exports = {
  entry: './src/macro/rollAndMove.ts', // 번들링할 입력 파일
  output: {
    filename: 'rollAndMove.bundle.js', // 출력 파일명
    path: path.resolve(__dirname, 'dist'), // 출력 디렉토리
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // .ts 파일에 대해
        use: 'babel-loader', // Babel을 사용하여 변환
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // .ts와 .js 확장자 파일을 인식
  },
  devtool: 'source-map', // 디버깅을 위한 소스 맵 생성
};
