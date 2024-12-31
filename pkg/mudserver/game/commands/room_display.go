package commands

import (
	"github.com/wade-fs/fsmud/pkg/entities/rooms"
	"github.com/wade-fs/fsmud/pkg/mudserver/game/def"
	m "github.com/wade-fs/fsmud/pkg/mudserver/game/messages"
)

// Display ... executes scream command
func Display(room *rooms.Room, game def.GameCtrl, message *m.Message) bool {

	enterRoom := m.NewEnterRoomMessage(room, message.FromUser, game)
	enterRoom.AudienceID = message.FromUser.ID
	game.SendMessage() <- enterRoom
	return true
}
