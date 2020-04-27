window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.onload = function () {
    const WINDOW = {
        LEFT: -10,
        BOTTOM: -10,
        WIDTH: 20,
        HEIGHT: 20,
        CENTER: new Point(0, 0, -30), // центр окошка, через которое видим мир
        CAMERA: new Point(0, 0, -50) // точка, из которой смотрим на мир
    };
    const ZOOM_OUT = 1.1;
    const ZOOM_IN = 0.9;

    const sur = new Surfaces;
    const canvas = new Canvas({ width: 600, height: 600, WINDOW, callbacks: { wheel, mousemove, mouseup, mousedown } });
    const graph3D = new Graph3D({ WINDOW });
    const ui = new UI({ callbacks: { move, printPoints, printEdges, printPolygons } });

    const SCENE = [sur.odnopolostgiperParaboloid()];  
   /* const SCENE = [
        sur.sphera(40),
        sur.sphera(40, 3, new Point(-6, 1, -6), '#00ff00'),
        sur.sphera(40, 2, new Point(6, 0, -9), '#00ffff')
    ];*/
    const LIGHT = new Light(-20, 2, -20, 200); //источник света


    let canRotate = 0;
    let canPrint = {
        points: false,
        edges: false,
        polygons: false
    }

    // about callbacks
    function wheel(event) {
        const delta = (event.wheelDelta > 0) ? ZOOM_IN : ZOOM_OUT;
        SCENE.forEach(subject => subject.points.forEach(point => graph3D.zoom(delta, point)));
    }

    function mouseup() {
        canRotate = false;
    }

    function mousedown() {
        canRotate = true;
    }

    function mousemove(event) {
        if (canRotate) {
            if (event.movementX) { // вращение вокруг Oy
                const alpha = (event.movementX > 0) ? -canvas.sx(event.movementX) / (WINDOW.CENTER.z * 100) : canvas.sx(event.movementX) / (WINDOW.CENTER.z * 100);
                SCENE.forEach(subject => subject.points.forEach(point => graph3D.rotateOy(alpha, point)));
            }
            if (event.movementY) { // вращение вокруг Ox
                const alpha = (event.movementY > 0) ? -canvas.sx(event.movementX) / (WINDOW.CENTER.z * 100) : canvas.sx(event.movementX) / (WINDOW.CENTER.z * 100);
                SCENE.forEach(subject => subject.points.forEach(point => graph3D.rotateOx(alpha, point)));
            }
        }
    }

    function printPoints(value) {
        canPrint.points = value;
    }
    function printEdges(value) {
        canPrint.edges = value;
    }
    function printPolygons(value) {
        canPrint.polygons = value;
    }

    function move(direction) {
        if (direction === 'up' || direction === 'down') {
            const delta = (direction === 'up') ? 0.1 : -0.1;
            SCENE.forEach(subject => subject.points.forEach(point => graph3D.moveOy(delta, point)));
        }
        if (direction === 'left' || direction === 'right') {
            const delta = (direction === 'right') ? 0.1 : -0.1;
            SCENE.forEach(subject => subject.points.forEach(point => graph3D.moveOx(delta, point)));
        }
    }

    function moveUp(event) {

    }

    // about render
    function clear() {
        canvas.clear();
    }

    function printAllPolygons() {
        if (canPrint.polygons) {

            const polygons = [];

            SCENE.forEach(subject => {
                // graph3D.calcGorner(subject, WINDOW.CAMERA);

                graph3D.calcDistance(subject, WINDOW.CAMERA, 'distance');
                graph3D.calcDistance(subject, LIGHT, 'lumen');

                for (let i = 0; i < subject.polygons.length; i++) {
                    if (subject.polygons[i].visible) {
                        const polygon = subject.polygons[i];
                        const point1 = {
                            x: graph3D.xs(subject.points[polygon.points[0]]),
                            y: graph3D.ys(subject.points[polygon.points[0]])
                        };
                        const point2 = {
                            x: graph3D.xs(subject.points[polygon.points[1]]),
                            y: graph3D.ys(subject.points[polygon.points[1]])
                        };
                        const point3 = {
                            x: graph3D.xs(subject.points[polygon.points[2]]),
                            y: graph3D.ys(subject.points[polygon.points[2]])
                        };
                        const point4 = {
                            x: graph3D.xs(subject.points[polygon.points[3]]),
                            y: graph3D.ys(subject.points[polygon.points[3]])
                        };
                        let { r, g, b } = polygon.color;
                        const lumen = graph3D.calcIllumination(polygon.lumen, LIGHT.lumen);
                        r = Math.round(r * lumen);
                        g = Math.round(g * lumen);
                        b = Math.round(b * lumen);
                        polygons.push({
                            points: [point1, point2, point3, point4],
                            color: polygon.rgbToHex(r, g, b),
                            distance: polygon.distance
                        });
                    }
                }
            });
            //отрисовка всех полигонов
            polygons.sort((a, b) => b.distance - a.distance);
            polygons.forEach(polygon => canvas.polygon(polygon.points, polygon.color));

        }
    }

    function printSubject(subject) {
        // print edges
        if (canPrint.edges) {
            for (let i = 0; i < subject.edges.length; i++) {
                const edges = subject.edges[i];
                const point1 = subject.points[edges.p1];
                const point2 = subject.points[edges.p2];
                canvas.line(graph3D.xs(point1), graph3D.ys(point1), graph3D.xs(point2), graph3D.ys(point2));
            }
        }
        // print points
        if (canPrint.points) {
            for (let i = 0; i < subject.points.length; i++) {
                const points = subject.points[i];
                canvas.point(graph3D.xs(points), graph3D.ys(points));
            }
        }
        // print polygons
        if (canPrint.polygons) {

            // graph3D.calcGorner(subject, WINDOW.CAMERA);

            graph3D.calcDistance(subject, WINDOW.CAMERA, 'distance');
            subject.polygons.sort((a, b) => b.distance - a.distance);
            graph3D.calcDistance(subject, LIGHT, 'lumen');

            for (let i = 0; i < subject.polygons.length; i++) {
                if (subject.polygons[i].visible) {
                    const polygon = subject.polygons[i];
                    const point1 = {
                        x: graph3D.xs(subject.points[polygon.points[0]]),
                        y: graph3D.ys(subject.points[polygon.points[0]])
                    };
                    const point2 = {
                        x: graph3D.xs(subject.points[polygon.points[1]]),
                        y: graph3D.ys(subject.points[polygon.points[1]])
                    };
                    const point3 = {
                        x: graph3D.xs(subject.points[polygon.points[2]]),
                        y: graph3D.ys(subject.points[polygon.points[2]])
                    };
                    const point4 = {
                        x: graph3D.xs(subject.points[polygon.points[3]]),
                        y: graph3D.ys(subject.points[polygon.points[3]])
                    };
                    let { r, g, b } = polygon.color;
                    const lumen = graph3D.calcIllumination(polygon.lumen, LIGHT.lumen);
                    r = Math.round(r * lumen);
                    g = Math.round(g * lumen);
                    b = Math.round(b * lumen);
                    canvas.polygon([point1, point2, point3, point4], polygon.rgbToHex(r, g, b));
                }
            }
        }
    }

    function render() {
        clear();
        printAllPolygons();
        SCENE.forEach(subject => printSubject(subject));
        canvas.text(WINDOW.LEFT + 1, WINDOW.HEIGHT + WINDOW.BOTTOM - 1, `FPS: ${FPSout}`);
    }

    let FPS = 0;
    let FPSout = 0;
    let timestemp = (new Date()).getTime();
    (function animloop() {
        // вывод FPS
        FPS++;
        const currentTimestemp = (new Date()).getTime();
        if (currentTimestemp - timestemp >= 1000) {
            timestemp = currentTimestemp;
            FPSout = FPS;
            FPS = 0;
        }

        // отрисовка сцены
        render();
        requestAnimFrame(animloop);
    })();

}; 