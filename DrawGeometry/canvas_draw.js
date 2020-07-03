

var xC, yC, SCALE;

var elem;
var ctx;

// SCALE задает ИСХОДНЫЙ масштаб при рисовании проекции модели на плоскость OXY,
// Представим, что значения координат модели в WebGeometry по X и Y
// находятся в пределах от -3.0 до + 3.0, а холст имеет размеры 770 x 400.
// Для приведения в соответствии значений в этих двух системах координат 
// используется коэффициент масштабирования SCALE. 
SCALE = 250;
// xC и yC задают координаты точки на на холсте в пикселах 
// имеющую координаты (0, 0) в системе координат WebGeometry
xC = 23; // 23 пиксела вправо по холсту
yC = 400 - 15;	// 400 - 15  - пикселов вниз по холсту 
				// 400 - размер холста по вертикали в пикселах

var x_coord = -1000; //   Значения координат (в единицах WebGeometry) 
var y_coord = -1000; //     положения курсора мыши на холсте.

// Mouse
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var image_load = false;
var image_data;

function addHandler(object, event, handler) 
{
	// object — элемент к которому относится обработчик
	// event — событие, к которому относится обработчик
	// handler — функция обработчик
	if (object.addEventListener) 
	{
		object.addEventListener(event, handler, false);
	}
	else if (object.attachEvent) 
	{
		object.attachEvent('on' + event, handler);
	}
	else alert("Обработчик не поддерживается");
}

function init()		
{
	elem = document.getElementById('canvas_draw'); // получаем ссылку на элемент canvas_draw 
										// canvas_draw имеет размеры 770 x 400
	elem.style.position = "relative";
	elem.style.border = "1px solid";
	ctx = elem.getContext("2d"); // получаем 2D-контекст рисования на холсте
	
	ctx.font = "italic 10pt Arial";
	ctx.fillStyle = '#0000ff';
/*	
	// SCALE задает ИСХОДНЫЙ масштаб при рисовании проекции модели на плоскость OXY,
	// Представим, что значения координат модели в WebGeometry по X и Y
	// находятся в пределах от -3.0 до + 3.0, а холст имеет размеры 770 x 400.
	// Для приведения в соответствии значений в этих двух системах координат 
	// используется коэффициент масштабирования SCALE. 
	SCALE = 250;
	// xC и yC задают координаты точки на на холсте в пикселах 
	// имеющую координаты (0, 0) в системе координат WebGeometry
	xC = 23; // 23 пиксела вправо по холсту
	yC = 400 - 15;	// 400 - 15  - пикселов вниз по холсту 
					// 400 - размер холста по вертикали в пикселах
*/					
	//////////////////////////////////////////////////////////////////////
	var my_image = new Image();  
	if (!my_image) 
	{
		console.log('Failed to create the image object');
		return false;
	}
	
	// Загружаем изображение my_image ('brilliant.png')
	my_image.onload = function()
	{ 
		var width = 150; // 150 x 150 - размер кусочка холста
		var height = 150;
		// рисуем на холсте (можем выбрать произвольное место на холсте)
		ctx.drawImage(my_image, 0, 0, width, height);
		
		// Получаем объект image_data, содержащий копию 
		// пиксельных данных для заданной части холста
		image_data = ctx.getImageData(0, 0, width, height);
		image_load = true; // изображение сейчас загружено
							// и пиксельные данные получены
		draw(); // отрисовку всего холста производим после загрузки image
	};
	
	my_image.src = 'brilliant.png';	// изображение бриллианта хранится в файле
									// или в локальном файле или на сервере
									
	//////////////////////////////////////////////////////////////////////						
	// Регистрация событий для мыши
	elem.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	elem.onmousemove = handleMouseMove;

	
	// Для обработки вращения колеса мыши используем функцию wheel
//		addHandler(window, 'DOMMouseScroll', wheel);
//		addHandler(window, 'mousewheel', wheel);
//		addHandler(document, 'mousewheel', wheel);	

	addHandler(elem, 'DOMMouseScroll', wheel);
	addHandler(elem, 'mousewheel', wheel);
	addHandler(elem, 'mousewheel', wheel);			
	
	// draw(); - если нет загрзки image, то эту строку следует раскомментировать
}

