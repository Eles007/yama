Surfaces.prototype.zemlyluna = (count = 20, R = 4, point = new Point(0, 0, 0), color = 'ff0000', animation) => {
    let points = [];
    let edges = [];
    let polygons = [];


    //расставить точки
    //земля
    const delta = Math.PI * 2 / count;
    for (let i = 0; i <= Math.PI; i += delta) {
        for (let j = 0; j < Math.PI * 2; j += delta) {
            const x = point.x + R * Math.sin(i) * Math.cos(j);
            const y = point.y + R * Math.sin(i) * Math.sin(j);
            const z = point.z + R * Math.cos(i);
            points.push(new Point(x, y, z));
        }
    }
    //луна
    for (let i = 0; i <= Math.PI; i += delta) {
        for (let j = 0; j < Math.PI * 2; j += delta) {
            const x = R + point.x + R / 8 * Math.sin(i) * Math.cos(j);
            const y = -R + point.y + R / 8 * Math.sin(i) * Math.sin(j);
            const z = -R * 2 + point.z + R / 8 * Math.cos(i);
            points.push(new Point(x, y, z));
        }
    }

    //ребра
    for (let i = 0; i < points.length; i++) {
        //вдоль
        if (i + 1 < points.length && (i + 1) % count !== 0) {
            edges.push(new Edge(i + 1, i));
        } else if ((i + 1) % count === 0) {
            edges.push(new Edge(i + 1 - count, i));
        }
        //поверек
        if (i + count < points.length) {
            if (i + count < points.length / 2) {
                edges.push(new Edge(i, i + count));
            }
            if (i > points.length / 2) {
                edges.push(new Edge(i, i + count));
            }
        }
    }
    //полигоны
    for (let i = 0; i < points.length; i++) {
        if (i + 1 + count < points.length && (i + 1) % count !== 0) {
            polygons.push(new Polygon([i, i + 1, i + 1 + count, i + count], color));
        } else if ((i + count) < points.length && (i + 1) % count === 0) {
            polygons.push(new Polygon([i, i + 1 - count, i + 1, i + count], color));
        }
    }

    return new Subject(points, edges, polygons, animation);
}