# Start from a Debian image with the latest version of Go installed
# and a workspace (GOPATH) configured at /go.
FROM golang

# Copy the local package files to the container's workspace.
ADD . /go/src/github.com/wade-fs/fsmud

WORKDIR /go/src/github.com/wade-fs/fsmud

RUN go mod download
RUN go install github.com/wade-fs/fsmud/cmd/fsmud

# Run the outyet command by default when the container starts.
ENTRYPOINT /go/bin/fsmud

# Document that the service listens on port 8010.
EXPOSE 8010