function draw()
{
	//  далее везде сокращение WG обозначает координаты в системе WebGeometry
	
	// очистка канваса от ранее нанесенных на него линий, отрезков, текстов и т.п.
	ctx.clearRect(0, 0, 770, 400);	// 770 x 400 - размеры холста
	
	// Рисуем координатные оси черным цветом и толщиной 1 пиксель
	// с размером по осям (WG) равным 3.0 (и влево/вниз и вправо/вверх)
	axes(ctx, 3.0, 3.0, 1.0, "Black");
	
	// Рисуем сетку (30 x 30 - для одного квадранта)
	// 0.1 - шаг сетки (WG) 
	// 0.2 - толщина линии
	grid(ctx, 30, 30, 0.1, 0.2, "Black");
	
	// Рисуем начало координат в точке (0, 0) в системе координат WG.
	text1(ctx, "O", new Point2D(0, 0), "lt", "dn", "Black", "14px Courier New");
	
	// Выводим на холст два одинаковых изображения сохраненных в image_data.
	if (image_load == true)
	{
		// (1.4, 2.4) - координаты места отрисовки (WG)
		ctx.putImageData(image_data, fx(-1.4), fy(2.4));
		// (1.2, -0.1) - координаты места отрисовки (WG)
		ctx.putImageData(image_data, fx(1.2), fy(-0.1));
	}
	
	///////////////////////////////////////////////////////////////////////////////////
	// Рисуем заголовок "text1" над синей рамкой изображенной сплошной линией.
	var point = new Point2D(0.55, 1.47);
	text1(ctx, "text1", point, "rt", "up", "B", "16px Courier New");
	
	//   Рисуем синию рамку вокруг 9 точек помеченных текстом при помощи функций text1 
	// с различными параметрами lt, gt, up, dn, ... .
	// Рамка изображается сплошной линией.
	var pts = new Array( new Point2D(0.10, 1.48), new Point2D(1.1, 1.48), 
				new Point2D(1.1, 1.12), new Point2D(0.1, 1.12), new Point2D(0.10, 1.48) );
	draw_polygon_line(ctx, pts, 4, "B"); // рамка синего цвета
	text(ctx, "draw_polygon_line", new Point2D(1.12, 1.35), "rt", "mid", "B", "12px Courier New");
	
	// Далее 9 точек помеченных текстом при помощи функций text1 
	//   с различными параметрами lt, gt, up, dn, ...
	point = new Point2D(0.30, 1.4);
	rsp(ctx, point, 4, "Brown"); // коричневая квадратная (rsp) точка с размером в 4 пикселя
	text1(ctx, "lt, up", point, "lt", "up", "Brown", "italic 12pt Arial");
	
	point = new Point2D(0.60, 1.4);
	rsp(ctx, point, 4, "Brown"); 
	text1(ctx, "center, up", point, "center", "up", "Brown", "italic 12pt Arial");
	
	point = new Point2D(0.90, 1.4);
	rsp(ctx, point, 4, "Brown");
	text1(ctx, "rt, up", point, "rt", "up", "Brown", "italic 12pt Arial");
	
	point = new Point2D(0.3, 1.3);
	csp(ctx, point, 4, "Brown"); // коричневая круглая (сsp) точка с размером в 4 пикселя
	text1(ctx, "lt, mid", point, "lt", "mid", "R", "italic 12pt Arial");
	
	point = new Point2D(0.6, 1.3);
	csp(ctx, point, 4, "Brown");
	text1(ctx, "center, mid", point, "center", "mid", "#9932CC", "italic 12pt Arial");
	
	point = new Point2D(0.9, 1.3);
	csp(ctx, point, 4, "Brown");
	text1(ctx, "rt, mid", point, "rt", "mid", "#9932CC", "italic 12pt Arial");
	
	point = new Point2D(0.3, 1.2);
	csp(ctx, point, 4, "#9932CC");
	text1(ctx, "lt, dn", point, "lt", "dn", "#ff00ff", "italic 12pt Arial");
	
	point = new Point2D(0.6, 1.2);
	csp(ctx, point, 4, "#9932CC");
	text1(ctx, "center, dn", point, "center", "dn", "#ff00ff", "italic 12pt Arial");
	
	point = new Point2D(0.9, 1.2);
	csp(ctx, point, 4, "#9932CC");
	text1(ctx, "rt, dn", point, "rt", "dn", "#ff00ff", "italic 12pt Arial");

	/////////////////////////////////////////////////////////////////////
	// Рисуем заголовок "text2" над коричневой рамкой изображенной пунктирной линией.
	var point = new Point2D(0.55, 0.98);
	text2(ctx, "text2", point, "rt", "up", "Brown", "16px Courier New");
	
	// Рисуем коричневую рамку вокруг 9 точек помеченных текстом при помощи функций text2 с различными 
	// параметрами lt, gt, up, dn, ... . Рамка изображается пунктирными линиями.
	pts = new Array( new Point2D(0.10, 0.99), new Point2D(1.1, 0.99), new Point2D(1.1, 0.62), new Point2D(0.1, 0.62), new Point2D(0.10, 0.99) );
	draw_polygon_line_dash(ctx, pts, 2, "Brown"); // рамка коричневого цвета проведена пунктирной линией
	text(ctx, "draw_polygon_line_dash", new Point2D(1.12, 0.83), "rt", "mid", "Brown", "12px Courier New");
	
	// Далее 9 точек помеченных текстом при помощи функций text2 с различными параметрами lt, gt, up, dn, ...
	point = new Point2D(0.3, 0.9);
	rsp(ctx, point, 4, "Brown");
	text2(ctx, "lt, up", point, "lt", "up", "Brown");
	
	point = new Point2D(0.6, 0.9);
	rsp(ctx, point, 4, "Brown");
	text2(ctx, "center, up", point, "center", "up", "Brown");
	
	point = new Point2D(0.9, 0.9);
	rsp(ctx, point, 4, "Brown");
	text2(ctx, "rt, up", point, "rt", "up", "Brown");
	
	point = new Point2D(0.3, 0.8);
	csp(ctx, point, 4, "Brown");
	text2(ctx, "lt, mid", point, "lt", "mid", "#9932CC");
	
	point = new Point2D(0.6, 0.8);
	csp(ctx, point, 4, "Brown");
	text2(ctx, "center, mid", point, "center", "mid", "#9932CC");
	
	point = new Point2D(0.9, 0.8);
	csp(ctx, point, 4, "Brown");
	text2(ctx, "rt, mid", point, "rt", "mid", "#9932CC");
	
	point = new Point2D(0.3, 0.7);
	csp(ctx, point, 4, "#9932CC");
	text2(ctx, "lt, dn", point, "lt", "dn", "#ff00ff");
	
	point = new Point2D(0.6, 0.7);
	csp(ctx, point, 4, "#9932CC");
	text2(ctx, "center, dn", point, "center", "dn", "#ff00ff");
	
	point = new Point2D(0.9, 0.7);
	csp(ctx, point, 4, "#9932CC");
	text2(ctx, "rt, dn", point, "rt", "dn", "#ff00ff");

	/////////////////////////////////////////////////////////////////////////////////////
	// Рисуем закрашенный цветом "#EEEEFF" полигон.
	// Границы полигона окаймлены синими линиями.
	// pts - массив в которм хранятся координаты вершин полигона
	pts = new Array( new Point2D(0.2, 0.5), new Point2D(0.9, 0.45), new Point2D(1.1, 0.3), 
					 new Point2D(0.6, 0.1), new Point2D(0.1, 0.4), new Point2D(0.2, 0.5) );
	draw_polygon(ctx, pts, 2, "B", "#EEEEFF"); // рисум полигон
	// Отображаем текст "draw_polygon"
	text1(ctx, "draw_polygon", new Point2D(0.35, 0.35), "rt", "mid", "R", "20px Courier New");	
	// Отбражаем на холсте название элементов массива pts
	text1(ctx, "pts[0]", pts[0], "lt", "up", "B");
	text1(ctx, "pts[1]", pts[1], "rt", "up", "B");
	text1(ctx, "pts[2]", pts[2], "rt", "dn", "B");
	text1(ctx, "pts[3]", pts[3], "rt", "dn", "B");
	text2(ctx, "pts[4]", pts[4], "center", "dn", "B");
	
	/////////////////////////////////////////////////////////////////////////////////////////
	// Рисуем еще один закрашенный другим цветом "#EEEEAA" полигон.
	// Границы полигона окаймлены красными линиями.
	// pts - массив в которм хранятся координаты вершин полигона
	pts = new Array( new Point2D(-1.2, -0.9), new Point2D(-2.19, -0.8), new Point2D(-2.28, -0.7), 
					 new Point2D(-1.6, -0.1), new Point2D(-1.1, -0.4), new Point2D(-1.2, -0.5) );
	draw_polygon(ctx, pts, 5, "R", "#EEEEAA"); // рисум полигон
	// Отображаем текст "draw_polygon"
	text1(ctx, "draw_polygon", new Point2D(-1.60, -0.55), "center", "mid", "R", "bold 24px Courier New");	
	// Отбражаем на холсте название элементов массива pts
	text1(ctx, "pts[0]", pts[0], "center", "dn", "B");
	text1(ctx, "pts[1]", pts[1], "center", "dn", "B");
	text1(ctx, "pts[2]", pts[2], "lt", "mid", "B");
	text1(ctx, "pts[3]", pts[3], "rt", "up", "B");
	text2(ctx, "pts[4]", pts[4], "rt", "mid", "B");
	
	/////////////////////////////////////////////////////////////////////////////////////////
	// Рисуем коричневую прямую, которая проходит через точки pt1 и pt2.
	// Прямая начинается с точки имеющей координату x равную значению 1.6.
	// Прямая заканчивается на точке имеющей координату x равную значению 2.8.
	var pt1 = new Point2D(1.9, 1.2, 1);
	var pt2 = new Point2D(2.5, 1.3, 5);
	csp(ctx, pt1, 6, "R");
	csp(ctx, pt2, 6, "R");
	text1(ctx, "pt1", pt1, "rt", "dn", "Brown");
	text1(ctx, "pt2", pt2, "rt", "dn", "Brown");
	line_ext(ctx, pt1, pt2, 1.6, 2.8, 1, "Brown");
	text1(ctx, "line_ext", new Point2D(2.1, 1.24), "rt", "up", "Brown");
	
	text1(ctx, "x_begin", new Point2D(1.6, 1.15), "lt", "up", "Brown");
	text1(ctx, "x_end", new Point2D(2.7, 1.35), "rt", "up", "Brown");	
	
	////////////////////////////////////////////////////////////////////////
	// Рисуем еще одну прямую, теперь черного цвета, 
	// которая проходит через другие точки pt1 и pt2.
	// Прямая начинается с точки имеющей координату x равную значению -0.1.
	// Прямая заканчивается на точке имеющей координату x равную значению -1.1.
	pt1 = new Point2D(-0.2, 0.2);
	pt2 = new Point2D(-0.9, 0.5);
	rsp(ctx, pt1, 12, "Black");
	rsp(ctx, pt2, 12, "Black");
	text2(ctx, "pt1", pt1, "center", "up", "Black", "italic 20pt Arial");
	text2(ctx, "pt2", pt2, "center", "up", "Black", "italic 20pt Arial");
	line_ext(ctx, pt1, pt2, -0.1, -1.1, 4, "Black");
	text1(ctx, "line_ext", new Point2D(-0.6, 0.4), "rt", "up", "Black");

	// Отображаем три прямые проходящие через точки pt1 и pt2, но заходящие за эти точки.
	// С этой целью используем функцию line_ext2. Степень "захода" прямой за точки pt1 и pt2
	// определяет величина четвертого по счету параметра (kf) в функции line_ext2.
	
	// Прямая линия проходящая через pt1 и pt2 в первом квадранте холста.
	pt2 = new Point2D(1.3, 1.0);
	pt1 = new Point2D(2.2, 1.1);
	rsp(ctx, pt1, 8, "#52f");
	rsp(ctx, pt2, 8, "#52f");
	text2(ctx, "pt1", pt2, "center", "up", "#52f", "italic 12pt Arial");
	text2(ctx, "pt2", pt1, "center", "up", "#52f", "italic 12pt Arial");
	line_ext2(ctx, pt2, pt1, 5.0, 1, "#52f"); // прямая имеющая цвет #52f
	text1(ctx, "line_ext2", new Point2D(1.5, 1.02), "center", "up", "#52f");
	
	// Две прямаые проходящие через точки pt1 и pt2 образуют одну двухцветную толстую прямую.
	// Сначала отображается прямая линия синего цвета имеющая толщину в 12 пикселей.
	// Затем поверх синей прямой рисуется прямая красного цвета с толщиной в 4 пиксела.
	pt1 = new Point2D(-1.0, -1.3);
	pt2 = new Point2D(-0.6, -0.4);
	line_ext2(ctx, pt1, pt2, 20.0, 12, "B"); // синяя прямая
	line_ext2(ctx, pt1, pt2, 20.0, 4, "R");  // красная прямая
	csp(ctx, pt1, 14, "R");
	csp(ctx, pt2, 14, "R");
	text1(ctx, "pt1", pt1, "lt", "up", "R", "italic 12pt Arial");
	text1(ctx, "pt2", pt2, "lt", "up", "R", "italic 12pt Arial");
	text1(ctx, "Two straight lines", new Point2D(-0.75, -0.8), "rt", "mid", "B", "10pt Courier New");
	text1(ctx, "line_ext2 + ", new Point2D(-0.74, -0.85), "rt", "mid", "B", "8pt Courier New");
	text1(ctx, "line_ext2", new Point2D(-0.44, -0.85), "rt", "mid", "R", "8pt Courier New");
	
	// Выводим на холст длинную прямую линию проходящую через точки pt1 и pt2.
	pt1 = new Point2D(1.3, -1.0);
	var pt2 = new Point2D(2, -1.2);
	rsp(ctx, pt1, 8, "#52f");
	rsp(ctx, pt2, 8, "#52f");
	text2(ctx, "pt2", pt1, "center", "up", "#52f", "italic 12pt Arial");
	text2(ctx, "pt1", pt2, "center", "up", "#52f", "italic 12pt Arial");
	line_ext2(ctx, pt1, pt2, 1.3, 0.5, "#52f"); // длинная прямая имеющая цвет #52f
	text1(ctx, "line_ext2", new Point2D(1.6, -1.05), "rt", "mid", "#52f");
	
	// Рисуем четыре треугольника разного размера с цветами R, G, B и "#acf"
	// повернутые последовательно против часовой стрелки на углы 0°, 90°, 180° и 270°. 
	// Отсчет углов идет относительно оси OY.
	arrow(ctx, new Point2D(-2.0, 2.0), 0*DEGREE, 0.6, "R", false);
	arrow(ctx, new Point2D(-2.0, 2.0), 90*DEGREE, 1.0, "G", false);
	arrow(ctx, new Point2D(-2.0, 2.0), 180*DEGREE, 1.4, "B", false);
	arrow(ctx, new Point2D(-2.0, 2.0), 270*DEGREE, 1.8, "#acf", false);
	
	//////////////////////////////////////////////////////////////////////////////////
	// Рисуем красный отрезок прямой, который задается точками pt1 и pt2.
	pt1 = new Point2D(2.0, 0.9, 0); // начальная точка отрезка
	csp(ctx, pt1, 6, "R");
	text(ctx, "pt1", pt1, "lt", "up", "R", "italic 16pt Arial");
	pt2 = new Point2D(2.6, 0.8); // конечная точка отрезка
	csp(ctx, pt2, 6, "R");
	text(ctx, "pt2", pt2, "rt", "dn", "R", "italic 16pt Arial");
	line_segment(ctx, pt1, pt2, 1, "R"); // рисуем отрезок
	text1(ctx, "line_segment", new Point2D(2.2, 0.86), "rt", "up", "R");
	
	////////////////////////////////////////////////////////////////////////////////////
	// Рисуем синий отрезок прямой, который задается точками pt1 и pt2.
	// В точке pt2 изображается стрелка с относительным размером 0.6 
	//   (пятый по счету параметр функции  segment_arrow)
	csp(ctx, new Point2D(1.85, 0.55), 7, "B");
	segment_arrow(ctx, new Point2D(1.85, 0.55), new Point2D(2.7, 0.5), 0.5, 0.6, "B");
	text1(ctx, "segment_arrow", new Point2D(2.0, 0.54), "rt", "up", "B");
	text1(ctx, "pt1", new Point2D(1.85, 0.55), "lt", "dn", "B");
	text2(ctx, "pt2", new Point2D(2.7, 0.5), "rt", "mid", "B");
	
	/////////////////////////////////////////////////////////////////////////////////////
	// Рисуем коричневый отрезок прямой, который задается точками pt1 и pt2.
	// В точках pt1 и pt2 изображаются стрелки с относительными размерами 0.2 
	//  (пятый по счету параметр функции  segment_two_arrow)
	segment_two_arrow(ctx, new Point2D(1.6, 0.2), new Point2D(2.8, 0.087), 0.5, 0.2, "Brown");
	text1(ctx, "segment_two_arrow", new Point2D(2.5, 0.155), "lt", "up", "Brown");
	text2(ctx, "pt1", new Point2D(1.6, 0.2), "lt", "mid", "Brown");
	text2(ctx, "pt2", new Point2D(2.8, 0.087), "rt", "mid", "Brown");

	///////////////////////////////////////////////////////////////////////////
	// Дуга синего цвета
	text1(ctx, "drawAngle", new Point3D(-1.4, 0.7), "rt", "up", "B");
	var center = new Point2D(-2.0, -0.1);
	csp(ctx, center, 6, "B");
	text1(ctx, "center", center, "rt", "dn", "B");
	// Рисуем дугу с центром в точке center		
	// дуга 20° - 60°
	draw_angle(ctx, center, DEGREE*20, DEGREE*60, 1.0, 2, "B");
	text1(ctx, "radius_arrow", new Point3D(-1.3, 0.28), "lt", "up", "B");
	radius_arrow(ctx, center, 1.0, DEGREE*30, 1, 0.4, "B");
	
	///////////////////////////////////////////////////////////////////////////
	// Еще одна дуга коричневого цвета
	text1(ctx, "drawAngle_txt", new Point3D(-2.1, 0.7), "lt", "up", "Brown");
	// Рисуем дугу с центром в точке center.
	// Дуга 70° - 100° сопровождается текстом "Arc = 30°"
	draw_angle_txt(ctx, center, DEGREE*70, DEGREE*100, 0.8, "Arc = 30°", "center", "up", 2, "Brown");
	text1(ctx, "radius_arrow", new Point3D(-1.95, 0.4), "lt", "up", "Brown");
	radius_arrow(ctx, center, 0.8, DEGREE*85, 1, 0.3, "Brown");
	line_segment(ctx, center, new Point3D(-2.136, 0.690), 0.5, "Brown"); // рисуем отрезок
	line_segment(ctx, center, new Point3D(-1.725, 0.650), 0.5, "Brown"); // рисуем отрезок
			
	//////////////////////////////////////////////////////////////////////////////////
	// Рисуем красный эллипс - координаты центра заданы задны значениями по осям x и y.
	// 0.2, 0.8 - полуоси эллипсов
	text1(ctx, "drawEllipse", new Point3D(-0.6, 1.5), "lt", "up", "R");
	drawEllipse(ctx, -0.4, 1.5, 0.2, 0.8, 2, "R");
	//////////////////////////////////////////////////////////////////////////////////
	// Рисуем еще один синий эллипс - координаты центра заданы одной точкой Point3D.
	text1(ctx, "drawEllipse2", new Point3D(-2.0, 1.4), "rt", "up", "B");
	// 0.5, 0.2 - полуоси эллипсов
	drawEllipse2(ctx, new Point2D(-2.0, 1.2), 0.5, 0.2, 2, "B");	
	
	//////////////////////////////////////////////////////////////////////////////////
	// Рисуем окружность с центром в точке center и радиусом равным 0.3 в WG
	var center = new Point2D(0.7, -0.9);
	csp(ctx, center, 6, "R");
	text1(ctx, "center", center, "lt", "mid", "R");
	circle(ctx, center, 0.3, 4, "R");
	// Рисуем стрелку радиуса
	radius_arrow(ctx, center, 0.3, DEGREE*30, 1, 0.3, "R");
	text(ctx, "radius_arrow", new Point3D(0.84, -0.83), "lt", "up", "R", "10px Courier New");
	text1(ctx, "circle", new Point2D(1.0, -0.85), "rt", "mid", "R");

	/////////////////////////////////////////////////////////////////////////////////////////
	// Отображаем текущие координаты (x, y) сответствующие положению курсора мыши на холсте
	// Отрисовка текущих координат производится после того как нарисованы все объекты.
	// В этом случае отображение значений координат будет производиться поверх
	// всех остальных изображений объектов.
	if (x_coord > -1000) //  Удостоверяемся, что мышь получила 
	{					// какие-то координаты при перемещении по холсту
						// и только в этом случае следует отобразить значение координат.
		var x_text = roundNumber(x_coord, 3);
		var y_text = roundNumber(y_coord, 3);
		var xy_text = "(" + x_text + ", " + y_text + ")";
		text1(ctx, xy_text, new Point2D(x_coord, y_coord), "rt", "mid", "Black", "9px Courier New");
		
		//////////////////////////////////////////////////////////////////////////////////////////////////
		//  Если хотим вывести координаты, задаваемые положением курсора мыши, в определенном месте холста,
		// независимо от того сдвинуты или нет изображения влево/вправо или вверх/вниз, 
		// то в таком случае следует использовать стандартную функцию HTML5 Canvas, а именно fillText.
		// Например, вывод в точку с координатами на холсте (600, 300) будет выглядеть следующим образом:
		//              var xy_text = "x, y = (" + x_text + ", " + y_text + ")";
		//              ctx.fillText(xy_text, 600, 30);
		///////////////////////////////////////////////////////////////////////////////////////////////////
	}				
}

