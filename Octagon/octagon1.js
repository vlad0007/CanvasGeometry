// octagon.js
var xC, yC, SCALE;

var colors = [];    // массив в котором хранятся цвета граней
var points = [];    // массив для хранения вершин всех полигонов в виде Point3D

var elem; // ссылка на элемент canvas_draw
var ctx; // контекст рисования на холсте

// Исходные углы задающие положении модели
var angleX = -84*DEGREE;
var angleY = -55*DEGREE;
var angleZ = 0*DEGREE;

var mouseDown = false;
var x_last_mouse = 0;
var y_last_mouse = 0;

function octagon()
{
	elem = document.getElementById('canvas_draw'); // получаем ссылку на элемент canvas_draw 
	elem.style.position = "relative";
	elem.style.border = "1px solid";
	ctx = elem.getContext("2d"); // получаем 2D-контекст рисования на холсте
	
	// SCALE задает ИСХОДНЫЙ масштаб при рисовании проекции модели на плоскость OXY
	SCALE = 250;
	// xC и yC задают центральную точку (0, 0) на плоскости OXY (на холсте)
	xC = elem.width / 2;
	yC = elem.height / 2.2;
	
	// Расчет координат вершин 3D модели.
	recalc();
	// Вывод модели на экран
	draw();
	
	// Обработчики событий связанных с мышью.
	elem.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	elem.onmousemove = handleMouseMove;
}
	
function recalc()
{
	// Расчет координат вершин 3D модели.
	vertices.length = 0; // обнуление массива vertices
	VerticesCalculation();

	// Создание топологии 3D модели с учетом координат вершин и их взаимосвязи.
	plgs.length = 0;
	colors.length = 0;
	points.length = 0;
	CreatePolyhedron();	
}

// Отображение модели на холсте
function draw()
{	
	// Перед началом отображения модели
	//   холст необходимо очистить.
	ctx.clearRect(0, 0, elem.width, elem.height);
	
	// Задание цвета граней
	facet_colors(); 
	
	// Расчет поворотов модели вокруг координатных осей X, Y и Z.
	var matX = new Matrix3D(); 
	matX.RotX(angleX); 
	
	var matY = new Matrix3D(); 
	matY.RotY(angleY);
	
	var matZ = new Matrix3D(); 
	matZ.RotZ(angleZ);	
	
	var i, j;
	
	// Отрисовка модели на холсте - ребра и грани
	
	// цикл по всем граням модели
	for (i = 0; i < plgs.length; i++) 
	{
		// Цикл по всем вершинам текущей грани. 
		//  Пересчет координат вершин грани, так как она повернута.
		for (j = 0; j < plgs[i].vertexes.length; j++) 
		{   
			// поворот вершин грани модели
			plgs[i].vertexes[j] = plgs[i].vertexes[j].Rotate(matX);
			plgs[i].vertexes[j] = plgs[i].vertexes[j].Rotate(matY);
			plgs[i].vertexes[j] = plgs[i].vertexes[j].Rotate(matZ);
		}
		
		// Первые три точки каждого многоугольника (грани) используются для создания двух 3D-векторов.
		var pt0 = new Point3D(plgs[i].vertexes[0][0], plgs[i].vertexes[0][1], plgs[i].vertexes[0][2]);
		var pt1 = new Point3D(plgs[i].vertexes[1][0], plgs[i].vertexes[1][1], plgs[i].vertexes[1][2]);
		var pt2 = new Point3D(plgs[i].vertexes[2][0], plgs[i].vertexes[2][1], plgs[i].vertexes[2][2]);
		
		// Два 3D-вектора
		var vec1 = new Vector3D(pt1[0] - pt0[0], pt1[1] - pt0[1], pt1[02] - pt0[2]);
		var vec2 = new Vector3D(pt2[0] - pt0[0], pt2[1] - pt0[1], pt2[02] - pt0[2]);
		// Векторное произведение vec1 и vec2
		var vecNormal = vec1.Cross(vec2); 
		
		if (vecNormal[2] >= 0) // По направлению нормали определяем  
		{                      // передние и задние грани модели
			// рисуем грани и ребра на внешней части модели.
			// Цвет грани задан ранее вызовом функции facet_colors().
			// Цвет ребер - черный ("Black")
			draw_polygon(ctx, plgs[i].vertexes, 1, "Black", colors[i]);  
		}	
	}
}

function handleMouseDown(event) 
{
	// Если клавиша мыши нажата то начинаем поворот модели
	mouseDown = true; // клавиша мыши нажата
	event.preventDefault();
	elem = document.getElementById('canvas_draw');
	var coords = elem.getBoundingClientRect();	
	
	// пересчет координат мыши к холсту canvas_draw
	x_last_mouse = event.clientX - coords.left;
	y_last_mouse = event.clientY - coords.top;
}

function handleMouseUp(event) 
{
	// Если клавиша мыши отажата то заканчиваем поворот модели
	mouseDown = false; // клавиша мыши отжата
}    

function handleMouseMove(event) 
{
	// Если клавиша мыши нажата то производим поворот модели.
	// Если клавиша мыши не нажата, то ничего не делаем.
	event.preventDefault();
	elem = document.getElementById('canvas_draw');
	var coords = elem.getBoundingClientRect();	
	
	// координаты мыши 	
	var x_mouse, y_mouse;
	
	// координаты мыши на холсте canvas_draw
	x_mouse = event.clientX - coords.left;
	y_mouse = event.clientY - coords.top;	
	
	// приводим координаты мыши к WebGeometry
	x_coord = (x_mouse - xC)/SCALE;
	y_coord = (yC - y_mouse)/SCALE;

	if (mouseDown == true) 
	{	
		// Если мышь нажата, то призводится вращение модели.

		// координаты мыши на холсте пересчитаны 
		// в координаты используемые в webgeometry	
		var deltaX = x_mouse - x_last_mouse;
		var deltaY = y_mouse - y_last_mouse;
		
		// Число 10 задает "скорость" поворота модели.
		angleX = angleX + (x_mouse - x_last_mouse)/10;
		angleY = angleY + (y_mouse - y_last_mouse)/10;	

		// пересчет координат и отображение модели
		recalc();
		draw();
		
		// Запоминаем текущее положение курсора мыши
		x_last_mouse = x_mouse;
		y_last_mouse = y_mouse;
	}
}

