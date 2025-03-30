// static/app.js
let ws = new WebSocket("ws://localhost:8080/ws");

function tryParseJsonMessage(message) {
    try {
        if (typeof message === "string" && message.startsWith("{")) {
            return JSON.parse(message).description || message;
        }
    } catch (e) {
        // 解析失敗，返回原始訊息
    }
    return message;
}

ws.onmessage = function(event) {
    let data = JSON.parse(event.data);
    let output = document.getElementById("output");
    switch (data.type) {
        case "command_result":
        case "broadcast":
        case "global_broadcast":
            output.textContent += output.textContent += tryParseJsonMessage(data.message) + "\n";
            break;
        case "stats":
            document.getElementById("player-info").innerHTML = formatPlayerInfo(data.data);
            break;
        case "player_update":
            document.getElementById("player-info").innerHTML = formatPlayerInfo(data.player);
            break;
        case "room_update":
            document.getElementById("room-info").innerHTML = formatRoomInfo(data.room);
            break;
        case "error":
            output.textContent += `Error: ${data.message}\n`;
            break;
        case "login_success":
            output.textContent += `${data.message}\n`;
            break;
        default:
            if (data.message) {
                output.textContent += output.textContent += tryParseJsonMessage(data.message) + "\n";
            } else {
                output.textContent += "收到未定義的訊息類型: " + JSON.stringify(data) + "\n";
            }
            break;
    }
};

function sendCommand() {
    let cmd = document.getElementById("command").value;
    if (cmd !== "") {
        ws.send(cmd);
        document.getElementById("command").value = "";
    }
}

function formatPlayerInfo(data) {
    renderShapes(data.avatar, "player-avatar");
    return `
        <p>Name: ${data.name || "Unknown"}</p>
        <p>Level: ${data.level}</p>
        <p>HP: ${data.hp}</p>
        <p>MP: ${data.mp}</p>
        <p>SP: ${data.strength}</p>
        <p>AP: ${data.agility}</p>
        <p>WT: ${data.weight}</p>
    `;
}

function formatRoomInfo(room) {
    return `
        <p>Room: ${room.id}</p>
        <p>Description: ${room.description}</p>
    `;
}

document.getElementById("command").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendCommand();
    }
});

var twoInstances = {};

function renderShapes(shapes, divId) {
    var div = document.getElementById(divId);
    if (!twoInstances[divId]) {
        twoInstances[divId] = new Two({ width: div.offsetWidth, height: div.offsetHeight }).appendTo(div);
    }
    var two = twoInstances[divId];
    // Clear existing shapes
    two.scene.children.forEach(function(child) {
        two.scene.remove(child);
    });
    for (var shape of shapes) {
        switch (shape.type) {
            case 'rectangle':
                var rect = two.makeRectangle(shape.x, shape.y, shape.width, shape.height);
                rect.fill = shape.fill;
                rect.stroke = shape.stroke;
                rect.linewidth = shape.linewidth || 1;
                break;
            case 'circle':
                var circle = two.makeCircle(shape.x, shape.y, shape.radius);
                circle.fill = shape.fill;
                circle.stroke = shape.stroke;
                circle.linewidth = shape.linewidth || 1;
                break;
            case 'line':
                var line = two.makeLine(shape.x1, shape.y1, shape.x2, shape.y2);
                line.stroke = shape.stroke;
                line.linewidth = shape.linewidth || 1;
                break;
            case 'arrow':
                var line = two.makeLine(shape.start_x, shape.start_y, shape.end_x, shape.end_y);
                line.stroke = shape.stroke;
                line.linewidth = shape.linewidth || 1;
                // Calculate base_point
                var dx = shape.end_x - shape.start_x;
                var dy = shape.end_y - shape.start_y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                var unit_dx = dx / distance;
                var unit_dy = dy / distance;
                var perpendicular_dx = -unit_dy;
                var perpendicular_dy = unit_dx;
                var base_point_x = shape.end_x - unit_dx * shape.arrow_length;
                var base_point_y = shape.end_y - unit_dy * shape.arrow_length;
                var arrow_point1_x = base_point_x + perpendicular_dx * (shape.arrow_width / 2);
                var arrow_point1_y = base_point_y + perpendicular_dy * (shape.arrow_width / 2);
                var arrow_point2_x = base_point_x - perpendicular_dx * (shape.arrow_width / 2);
                var arrow_point2_y = base_point_y - perpendicular_dy * (shape.arrow_width / 2);
                // Create arrowhead polygon
                var arrowhead = two.makePolygon([ [shape.end_x, shape.end_y], [arrow_point1_x, arrow_point1_y], [arrow_point2_x, arrow_point2_y] ]);
                arrowhead.fill = shape.fill;
                arrowhead.stroke = shape.stroke;
                arrowhead.linewidth = shape.linewidth || 1;
                break;
            case 'triangle':
                var points = shape.points.map(p => [p.x, p.y]);
                var triangle = two.makePolygon(points);
                triangle.fill = shape.fill;
                triangle.stroke = shape.stroke;
                triangle.linewidth = shape.linewidth || 1;
                break;
            case 'ellipse':
                var ellipse = two.makeEllipse(shape.center_x, shape.center_y, shape.width / 2, shape.height / 2);
                ellipse.fill = shape.fill;
                ellipse.stroke = shape.stroke;
                ellipse.linewidth = shape.linewidth || 1;
                break;
            case 'pentagon':
                var points = [];
                var angle_increment = 2 * Math.PI / 5;
                for (var i = 0; i < 5; i++) {
                    var angle = i * angle_increment;
                    var point_x = shape.center_x + shape.radius * Math.cos(angle);
                    var point_y = shape.center_y + shape.radius * Math.sin(angle);
                    points.push([point_x, point_y]);
                }
                var pentagon = two.makePolygon(points);
                pentagon.fill = shape.fill;
                pentagon.stroke = shape.stroke;
                pentagon.linewidth = shape.linewidth || 1;
                break;
            case 'star':
                var angles = [0, 72, 144, 216, 288].map(a => a * Math.PI / 180);
                var points = angles.map(a => [shape.center_x + shape.outer_radius * Math.cos(a), shape.center_y + shape.outer_radius * Math.sin(a)]);
                var path = two.makePath();
                path.fill = shape.fill;
                path.stroke = shape.stroke;
                path.linewidth = shape.linewidth || 1;
                path.moveTo(points[0][0], points[0][1]);
                path.lineTo(points[2][0], points[2][1]);
                path.lineTo(points[4][0], points[4][1]);
                path.lineTo(points[1][0], points[1][1]);
                path.lineTo(points[3][0], points[3][1]);
                path.closePath();
                break;
            case 'path':
                var path = two.makePath();
                path.fill = shape.fill;
                path.stroke = shape.stroke;
                path.linewidth = shape.linewidth || 1;
                for (var cmd of shape.commands) {
                    if (cmd.command == 'M') {
                        path.moveTo(cmd.x, cmd.y);
                    } else if (cmd.command == 'L') {
                        path.lineTo(cmd.x, cmd.y);
                    } else if (cmd.command == 'Z') {
                        path.closePath();
                    }
                }
                break;
            default:
                console.log("Unknown shape type:", shape.type);
                break;
        }
        two.update();
    }
}
