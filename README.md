# Next.js + Go Admin Portfolio

![Next.js + Go Admin Portfolio](/frontend/src/app/opengraph-image.png)


[View My Deployed Portfolio](https://isirmt.com)

- Next.js (Tailwind CSS, Three.js)
- Go (Echo, Gorm, WebSocket)
- PostgreSQL

## requirements

- Docker, Docker Compose

## for dev

at root dir,

```bash
docker compose -f compose.dev.yml up -d backend web caddy adminer --force-recreate
```

you'll be able to access at `http://localhost:3000`.

NOTICE: you may need ENVIRONMENT VARIABLES for frontend and backend

create .env file (like .env.example) at ROOT DIR

```
POSTGRES_USER= /* (prod only) POSTGRE SQL USER */
POSTGRES_PASSWORD= /* (prod only) POSTGRE SQL PASSWORD */
POSTGRES_DB= /* (prod only) POSTGRE SQL DATABASE NAME */
DATABASE_URL= /* (prod only) postgresql://user:password@db:5432/dbname */
BACKEND_BASE_URL= /* (prod only) http://backend:4000 */
NEXTAUTH_URL= /* (prod only) YOUR DOMAIN e.g. https://example.com */
NEXTAUTH_SECRET= /* RANDOM STRING for NEXTAUTH */
GOOGLE_CLIENT_ID= /* GOOGLE OAUTH CLIENT ID */
GOOGLE_CLIENT_SECRET= /* GOOGLE OAUTH CLIENT SECRET */
ADMIN_ALLOWED_EMAILS= /* COMMA SEPARATED ADMIN EMAILS e.g. hoge@example.com,hoge2@example.com */
ADMIN_SECRET= /* RANDOM STRING for backend admin auth */
ALLOWED_ORIGIN= /* if you want to restrict frontend access e.g. https://example.com */
GOOGLE_TAG_MANAGER_ID= /* NOT required, GOOGLE TAG MANAGER ID e.g. GTM-XXXXXXX */
```

if you want checking logs... (realtime)

```bash
docker compose -f compose.dev.yml logs --follow backend web
```

if you modified golang packages, run this

```bash
docker compose -f compose.dev.yml run --rm backend bash -c "go mod tidy"
```

if you update sql scheme, run this

```bash
docker compose -f compose.dev.yml run --rm --user $(id -u):$(id -g) --env GOCACHE=/tmp/go-build --env GOMODCACHE=/tmp/go-mod-cache backend bash -c "mkdir -p /tmp/go-build /tmp/go-mod-cache && go mod download && go run ./cmd/gen/main.go"
```

## for prod (on Virtual Machine e.g. Amazon lightsail)

at root dir,
```bash
git fetch
git pull
```

```bash
docker compose -f compose.vm.yml pull
```

```bash
docker compose -f compose.vm.yml up -d
```
