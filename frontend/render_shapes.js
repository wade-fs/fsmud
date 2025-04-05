var twoInstances = {};

function renderShape(shape, two) {
    switch (shape.type) {
//{"type":"line","x1":10,"y1":10,"x2":100,"y2":10,"fill":"#000000","stroke":"#000000","linewidth":2}
        case 'line':
            var line = two.makeLine(shape.x1, shape.y1, shape.x2, shape.y2);
            line.stroke = shape.stroke || '#000000';
            line.linewidth = shape.linewidth || 1;
            break;
//{"type":"rectangle","x":10,"y":10,"width":10,"height":20,"fill":"#000000","stroke":"#000000","linewidth":2}
        case 'rectangle':
            var rect = two.makeRectangle(shape.x, shape.y, shape.width, shape.height);
            rect.fill = shape.fill || 'none';
            rect.stroke = shape.stroke || '#000000';
            rect.linewidth = shape.linewidth || 1;
            break;
//{"type":"circle","x":10,"y":10,"radius":20,"height":20,"fill":"#FF0000","stroke":"#000000","linewidth":2}
        case 'circle':
            var circle = two.makeCircle(shape.x, shape.y, shape.radius);
            circle.fill = shape.fill || 'none';
            circle.stroke = shape.stroke || '#000000';
            circle.linewidth = shape.linewidth || 1;
            break;
//{"type":"ellipse","center_x":10,"center_y":10,"width":20,"height":20,"fill":"#00FFFF","stroke":"#000000","linewidth":2}
        case 'ellipse':
            var ellipse = two.makeEllipse(shape.center_x, shape.center_y, shape.width / 2, shape.height / 2);
            ellipse.fill = shape.fill || 'none';
            ellipse.stroke = shape.stroke || '#000000';
            ellipse.linewidth = shape.linewidth || 1;
            break;
//{"type":"arrow","x1":10,"y1":10,"x2":100,"y2":100,"headlen":20,"fill":"#000000","stroke":"#000000","linewidth":2}
        case 'arrow':
            var arrow = two.makeArrow(shape.x1, shape.y1, shape.x2, shape.y2, shape.headlen);
            arrow.fill = shape.fill || 'none';
            arrow.stroke = shape.stroke || '#000000';
            arrow.linewidth = shape.linewidth || 1;
            break;
// {"type":"pentagon","center_x":50,"center_y":50,"radius":20,"fill":"#000000","stroke":"#000000","linewidth":2}
        case 'pentagon':
            var pentagon = two.makePolygon(shape.center_x, shape.center_y, shape.radius, 5);
            pentagon.fill = shape.fill;
            pentagon.stroke = shape.stroke;
            pentagon.linewidth = shape.linewidth || 1;
            break;
//{"type":"star","center_x":50,"center_y":50,"outer_radius":30,"inner_radius":15,"points":5,"fill":"#FFD700","stroke":"#000000","linewidth":1}
        case 'star':
            var star = two.makeStar(shape.center_x, shape.center_y, shape.outer_radius, shape.inner_radius, shape.points);
            star.fill = shape.fill || 'none';
            star.stroke = shape.stroke || '#000000';
            star.linewidth = shape.linewidth || 1;
            break;
// {"type":"triangle","points":[[20,50],[30,20],[40,60]],"fill":"#000000","stroke":"#000000","linewidth":2}
        case 'triangle':
            if (!shape.points || !Array.isArray(shape.points) || shape.points.length < 3) {
                console.log("無效的 triangle 資料:", shape);
                break;
            }
            var anchors = shape.points.map(p => new Two.Anchor(p[0], p[1]));
            var triangle = two.makePath(anchors, false);
            triangle.fill = shape.fill || 'none';
            triangle.stroke = shape.stroke || '#000000';
            triangle.linewidth = shape.linewidth || 1;
            break;
//{"type":"curve","points":[[10,10],[20,50],[30,20],[40,60]],"closed":false,"fill":"none","stroke":"#000000","linewidth":2}
        case 'curve':
            var anchors = shape.points.map(p => new Two.Anchor(p[0], p[1]));
            var curve = two.makeCurve(anchors, shape.closed || false);
            curve.fill = shape.fill || 'none';
            curve.stroke = shape.stroke || '#000000';
            curve.linewidth = shape.linewidth || 1;
            break;
//{"type":"points","points":[[10,10],[20,20],[30,30]],"fill":"#000000","size":5}
        case 'points':
            var anchors = shape.points.map(p => new Two.Anchor(p[0], p[1]));
            var pts = two.makePoints(anchors);
            pts.fill = shape.fill || '#000000';
            pts.stroke = shape.stroke || 'none';
            pts.size = shape.size || 5;
            break;
//{"type":"arcsegment","x":50,"y":50,"inner_radius":20,"outer_radius":30,"start_angle":0,"end_angle":1.57,"fill":"#FF0000","stroke":"#000000","linewidth":1}
        case 'arcsegment':
            var arc = two.makeArcSegment(shape.x, shape.y, shape.inner_radius, shape.outer_radius, shape.start_angle, shape.end_angle);
            arc.fill = shape.fill || 'none';
            arc.stroke = shape.stroke || '#000000';
            arc.linewidth = shape.linewidth || 1;
            break;
//{"type":"text","x":50,"y":50,"value":"Wade","fill":"#000000","size":20}
        case 'text':
            var text = two.makeText(shape.value, shape.x, shape.y);
            text.fill = shape.fill || '#000000';
            text.stroke = shape.stroke || 'none';
            text.size = shape.size || 20;
            break;
//{"type":"path","commands":[{"command":"M","x":10,"y":10},{"command":"L","x":50,"y":10},{"command":"L","x":50,"y":50},{"command":"L","x":10,"y":50},{"command":"Z"}],"fill":"#FF0000","stroke":"#000000","linewidth":2}
//{"type":"path","commands":[{"command":"M","x":20,"y":20},{"command":"L","x":60,"y":20},{"command":"L","x":60,"y":40},{"command":"C","x1":60,"y1":60,"x2":40,"y2":60,"x":20,"y":40},{"command":"Z"}],"fill":"#00FF00","stroke":"#0000FF","linewidth":3}
case 'path':
    if (!shape.commands || !Array.isArray(shape.commands)) {
        console.log("無效的 path 資料:", shape);
        break;
    }
    var anchors = [];
    var currentAnchor = null;

    // 解析 commands，構建 anchors
    for (var cmd of shape.commands) {
        if (!cmd.command) continue;
        switch (cmd.command) {
            case 'M':
                currentAnchor = new Two.Anchor(cmd.x, cmd.y);
                anchors.push(currentAnchor);
                break;
            case 'L':
                currentAnchor = new Two.Anchor(cmd.x, cmd.y);
                anchors.push(currentAnchor);
                break;
            case 'C':
                currentAnchor = new Two.Anchor(cmd.x, cmd.y);
                currentAnchor.controls = {
                    left: new Two.Vector(cmd.x1, cmd.y1),  // 第一控制點
                    right: new Two.Vector(cmd.x2, cmd.y2) // 第二控制點
                };
                currentAnchor.command = Two.Commands.curve;
                anchors.push(currentAnchor);
                break;
            default:
                console.log("略過未知的 path 命令:", cmd.command);
                break;
        }
    }

    // 創建路徑
    var isClosed = shape.commands.some(cmd => cmd.command === 'Z');
    var path = two.makePath(anchors, !isClosed);
    
    // 設置屬性
    path.fill = shape.fill || 'none';
    path.stroke = shape.stroke || '#000000';
    path.linewidth = shape.linewidth || 1;

    // 手動調整曲線控制點（如果需要）
    path.vertices.forEach((vertex, i) => {
        if (vertex.command === Two.Commands.curve && i > 0) {
            var prev = path.vertices[i - 1];
            vertex.controls.left.copy(prev); // 確保曲線連續性
        }
    });
    break;
        default:
            log("略過未知的圖形類型:", shape.type);
            break;
    }
}
function renderShapes(shapes, divId) {
    var features = shapes;
    
    Object.keys(features).forEach(function(featureKey) {
        var feature = features[featureKey];
        if (feature.shapes && Array.isArray(feature.shapes)) {
            feature.shapes.forEach(function(shape) {
                if (!('fill' in shape) || shape.fill == null) {
                    if (feature.color) {
                        shape.fill = feature.color;
                    }
                }
            });
        }
    });

    var allShapes = [];
    for (var key in shapes) {
        if (shapes[key].shapes && Array.isArray(shapes[key].shapes)) {
            allShapes = allShapes.concat(shapes[key].shapes);
        }
    }

    var div = document.getElementById(divId);
    if (!twoInstances[divId]) {
        twoInstances[divId] = new Two({ width: div.offsetWidth, height: div.offsetHeight }).appendTo(div);
    }
    var two = twoInstances[divId];

    two.clear();

    for (var shape of allShapes) {
        renderShape(shape, two);
    }

    two.update();
}
