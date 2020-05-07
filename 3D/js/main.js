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
    const canvas = new Canvas({ width: 800, height: 800, WINDOW, callbacks: { wheel, mousemove, mouseup, mousedown } });
    const graph3D = new Graph3D({ WINDOW });
    const ui = new UI({ callbacks: { move, printPoints, printEdges, printPolygons } });


    const SCENE = [sur.hyperbolicParaboloid(20, { rotateOz: new Point })];
    const SCENE = [
        //солнце
        sur.sphera(
            20,
            10,
            new Point(0, 0, 0),
            '#FFD700',
            { rotateOz: new Point }
        ),
        //меркурий
        sur.sphera(
            20,
            0.5,
            new Point(-15, 0, 0),
            '#808080',
            { rotateOz: new Point(0, 0, 0) }
        ),
        //венера
        sur.sphera(
            20,
            1,
            new Point(25, 0, 0),
            '#FFFFF0',
            { rotateOz: new Point(0, 0, 0) }
        ),
        //луна
        sur.sphera(
            20,
            0.2,
            new Point(2, 27, -3),
            '#708090',
            { rotateOz: new Point(0, 0, 0) }
        ),
        //земля
        sur.sphera(
            20,
            2,
            new Point(0, 25, 0),
            '#4169E1',
            { rotateOz: new Point(0, 0, 0) }
        ),
        //марс
        sur.sphera(
            20,
            0.75,
            new Point(20, 30, 0),
            '#FF6347',
            { rotateOz: new Point(0, 0, 0) }
        ),
        //юпитер
        sur.sphera(
            20,
            7,
            new Point(-35, 40, 0),
            '#F0E68C',
            { rotateOz: new Point(0, 0, 0) }
        ),
        //кольцо
        sur.bublik(
            20,
            12,
            new Point(41, -64),
            '#8B4513',
            { rotateOz: new Point(0, 0) }
        ),
        //сатурн
        sur.sphera(
            20,
            5,
            new Point(41, -64, 0),
            '#FFEFD5',
            { rotateOz: new Point(0, 0, 0) }
        ),
        //уран
        sur.sphera(
            20,
            4,
            new Point(-62, -87, 0),
            '#1E90FF',
            { rotateOz: new Point(0, 0, 0) }
        ),
        //нептун
        sur.sphera(
            20,
            3.5,
            new Point(97, -14, 0),
            '#0000FF',
            { rotateOz: new Point(0, 0, 0) }
        )
    ];
    const LIGHT = new Light(0, 0, 0, 40); //источник света


    let canRotate = 0;
    let canPrint = {
        points: false,
        edges: false,
        polygons: false
    }

    // about callbacks
    function wheel(event) {
        const delta = (event.wheelDelta > 0) ? ZOOM_IN : ZOOM_OUT;
        SCENE.forEach(subject => {
            subject.points.forEach(point => graph3D.zoom(delta, point));
            if (subject.animation) {
                for (let key in subject.animation) {
                    graph3D.zoom(delta, subject.animation[key]);
                }
            }
        });
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
                const alpha = (event.movementX > 0) ? -canvas.sx(event.movementX) / (WINDOW.CENTER.z * 20) : canvas.sx(event.movementX) / (WINDOW.CENTER.z * 20);
                SCENE.forEach(subject => {
                    subject.points.forEach(point => graph3D.rotateOy(alpha, point));
                    if (subject.animation) {
                        for (let key in subject.animation) {
                            graph3D.rotateOy(alpha, subject.animation[key]);
                        }
                    }
                });
            }
            if (event.movementY) { // вращение вокруг Ox
                const alpha = (event.movementY > 0) ? -canvas.sx(event.movementX) / (WINDOW.CENTER.z * 20) : canvas.sx(event.movementX) / (WINDOW.CENTER.z * 20);
                SCENE.forEach(subject => {
                    subject.points.forEach(point => graph3D.rotateOx(alpha, point));
                    if (subject.animation) {
                        for (let key in subject.animation) {
                            graph3D.rotateOx(alpha, subject.animation[key]);
                        }
                    }
                });
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
    }

    function render() {
        canvas.clear();
        printAllPolygons();
        SCENE.forEach(subject => printSubject(subject));
        canvas.text(WINDOW.LEFT + 1, WINDOW.HEIGHT + WINDOW.BOTTOM - 1, `FPS: ${FPSout}`);
    }

    function animation() {
        //закрутим фигуру
        SCENE.forEach(subject => {
            if (subject.animation) {
                for (let key in subject.animation) {
                    const { x, y, z } = subject.animation[key];
                    const xn = WINDOW.CENTER.x - x;
                    const yn = WINDOW.CENTER.y - y;
                    const zn = WINDOW.CENTER.z - z;
                    // переместить центр объекта в центр координат
                    subject.points.forEach(point => graph3D.move(xn, yn, zn, point))
                    // вращать объект
                    const alpha = Math.PI / 180;
                    subject.points.forEach(point => graph3D[key](alpha, point));
                    // переместить центр объекта после вращения
                    subject.points.forEach(point => graph3D.move(-xn, -yn, -zn, point))
                }
            }
        });
    }


    setInterval(animation, 100);

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