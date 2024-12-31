# New Fantasy Space MUD
- Fork from https://github.com/TalesMUD/talesmud
- For personal leisure time only to study TalesMUD, not for formal MUD development.
- Translate the document into Chinese; non-English-speaking friends, please refer to TalesMUD.
- [Notes on building TalesMUD][1] from TalesMud

# Install by use docker
## prepare docker
- docker --version && docker-compose --version
## install docker
- apt install docker.io docker-compose

# Run
## Run in foreground
- docker-compose up --build
## Run in background
- docker-compose up -d
## stop 
- docker-compose down

# open and play fsmud
- http://localhost:8010

# references
[1]: https://medium.com/@atla/notes-on-building-talesmud-4a298fa69dde
