# isirmt Portfolio

- Next.js(Tailwind CSS)
- Go (WebSocket)
- PostgreSQL

## requirements

- Docker, Docker Compose

## for dev

at root dir,

```bash
docker compose -f compose.dev.yml up -d backend web
```

you'll be able to access at `http://localhost:3000`.

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

## for prod

at root dir,

```bash
docker compose -f compose.yml up -d backend web
```
