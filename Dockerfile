# 빌드
FROM bitnami/node:18 AS builder
WORKDIR /app

# package.json만 먼저 복사해서, 코드 변경이 없으면 npm install 레이어는 캐시 유지
COPY package*.json ./
RUN npm install

# 나머지 소스 코드 복사
COPY . .

# 프로덕션
FROM node:18-slim
WORKDIR /app

# 빌드 완료된 /app 을 그대로 복사
COPY --from=builder /app /app

# 환경변수와 포트 설정
ENV NODE_ENV=production \
    PORT=3000
EXPOSE 3000

CMD ["node", "main.js"]
