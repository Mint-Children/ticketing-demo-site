FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VLUR_API_BASE=http://localhost:8000
ARG VLUR_PUBLIC_SITE_KEY=pk-aicap_dev_testuser_001
ARG VLUR_WIDGET_URL=http://localhost:8000/static/widget/vlur-captcha.js

RUN VITE_VLUR_API_BASE="${VLUR_API_BASE}" \
    VITE_VLUR_SITE_KEY="${VLUR_PUBLIC_SITE_KEY}" \
    VITE_WIDGET_URL="${VLUR_WIDGET_URL}" \
    npm run build

FROM nginx:1.28-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]