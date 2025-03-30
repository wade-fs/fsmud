'''virtual area map data
- map
	*##
	^-_
	!xX
- desc
	* 廣場
	^ 高原
	! 高山
	- 平地
	_ 窪地
	# 草地
	X 出口
- null
	x
'''

這是使用 golang 配合 v8go 開發的 mudlib,
在 mudlib 中提供 admin 命令 genmap AREA, 例如上面的 genmap area1
根據上面的virtual area map data, 建立底下的 room JSON files,
其中 null 表示不建立該房間，出口也不會指向它

area1/1-1.js
{
    "desc": "廣場",
    "exits": { "east": "area1/1-2", "south": "area1/2-1" },
    "items": [],
    "npcs": []
}

area1/1-2.js
{
    "desc": "草地",
    "exits": { "east": "area1/1-3", "west": "area1/1-1", "south": "area1/2-2" },
    "items": [],
    "npcs": []
}

area1/2-1.js
{
    "desc": "高原",
    "exits": { "east": "area1/2-2", "north": "area1/1-1", "south": "area1/3-1" },
    "items": [],
    "npcs": []
}

