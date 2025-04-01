var twoInstances = {};

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
        switch (shape.type) {
            case 'rectangle':
                var rect = two.makeRectangle(shape.x, shape.y, shape.width, shape.height);
                rect.fill = shape.fill || 'none';
                rect.stroke = shape.stroke || '#000000';
                rect.linewidth = shape.linewidth || 1;
                break;
            case 'circle':
                var circle = two.makeCircle(shape.x, shape.y, shape.radius);
                circle.fill = shape.fill || 'none';
                circle.stroke = shape.stroke || '#000000';
                circle.linewidth = shape.linewidth || 1;
                break;
            case 'line':
                var line = two.makeLine(shape.x1, shape.y1, shape.x2, shape.y2);
                line.stroke = shape.stroke || '#000000';
                line.linewidth = shape.linewidth || 1;
                break;
            case 'ellipse':
                var ellipse = two.makeEllipse(shape.center_x, shape.center_y, shape.width / 2, shape.height / 2);
                ellipse.fill = shape.fill || 'none';
                ellipse.stroke = shape.stroke || '#000000';
                ellipse.linewidth = shape.linewidth || 1;
                break;
            case 'triangle':
                var points = shape.points.map(p => new Two.Anchor(p[0], p[1]));
                var triangle = two.makePath(points, false, false);
                triangle.fill = shape.fill || 'none';
                triangle.stroke = shape.stroke || '#000000';
                triangle.linewidth = shape.linewidth || 1;
                triangle.closed = true;
                break;
/*{
  "type": "arrow",
  "x1": 10,
  "y1": 10,
  "x2": 100,
  "y2": 100,
  "headlen": 20,
  "fill": "#000000",
  "stroke": "#000000",
  "linewidth": 2
}*/
            case 'arrow':
                var arrow = two.makeArrow(shape.x1, shape.y1, shape.x2, shape.y2, shape.headlen);
                arrow.fill = shape.fill || 'none';
                arrow.stroke = shape.stroke || '#000000';
                arrow.linewidth = shape.linewidth || 1;
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
/*{
  "type": "star",
  "center_x": 50,
  "center_y": 50,
  "outer_radius": 30,
  "inner_radius": 15,
  "points": 5,
  "fill": "#FFD700",
  "stroke": "#000000",
  "linewidth": 1
}*/
            case 'star':
                var star = two.makeStar(shape.center_x, shape.center_y, shape.outer_radius, shape.inner_radius, shape.points);
                star.fill = shape.fill || 'none';
                star.stroke = shape.stroke || '#000000';
                star.linewidth = shape.linewidth || 1;
                break;
/*{
  "type": "curve",
  "points": [
    [10, 10],
    [20, 50],
    [30, 20],
    [40, 60]
  ],
  "closed": false,
  "fill": "none",
  "stroke": "#000000",
  "linewidth": 2
}*/
            case 'curve':
                var curve = two.makeCurve(shape.points.map(p => [p[0], p[1]]), shape.closed || false);
                curve.fill = shape.fill || 'none';
                curve.stroke = shape.stroke || '#000000';
                curve.linewidth = shape.linewidth || 1;
                break;
/*{
  "type": "arcsegment",
  "x": 50,
  "y": 50,
  "inner_radius": 20,
  "outer_radius": 30,
  "start_angle": 0,
  "end_angle": 1.57,
  "fill": "#FF0000",
  "stroke": "#000000",
  "linewidth": 1
}*/
            case 'arcsegment':
                var arc = two.makeArcSegment(shape.x, shape.y, shape.inner_radius, shape.outer_radius, shape.start_angle, shape.end_angle);
                arc.fill = shape.fill || 'none';
                arc.stroke = shape.stroke || '#000000';
                arc.linewidth = shape.linewidth || 1;
                break;
/*{
  "type": "points",
  "points": [
    [10, 10],
    [20, 20],
    [30, 30]
  ],
  "fill": "#000000",
  "size": 5
}*/
            case 'points':
                var pts = two.makePoints(shape.points.map(p => [p[0], p[1]]));
                pts.fill = shape.fill || '#000000';
                pts.stroke = shape.stroke || 'none';
                pts.size = shape.size || 5;
                break;
/*{
  "type": "text",
  "x": 50,
  "y": 50,
  "value": "Hello, Two.js!",
  "fill": "#000000",
  "size": 20
}*/
            case 'text':
                var text = two.makeText(shape.value, shape.x, shape.y);
                text.fill = shape.fill || '#000000';
                text.stroke = shape.stroke || 'none';
                text.size = shape.size || 20;
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
                log("略過未知的圖形類型:", shape.type);
                break;
        }
    }

    two.update();
}
