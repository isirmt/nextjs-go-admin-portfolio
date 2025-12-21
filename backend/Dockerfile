FROM golang:1.23-bookworm AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o backend ./main.go

FROM gcr.io/distroless/base-debian12
WORKDIR /
COPY --from=build /app/backend /backend
EXPOSE 4000
USER 65532:65532
ENTRYPOINT ["/backend"]
