// domain/cmds/look.js

function look(player, args) {
  let terrainCode = currentArea.getTerrain(player.x, player.y);
  if (!terrainCode || terrainCode === "XX") {
    return "You are lost in a void.";
  }

  let terrains = JSON.parse(loadFile("domain/configs/terrains.json"));
  let terrain = terrains.find(t => Object.keys(t)[0] === terrainCode);
  if (!terrain) return "Unknown terrain.";

  let terrainData = terrain[terrainCode];
  let description = terrainData[currentTime] || terrainData["noon"]; // 預設使用 noon
  let exits = [];
  if (currentArea.isPassable(player.x, player.y - 1)) exits.push("north");
  if (currentArea.isPassable(player.x, player.y + 1)) exits.push("south");
  if (currentArea.isPassable(player.x + 1, player.y)) exits.push("east");
  if (currentArea.isPassable(player.x - 1, player.y)) exits.push("west");

  description += exits.length ? `\nExits: ${exits.join(", ")}` : "\nNo exits.";
  return description;
}
