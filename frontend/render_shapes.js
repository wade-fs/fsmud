var twoInstances = {};

function approximateCubicBezier(x0, y0, x1, y1, x2, y2, x3, y3) {
    const segments = 10;
    const points = [{ x: x0, y: y0 }];

    for (let t = 1 / segments; t <= 1 + 1e-6; t += 1 / segments) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const x = uuu * x0 + 3 * uu * t * x1 + 3 * u * tt * x2 + ttt * x3;
        const y = uuu * y0 + 3 * uu * t * y1 + 3 * u * tt * y2 + ttt * y3;

        points.push({ x, y });
    }
    return points;
}

function approximateQuadraticBezier(x0, y0, x1, y1, x2, y2) {
    const segments = 10;
    const points = [{ x: x0, y: y0 }];

    for (let t = 1 / segments; t <= 1 + 1e-6; t += 1 / segments) {
        const u = 1 - t;
        const uu = u * u;
        const tt = t * t;

        const x = uu * x0 + 2 * u * t * x1 + tt * x2;
        const y = uu * y0 + 2 * u * t * y1 + tt * y2;

        points.push({ x, y });
    }
    return points;
}

function approximateArc(x0, y0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x1, y1) {
    const segments = 10;
    const points = [{ x: x0, y: y0 }];

    for (let t = 1 / segments; t <= 1 + 1e-6; t += 1 / segments) {
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        points.push({ x, y });
    }
    return points;
}

