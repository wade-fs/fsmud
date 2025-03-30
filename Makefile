TOP := $(shell pwd)
OUT := $(TOP)/out
GOVERSION := 1.23.0
GOPATH := $(HOME)/go-$(GOVERSION)
GOROOT := /usr/local/go-$(GOVERSION)
GO_FLAGS := -ldflags="-s -w -X main.Version=$(VERSION)"

ENV  := GOPATH=$(GOPATH) GOROOT=$(GOROOT)
ENVW := $(ENV) CGO_ENABLED=1 CGO_CFLAGS="-Wno-return-local-addr" GOOS=windows GOARCH=amd64 CC="x86_64-w64-mingw32-gcc -fno-stack-protector -D_FORTIFY_SOURCE=0 -lssp"

all: mud
	@ echo "Type 'make run' or '$(OUT)/mud' to run again."

%:
	@ cd cmd/$(basename $(notdir $@)) && \
	echo "building $@..." && \
	if [ "$(suffix $@)" = ".exe" ]; then \
	    export ENVVAR=$(ENVW); \
	else \
	    export ENVVAR=$(ENV); \
	fi; \
	$(GOROOT)/bin/go get && \
	$(GOROOT)/bin/go build $(GO_FLAGS) -o $(OUT)/$@

run:
	@ $(OUT)/mud