document.addEventListener('keydown', function(event)
{
	var code = event.keyCode;
	
	//  Передвижение поля отображения по холсту
	if (code == 37) 
	{   // left - движение поля отображения на холсте влево
		xC = xC - 5; draw();
	}
	if (code == 38) 
	{   // up - движение поля отображения на холсте вверх     
		yC = yC - 5; draw();
	}
	if (code == 39) 
	{   // right - движение поля отображения на холсте вправо
	  xC = xC + 5; draw()
	}
	if (code == 40) 
	{   // down - движение поля отображения на холсте вниз
	  yC = yC + 5; draw();
	}
	
	// Изменение масштаба отображения на холсте
	if (code == 188) // <
	{
		SCALE = SCALE - 5; draw();
	}
	if (code == 190) // >
	{
		SCALE = SCALE + 5; draw();
	}
});

document.addEventListener('keyup', function(event) 
{
	var code = event.keyCode;
});
  
function handleMouseDown(event) 
{
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

function handleMouseUp(event) {
	mouseDown = false;
}	  
  
// При движении мыши происходит отображение координат WebGeometry 
// которые соответствуют курсору мыши (в правой верхней части холста).
function handleMouseMove(event) 
{
	if (mouseDown) 
	{
		// если клавиша мыши нажата то двигаем изображения на холсте
		var newX = event.clientX;
		var newY = event.clientY;
		
		var d = 7.0; 

		var deltaX = newX - lastMouseX;
		if (deltaX < 0)
		{
			xC = xC - d;
		}
		if (deltaX > 0)
		{
			xC = xC + d;
		}
		
		var deltaY = newY - lastMouseY;
		if (deltaY < 0)
		{
			yC = yC - d;
		}
		if (deltaY > 0)
		{
			yC = yC + d;
		}

		lastMouseX = newX
		lastMouseY = newY;
		draw();		
	}
	else
	{
		// если клавиша мыши НЕ нажата то выводим координаты (WG) точки 
		// на которой находится курсор мыши
		event.preventDefault();
		elem = document.getElementById('canvas_draw');
		coords = elem.getBoundingClientRect();	

		// координаты мыши 	
		var x_mouse, y_mouse;

		// координаты мыши на холсте (canvas_draw)
		x_mouse = event.clientX - coords.left;
		y_mouse = event.clientY - coords.top;	

		// приводим координаты мыши к WebGeometry (WG)
		x_coord = (x_mouse - xC)/SCALE;
		y_coord = (yC - y_mouse)/SCALE;

		draw();
	}
}

// При вращении колесика мыши меняется масштаб изображения на холсте
function wheel(event) 
{
	if (event.preventDefault) 
		event.preventDefault();
	event.returnValue = false;
	
	var delta; // значение поворота колёсика мыши
	event = event || window.event;
	// Opera и IE работают со свойством wheelDelta
	if (event.wheelDelta) 
	{ // В Opera и IE
		delta = event.wheelDelta / 120;
		// В Опере значение wheelDelta такое же, но с противоположным знаком
		if (window.opera) 
			delta = -delta; // Дополнительно для Opera
	}
	else if (event.detail) 
	{ // Для Gecko
		delta = -event.detail / 3;
	}
	
	SCALE = SCALE + 5 * delta; // меняем масштаб
	draw(); // перерисовываем
}

addEventListener("load", init);