function renderShape(shapeStr, two) {
    const shapes = shapeStr.split(';').map(s => s.trim()).filter(s => s);

    shapes.forEach(shape => {
        const parts = shape.split(/\s+/);
        const type = parts[0].toLowerCase();

        let fill = 'none';
        let stroke = '#000000';
        let linewidth = 1;
        let size = type === 'text' ? 20 : type === 'points' ? 5 : null; // 預設值依類型設定

        // 提取並移除 F, W, K
        const styleIndices = [];
        for (let i = 1; i < parts.length; i++) {
            const cmd = parts[i].toLowerCase();
            if (cmd.startsWith('f')) {
                fill = parts[i].slice(1);
                styleIndices.push(i);
            } else if (cmd.startsWith('w')) {
                if (type === 'text' || type === 'points') {
                    size = parseFloat(parts[i].slice(1));
                } else {
                    linewidth = parseFloat(parts[i].slice(1));
                }
                styleIndices.push(i);
            } else if (cmd.startsWith('k')) {
                stroke = parts[i].slice(1);
                styleIndices.push(i);
            }
        }

        // 移除樣式參數後的 parts
        const cleanParts = parts.filter((_, i) => !styleIndices.includes(i));

        switch (type) {
            case 'clear': {
                two.clear();
                break;
            }

			// line 40 40 45 40 K#000000 W2
            case 'line': {
                if (cleanParts.length !== 5) {
                    console.log("無效的 line 資料 (應為 x1 y1 x2 y2):", shape);
                    return;
                }
                const x1 = parseFloat(cleanParts[1]);
                const y1 = parseFloat(cleanParts[2]);
                const x2 = parseFloat(cleanParts[3]);
                const y2 = parseFloat(cleanParts[4]);
                const line = two.makeLine(x1, y1, x2, y2);
                line.fill = fill;
                line.stroke = stroke;
                line.linewidth = linewidth;
                break;
            }

            // rectangle 30 40 20 15 K#000000 W2
            // rectangle 50 40 20 15 K#000000 W2
            case 'rectangle': {
                if (cleanParts.length !== 5) {
                    console.log("無效的 rectangle 資料 (應為 x y width height):", shape);
                    return;
                }
                const x = parseFloat(cleanParts[1]);
                const y = parseFloat(cleanParts[2]);
                const width = parseFloat(cleanParts[3]);
                const height = parseFloat(cleanParts[4]);
                const rect = two.makeRectangle(x + width / 2, y + height / 2, width, height);
                rect.fill = fill;
                rect.stroke = stroke;
                rect.linewidth = linewidth;
                break;
            }

            // circle 50 50 40 F#FF0000 K#000000 W2
            case 'circle': {
                if (cleanParts.length !== 4) {
                    console.log("無效的 circle 資料 (應為 x y radius):", shape);
                    return;
                }
                const x = parseFloat(cleanParts[1]);
                const y = parseFloat(cleanParts[2]);
                const radius = parseFloat(cleanParts[3]);
                const circle = two.makeCircle(x, y, radius);
                circle.fill = fill;
                circle.stroke = stroke;
                circle.linewidth = linewidth;
                break;
            }

            // ellipse 50 20 80 40 F#3B2F2F K#2A1E1E W2
            case 'ellipse': {
                if (cleanParts.length !== 5) {
                    console.log("無效的 ellipse 資料 (應為 x y width height):", shape);
                    return;
                }
                const x = parseFloat(cleanParts[1]);
                const y = parseFloat(cleanParts[2]);
                const width = parseFloat(cleanParts[3]);
                const height = parseFloat(cleanParts[4]);
                const ellipse = two.makeEllipse(x, y, width / 2, height / 2);
                ellipse.fill = fill;
                ellipse.stroke = stroke;
                ellipse.linewidth = linewidth;
                break;
            }

            // arrow 10 10 30 30 3
            case 'arrow': {
                if (cleanParts.length !== 6) {
                    console.log("無效的 arrow 資料 (應為 x1 y1 x2 y2 headlen):", shape);
                    return;
                }
                const x1 = parseFloat(cleanParts[1]);
                const y1 = parseFloat(cleanParts[2]);
                const x2 = parseFloat(cleanParts[3]);
                const y2 = parseFloat(cleanParts[4]);
                const headlen = parseFloat(cleanParts[5]);
                const arrow = two.makeArrow(x1, y1, x2, y2, headlen);
                arrow.fill = fill;
                arrow.stroke = stroke;
                arrow.linewidth = linewidth;
                break;
            }

            // polygon 150 50 20 5 W1 K#000000
            case 'polygon': {
                if (cleanParts.length !== 5) {
                    console.log("無效的 polygon 資料 (應為 x y radius sides):", shape);
                    return;
                }
                const x = parseFloat(cleanParts[1]);
                const y = parseFloat(cleanParts[2]);
                const radius = parseFloat(cleanParts[3]);
                const sides = parseInt(cleanParts[4]);
                const polygon = two.makePolygon(x, y, radius, sides);
                polygon.fill = fill;
                polygon.stroke = stroke;
                polygon.linewidth = linewidth;
                break;
            }

            // star 200 50 30 15 5 F#FFD700
            case 'star': {
                if (cleanParts.length !== 6) {
                    console.log("無效的 star 資料 (應為 x y outer_radius inner_radius points):", shape);
                    return;
                }
                const x = parseFloat(cleanParts[1]);
                const y = parseFloat(cleanParts[2]);
                const outerRadius = parseFloat(cleanParts[3]);
                const innerRadius = parseFloat(cleanParts[4]);
                const points = parseInt(cleanParts[5]);
                const star = two.makeStar(x, y, outerRadius, innerRadius, points);
                star.fill = fill;
                star.stroke = stroke;
                star.linewidth = linewidth;
                break;
            }

            // triangle 10 10 30 10 20 25
            case 'triangle': {
                if (cleanParts.length !== 7) {
                    console.log("無效的 triangle 資料 (應為 x1 y1 x2 y2 x3 y3):", shape);
                    return;
                }
                const x1 = parseFloat(cleanParts[1]);
                const y1 = parseFloat(cleanParts[2]);
                const x2 = parseFloat(cleanParts[3]);
                const y2 = parseFloat(cleanParts[4]);
                const x3 = parseFloat(cleanParts[5]);
                const y3 = parseFloat(cleanParts[6]);
                const anchors = [
                    new Two.Anchor(x1, y1),
                    new Two.Anchor(x2, y2),
                    new Two.Anchor(x3, y3)
                ];
                const triangle = two.makePath(anchors, false);
                triangle.fill = fill;
                triangle.stroke = stroke;
                triangle.linewidth = linewidth;
                break;
            }

            // curve 10 10 20 50 30 20 40 60 F#FF00FF W2 K#000000
            case 'curve': {
                if (cleanParts.length < 5 || cleanParts.length % 2 === 0) {
                    console.log("無效的 curve 資料 (應為 x1 y1 x2 y2 ...):", shape);
                    return;
                }
                const points = [];
                for (let i = 1; i < cleanParts.length; i += 2) {
                    points.push(new Two.Anchor(parseFloat(cleanParts[i]), parseFloat(cleanParts[i + 1])));
                }
                const curve = two.makeCurve(points, false);
                curve.fill = fill;
                curve.stroke = stroke;
                curve.linewidth = linewidth;
                break;
            }

            // points 35 50 36 60 37 50 F#000000 W5 K#FF0000
            case 'points': {
                if (cleanParts.length < 3 || cleanParts.length % 2 === 0) {
                    console.log("無效的 points 資料 (應為 x1 y1 x2 y2 ...):", shape);
                    return;
                }
                const anchors = [];
                for (let i = 1; i < cleanParts.length; i += 2) {
                    anchors.push(new Two.Anchor(parseFloat(cleanParts[i]), parseFloat(cleanParts[i + 1])));
                }
                const pts = two.makePoints(anchors);
                pts.fill = fill;
                pts.stroke = stroke;
                pts.size = size;
                break;
            }

            // arcsegment 50 50 20 30 0 1.57 F#FF0000 W1 K#000000
            case 'arcsegment': {
                if (cleanParts.length !== 7) {
                    console.log("無效的 arcsegment 資料 (應為 x y inner_radius outer_radius start_angle end_angle):", shape);
                    return;
                }
                const x = parseFloat(cleanParts[1]);
                const y = parseFloat(cleanParts[2]);
                const innerRadius = parseFloat(cleanParts[3]);
                const outerRadius = parseFloat(cleanParts[4]);
                const startAngle = parseFloat(cleanParts[5]);
                const endAngle = parseFloat(cleanParts[6]);
                const arc = two.makeArcSegment(x, y, innerRadius, outerRadius, startAngle, endAngle);
                arc.fill = fill;
                arc.stroke = stroke;
                arc.linewidth = linewidth;
                break;
            }

            case 'text': {
                if (cleanParts.length < 4) {
                    console.log("無效的 text 資料 (應為 x y message):", shape);
                    return;
                }
                const x = parseFloat(cleanParts[1]);
                const y = parseFloat(cleanParts[2]);
                const message = cleanParts.slice(3).join(' '); // 允許文字包含空格
                const text = two.makeText(message, x, y);
                text.fill = fill;
                text.stroke = stroke;
                text.size = size;
                break;
            }

            case 'path': {
                const cmdRe = /[a-zA-Z]/;
                const commands = shape.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?|#[0-9A-Fa-f]{6}/g);
                if (!commands) {
                    console.log("無法解析 path 命令:", shape);
                    return;
                }

                let currentX = 0, currentY = 0;
                let subpathStartX = 0, subpathStartY = 0;
                let lastControlX = null, lastControlY = null;
                let prevCmd = null;
                let i = 1;

                let subpaths = [];
                let currentSubpath = [];

                while (i < commands.length) {
                    let cmd = commands[i++];
                    if (!cmdRe.test(cmd)) {
                        currentSubpath.push({ x: parseFloat(cmd), y: parseFloat(commands[i++]) });
                        continue;
                    }

                    const isRelative = cmd === cmd.toLowerCase();

                    switch (cmd.toLowerCase()) {
                        case 'm': {
                            if (currentSubpath.length > 0) {
                                subpaths.push(currentSubpath);
                            }
                            currentSubpath = [];

                            const x = parseFloat(commands[i++]);
                            const y = parseFloat(commands[i++]);
                            currentX = isRelative ? currentX + x : x;
                            currentY = isRelative ? currentY + y : y;
                            subpathStartX = currentX;
                            subpathStartY = currentY;
                            currentSubpath.push({ x: currentX, y: currentY });

                            while (i < commands.length && !cmdRe.test(commands[i])) {
                                const x = parseFloat(commands[i++]);
                                const y = parseFloat(commands[i++]);
                                currentX = isRelative ? currentX + x : x;
                                currentY = isRelative ? currentY + y : y;
                                currentSubpath.push({ x: currentX, y: currentY });
                            }
                            break;
                        }

                        case 'l': {
                            while (i < commands.length && !cmdRe.test(commands[i])) {
                                const x = parseFloat(commands[i++]);
                                const y = parseFloat(commands[i++]);
                                currentX = isRelative ? currentX + x : x;
                                currentY = isRelative ? currentY + y : y;
                                currentSubpath.push({ x: currentX, y: currentY });
                            }
                            break;
                        }

                        case 'h': {
                            while (i < commands.length && !cmdRe.test(commands[i])) {
                                const x = parseFloat(commands[i++]);
                                currentX = isRelative ? currentX + x : x;
                                currentSubpath.push({ x: currentX, y: currentY });
                            }
                            break;
                        }

                        case 'v': {
                            while (i < commands.length && !cmdRe.test(commands[i])) {
                                const y = parseFloat(commands[i++]);
                                currentY = isRelative ? currentY + y : y;
                                currentSubpath.push({ x: currentX, y: currentY });
                            }
                            break;
                        }

                        case 'c': {
                            while (i + 5 < commands.length && !cmdRe.test(commands[i])) {
                                const x1 = parseFloat(commands[i++]);
                                const y1 = parseFloat(commands[i++]);
                                const x2 = parseFloat(commands[i++]);
                                const y2 = parseFloat(commands[i++]);
                                const x = parseFloat(commands[i++]);
                                const y = parseFloat(commands[i++]);

                                const cx1 = isRelative ? currentX + x1 : x1;
                                const cy1 = isRelative ? currentY + y1 : y1;
                                const cx2 = isRelative ? currentX + x2 : x2;
                                const cy2 = isRelative ? currentY + y2 : y2;
                                const ex = isRelative ? currentX + x : x;
                                const ey = isRelative ? currentY + y : y;

                                const curvePoints = approximateCubicBezier(currentX, currentY, cx1, cy1, cx2, cy2, ex, ey);
                                currentSubpath.push(...curvePoints.slice(1));

                                lastControlX = cx2;
                                lastControlY = cy2;
                                currentX = ex;
                                currentY = ey;
                            }
                            break;
                        }

                        case 's': {
                            while (i + 3 < commands.length && !cmdRe.test(commands[i])) {
                                const x2 = parseFloat(commands[i++]);
                                const y2 = parseFloat(commands[i++]);
                                const x = parseFloat(commands[i++]);
                                const y = parseFloat(commands[i++]);

                                let cx1 = currentX;
                                let cy1 = currentY;
                                if (prevCmd && (prevCmd.toLowerCase() === 'c' || prevCmd.toLowerCase() === 's')) {
                                    cx1 = 2 * currentX - lastControlX;
                                    cy1 = 2 * currentY - lastControlY;
                                }

                                const cx2 = isRelative ? currentX + x2 : x2;
                                const cy2 = isRelative ? currentY + y2 : y2;
                                const ex = isRelative ? currentX + x : x;
                                const ey = isRelative ? currentY + y : y;

                                const curvePoints = approximateCubicBezier(currentX, currentY, cx1, cy1, cx2, cy2, ex, ey);
                                currentSubpath.push(...curvePoints.slice(1));

                                lastControlX = cx2;
                                lastControlY = cy2;
                                currentX = ex;
                                currentY = ey;
                            }
                            break;
                        }

                        case 'q': {
                            while (i + 3 < commands.length && !cmdRe.test(commands[i])) {
                                const x1 = parseFloat(commands[i++]);
                                const y1 = parseFloat(commands[i++]);
                                const x = parseFloat(commands[i++]);
                                const y = parseFloat(commands[i++]);

                                const cx1 = isRelative ? currentX + x1 : x1;
                                const cy1 = isRelative ? currentY + y1 : y1;
                                const ex = isRelative ? currentX + x : x;
                                const ey = isRelative ? currentY + y : y;

                                const curvePoints = approximateQuadraticBezier(currentX, currentY, cx1, cy1, ex, ey);
                                currentSubpath.push(...curvePoints.slice(1));

                                lastControlX = cx1;
                                lastControlY = cy1;
                                currentX = ex;
                                currentY = ey;
                            }
                            break;
                        }

                        case 't': {
                            while (i + 1 < commands.length && !cmdRe.test(commands[i])) {
                                const x = parseFloat(commands[i++]);
                                const y = parseFloat(commands[i++]);

                                let cx1 = currentX;
                                let cy1 = currentY;
                                if (prevCmd && (prevCmd.toLowerCase() === 'q' || prevCmd.toLowerCase() === 't')) {
                                    cx1 = 2 * currentX - lastControlX;
                                    cy1 = 2 * currentY - lastControlY;
                                }

                                const ex = isRelative ? currentX + x : x;
                                const ey = isRelative ? currentY + y : y;

                                const curvePoints = approximateQuadraticBezier(currentX, currentY, cx1, cy1, ex, ey);
                                currentSubpath.push(...curvePoints.slice(1));

                                lastControlX = cx1;
                                lastControlY = cy1;
                                currentX = ex;
                                currentY = ey;
                            }
                            break;
                        }

                        case 'a': {
                            while (i + 6 < commands.length && !cmdRe.test(commands[i])) {
                                const rx = parseFloat(commands[i++]);
                                const ry = parseFloat(commands[i++]);
                                const xAxisRotation = parseFloat(commands[i++]);
                                const largeArcFlag = parseFloat(commands[i++]);
                                const sweepFlag = parseFloat(commands[i++]);
                                const x = parseFloat(commands[i++]);
                                const y = parseFloat(commands[i++]);

                                const ex = isRelative ? currentX + x : x;
                                const ey = isRelative ? currentY + y : y;

                                const arcPoints = approximateArc(currentX, currentY, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, ex, ey);
                                currentSubpath.push(...arcPoints.slice(1));

                                currentX = ex;
                                currentY = ey;
                            }
                            break;
                        }

                        case 'z': {
                            currentSubpath.push({ x: subpathStartX, y: subpathStartY });
                            currentX = subpathStartX;
                            currentY = subpathStartY;
                            subpaths.push(currentSubpath);
                            currentSubpath = [];
                            break;
                        }

                        case 'f': {
                            fill = commands[i++];
                            break;
                        }

                        case 'w': {
                            linewidth = parseFloat(commands[i++]);
                            break;
                        }

                        case 'k': {
                            stroke = commands[i++];
                            break;
                        }

                        default:
                            console.warn("Unsupported command:", cmd);
                            break;
                    }
                    prevCmd = cmd;
                }

                if (currentSubpath.length > 0) {
                    subpaths.push(currentSubpath);
                }

                subpaths.forEach(subpathPoints => {
                    const anchors = subpathPoints.map(point => new Two.Anchor(point.x, point.y));
                    const isClosed = subpathPoints.length > 1 && 
                                     subpathPoints[subpathPoints.length - 1].x === subpathPoints[0].x && 
                                     subpathPoints[subpathPoints.length - 1].y === subpathPoints[0].y;
                    const path = two.makePath(anchors, !isClosed);
                    path.fill = fill;
                    path.stroke = stroke;
                    path.linewidth = linewidth;
                });

                console.log("Generated subpaths:", subpaths);
                break;
            }

            default:
                console.log("未知的形狀類型:", type);
                break;
        }
    });
}

function renderShapes(shapes, divId) {
    var div = document.getElementById(divId);
    if (!twoInstances[divId]) {
        twoInstances[divId] = new Two({ width: div.offsetWidth, height: div.offsetHeight }).appendTo(div);
    }
    var two = twoInstances[divId];

    two.clear();

    if (typeof shapes === 'object') {
        // 遍歷物件的每個屬性
        Object.keys(shapes).forEach(key => {
            const shapeStr = shapes[key];
            if (typeof shapeStr === 'string') {
                renderShape(shapeStr, two);
            } else {
                console.log(`無效的形狀描述 for ${key}:`, shapeStr);
            }
        });
    } else if (typeof shapes === 'array') {
        renderShape(shapes.join(";"), two);
    } else if (typeof shapes === 'string') {
        renderShape(shapes, two);
    } else {
        console.log("預期輸入為字串:", shapes);
    }

    two.update();
}
