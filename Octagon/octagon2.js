// octagon.js

var colors = [];    // массив в котором хранятся цвета граней
var points = [];    // массив для хранения вершин всех полигонов в виде Point3D

var elem; // ссылка на элемент canvas_draw
var ctx; // контекст рисования на холсте

var gui;
var controller;
var index = -1;  // индекс (номер) грани (фасеты)
		// если index = -1, то курсор мыши НЕ находится на на грани модели

// Исходные углы задающие положении модели
var angleX = -84*DEGREE;
var angleY = -55*DEGREE;
var angleZ = 0*DEGREE;

// scale_controller - коэффициент масштабирования размеров модели. Он задается в dat.GUI.
// Изначальный коэффициент масштабирования задается значением SCALE.
var scale_controller = 0.8;

var enumeration = true; // для переключателя отображения номеров вершин модели (да/нет)
var sizes = true; // Отображение размеров FullHeight, CrownHeight, ... (да/нет)

var mouseDown = false;
var x_last_mouse = 0;
var y_last_mouse = 0;

var x_coord = -100; //   Значения координат (в единицах WebGeometry) 
var y_coord = -100; //     положения курсора мыши на холсте.

// Следующие три первоначальные значения координат взяты заведомо меньшими,
// чем те значения, которые реально могут получиться в процессе работы программы.
var x_intersect_facet = -100; //   Значения координаты (в единицах WebGeometry) 
var y_intersect_facet = -100; // точки на фасете модели
var z_intersect_facet = -100; // Значения расчитывается в функции PointInPolygon

function octagon()
{
	elem = document.getElementById('canvas_draw'); // получаем ссылку на элемент canvas_draw 
	elem.style.position = "relative";
	elem.style.border = "1px solid";
	ctx = elem.getContext("2d"); // получаем 2D-контекст рисования на холсте
	
	ctx.font = "italic 10pt Arial";
	ctx.fillStyle = '#0000ff';
	
	// SCALE задает ИСХОДНЫЙ масштаб при рисовании проекции модели на плоскость OXY
	SCALE = 320;
	// xC и yC задают центральную точку на плоскости OXY (на канвасе)
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

	// Установка первоначальных значений в dat.GUI.
    controller = new function() 
	{
		this.lw = lw;
		this.r = r;
		this.corner_br_ratio = corner_break_ratio;
		this.corner_br_angle = corner_break_angle / DEGREE;   // перевели в градусы;

		this.hCrown = hCrown;
		this.angle_B0 = angle_B0 / DEGREE;	// верхний угол короны
		this.angle_B1 = angle_B1 / DEGREE;	// верхний угловой угол короны
		this.angle_A0 = angle_A0 / DEGREE;  // нижний угол короны
		this.H2H = H2H;		  

		this.hp = hp;    // глубина павильона
		this.angle_C0 = angle_C0 / DEGREE;	// Угол наклона грани A
		this.angle_C1 = angle_C1 / DEGREE;	// Угол наклона грани B
		this.angle_C2 = angle_C2 / DEGREE;	// Угол наклона грани C
		this.hLowerFacet = hLowerFacet;	    // Отношение высоты LowerFacet к hp
		this.hMiddleFacet = hMiddleFacet;	// Отношение высоты MiddleFacet к hp		
		
		this.rotationX = angleX/DEGREE;
		this.rotationY = angleY/DEGREE;
		this.rotationZ = angleZ/DEGREE;
		this.scale_controller = scale_controller;
		this.enumeration = true;
		this.sizes = true;
    }();
	
	// Создаем новый объект dat.GUI с правой стороны от canvas.
	// В dat.GUI будут отображаться значения параметров модели, углы поворота модели и т.д.
	gui = new dat.GUI({ autoPlace: false });
	gui.domElement.id = 'gui';
	gui_container.appendChild(gui.domElement);
	
	gui.add( controller, 'enumeration', false ).onChange( function() 
	{
		enumeration = controller.enumeration; 
		recalc();
		draw();
	});
	
	gui.add( controller, 'sizes', false ).onChange( function() 
	{
		sizes = controller.sizes; 
		recalc();
		draw();
	});
	
	var f0 = gui.addFolder('Rotation & Scale');	
	f0.add(controller, 'rotationX', -180, 180).onChange( function() 
	{
		angleX = (controller.rotationX)*DEGREE;
		recalc();
		draw();
		var angleX_deg = angleX/DEGREE;
		var angleX_text = "angle X = " + roundNumber(angleX_deg, 3) + "°";
		var angleY_deg = angleY/DEGREE;
		var angleY_text = "angle Y = " + roundNumber(angleY_deg, 3) + "°";			
		var angleZ_deg = angleZ/DEGREE;
		var angleZ_text = "angle Z = " + roundNumber(angleZ_deg, 3) + "°";	
		ctx.fillText(angleX_text, 380, 14);
		ctx.fillText(angleY_text, 380, 32);
		ctx.fillText(angleZ_text, 380, 50);	
	});
	f0.add(controller, 'rotationY', -180, 180).onChange( function() 
	{
		angleY = (controller.rotationY)*DEGREE;
		recalc();
		draw();
		var angleX_deg = angleX/DEGREE;
		var angleX_text = "angle X = " + roundNumber(angleX_deg, 3) + "°";		
		var angleY_deg = angleY/DEGREE;
		var angleY_text = "angle Y = " + roundNumber(angleY_deg, 3) + "°";		
		var angleZ_deg = angleZ/DEGREE;
		var angleZ_text = "angle Z = " + roundNumber(angleZ_deg, 3) + "°";	
		ctx.fillText(angleX_text, 380, 14);
		ctx.fillText(angleY_text, 380, 32);
		ctx.fillText(angleZ_text, 380, 50);	
	});
	f0.add(controller, 'rotationZ', -180, 180).onChange( function() 
	{
		angleZ = (controller.rotationZ)*DEGREE;
		recalc();
		draw();
		var angleX_deg = angleX/DEGREE;
		var angleX_text = "angle X = " + roundNumber(angleX_deg, 3) + "°";		
		var angleY_deg = angleY/DEGREE;
		var angleY_text = "angle Y = " + roundNumber(angleY_deg, 3) + "°";		
		var angleZ_deg = angleZ/DEGREE;
		var angleZ_text = "angle Z = " + roundNumber(angleZ_deg, 3) + "°";	
		ctx.fillText(angleX_text, 380, 14);
		ctx.fillText(angleY_text, 380, 32);
		ctx.fillText(angleZ_text, 380, 50);	
	});	
	f0.add(controller, 'scale_controller', 0.1, 3.0).onChange( function() 
	{
		scale_controller = controller.scale_controller;
		recalc();
		draw();
	});
	
	// Рундист
    var f1 = gui.addFolder('Girdle');
    f1.add(controller, 'lw', 0.1, 2.0).onChange( function() 
	{
	   var temp = lw;
       lw = controller.lw;
	   recalc();
	   if (isCorrect() == -1) 
	   {
		   lw = temp;
		   recalc();
		   controller.lw = temp;
	   }
	   draw();
	   gui.updateDisplay();
    });
    f1.add(controller, 'r', 0.01, 1).onChange( function() 
	{
		var temp = r;
		recalc();
		r = controller.r;
		draw();
		gui.updateDisplay();
	});
    f1.add(controller, 'corner_br_ratio', 0.15, 1.0).onChange( function() 
	{
		var temp = corner_break_ratio;
		corner_break_ratio = controller.corner_br_ratio;
		recalc();
		if (isCorrect() == -1) 
		{
			corner_break_ratio = temp;
			recalc();
			controller.corner_br_ratio = temp;
		}
		draw();	
		gui.updateDisplay();
	});
    f1.add(controller, 'corner_br_angle', 2, 85).onChange( function() 
	{
		var temp = corner_break_angle;
		corner_break_angle = (controller.corner_br_angle) * DEGREE;
		recalc();
		if (isCorrect() == -1) 
		{		
			corner_break_angle = temp;
			recalc();
			controller.corner_br_angle = temp / DEGREE;	
		}			
		draw();   
		gui.updateDisplay();
	});

	// Корона
    var f2 = gui.addFolder('Crown');
    f2.add(controller, 'hCrown', 0.01, 0.4).onChange( function() 
	{
		var temp = hCrown;
		hCrown = controller.hCrown;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   hCrown = temp;
		   recalc();
		   controller.hCrown = temp;
	    }
		draw();	
		gui.updateDisplay();
    });	
    f2.add(controller, 'angle_B0', 30, 60).onChange( function() 
	{
		var temp = angle_B0;
		angle_B0 = (controller.angle_B0) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   angle_B0 = temp;
		   recalc();
		   controller.angle_B0 = temp / DEGREE;
	    }
		draw();
		gui.updateDisplay();
	});
    f2.add(controller, 'angle_B1', 10, 50).onChange( function() 
	{
		var temp = angle_B1;
		angle_B1 = (controller.angle_B1) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   angle_B1 = temp;
		   recalc();
		   controller.angle_B1 = temp / DEGREE;
	    }		
		draw();		
		gui.updateDisplay();
	});
    f2.add(controller, 'angle_A0', 30, 60).onChange( function() 
	{
		var temp = angle_A0;
		angle_A0 = (controller.angle_A0) * DEGREE;
		recalc();
		if (isCorrect() == -1) 
	    {
		   angle_A0 = temp;
		   recalc();
		   controller.angle_A0 = temp / DEGREE;
	    }
		draw();
		gui.updateDisplay();		
	});
    f2.add(controller, 'H2H', 0.01, 0.9).onChange( function() 
	{
		var temp = H2H;
		H2H = controller.H2H;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   H2H = temp;
		   recalc();
		   controller.H2H = temp;
	    }
		draw();
		gui.updateDisplay();
    });	
	
	// Павильон
    var f3 = gui.addFolder('Pavilion');
    f3.add(controller, 'hp', 0.4, 0.9).onChange( function() 
	{
		var temp = hp;
		hp = controller.hp;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   hp = temp;
		   recalc();
		   controller.hp = temp;
	    }
		draw(); 		
		gui.updateDisplay();
    });	
	
    f3.add(controller, 'angle_C0', 30.0, 80.0).onChange( function() 
	{
		var temp = angle_C0;
		angle_C0 = (controller.angle_C0) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   angle_C0 = temp;
		   recalc();
		   controller.angle_C0 = temp / DEGREE;
	    }
		draw();
		gui.updateDisplay();
    });
    f3.add(controller, 'angle_C1', 30.0, 80.0).onChange( function() 
	{
		var temp = angle_C1;
		angle_C1 = (controller.angle_C1) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   angle_C1 = temp;
		   recalc();
		   controller.angle_C1 = temp / DEGREE;
	    }
		draw();   			
		gui.updateDisplay();
    });
    f3.add(controller, 'angle_C2', 30.0, 80.0).onChange( function() 
	{
		var temp = angle_C2;
		angle_C2 = (controller.angle_C2) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   angle_C2 = temp;
		   recalc();
		   controller.angle_C2 = temp / DEGREE;
	    }
		draw();   	
		gui.updateDisplay();
    });
    f3.add(controller, 'hLowerFacet', 0.1, 0.95).onChange( function() 
	{
		var temp = hLowerFacet;
		hLowerFacet = controller.hLowerFacet;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   hLowerFacet = temp;
		   recalc();
		   controller.hLowerFacet = temp;
	    }
		draw(); 
		gui.updateDisplay();
    });
    f3.add(controller, 'hMiddleFacet', 0.02, 0.95).onChange( function() 
	{
		var temp = hMiddleFacet;
		hMiddleFacet = controller.hMiddleFacet;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   hMiddleFacet = temp;
		   recalc();
		   controller.hMiddleFacet = temp;
	    }
		draw(); 
		gui.updateDisplay();
    });
}
	
function recalc()
{
	// Расчет координат вершин 3D модели.
	vertices.length = 0;
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
	ctx.clearRect(0, 0, elem.width, elem.height);
	
	facet_colors(); // задание цвета граней
	
	// Расчет поворотов модели
	var matX = new Matrix3D(); 
	matX.RotX(angleX); 
	
	var matY = new Matrix3D(); 
	matY.RotY(angleY);
	
	var matZ = new Matrix3D(); 
	matZ.RotZ(angleZ);	
	
	var i, j;
	
	// Отрисовка модели на холсте - ребра и грани
	for (i = 0; i < plgs.length; i++) // цикл по всем граням модели
	{
		for (j = 0; j < plgs[i].vertexes.length; j++) // цикл по всем вершинам грани
		{   
			plgs[i].vertexes[j][0] = scale_controller * plgs[i].vertexes[j][0];
			plgs[i].vertexes[j][1] = scale_controller * plgs[i].vertexes[j][1];
			plgs[i].vertexes[j][2] = scale_controller * plgs[i].vertexes[j][2];
			
			plgs[i].vertexes[j] = plgs[i].vertexes[j].Rotate(matX);
			plgs[i].vertexes[j] = plgs[i].vertexes[j].Rotate(matY);
			plgs[i].vertexes[j] = plgs[i].vertexes[j].Rotate(matZ);
		}
		
		// Первые три точки каждого многоугольника используются для создания двух 3D-векторов.
		var pt0 = new Point3D(plgs[i].vertexes[0][0], plgs[i].vertexes[0][1], plgs[i].vertexes[0][2]);
		var pt1 = new Point3D(plgs[i].vertexes[1][0], plgs[i].vertexes[1][1], plgs[i].vertexes[1][2]);
		var pt2 = new Point3D(plgs[i].vertexes[2][0], plgs[i].vertexes[2][1], plgs[i].vertexes[2][2]);
		
		// Два 3D-вектора
		var vec1 = new Vector3D(pt1[0] - pt0[0], pt1[1] - pt0[1], pt1[02] - pt0[2]);
		var vec2 = new Vector3D(pt2[0] - pt0[0], pt2[1] - pt0[1], pt2[02] - pt0[2]);
		// Векторное произведение
		var vecNormal = vec1.Cross(vec2); 
		
		if (vecNormal[2] >= 0) // По направлению нормали определяем  
		{                      // передние и задние грани модели
			// рисуем грани и ребра на внешней части модели
			draw_polygon(ctx, plgs[i].vertexes, 1, "Black", colors[i]);  
			
			if (enumeration == true) // Производим нумерацию передних граней модели
			{
				var ind_facets = plgs[i].IndexFacet;
				for(j = 0; j < plgs[i].vertexes.length; j++)
				{
					var num_vertex = ind_facets[j];
					// Для вывода номеров грани на холст используем функцию text из файла canvas2D
					var vertex_enum = roundNumber(num_vertex, 2);
					text(ctx, vertex_enum, plgs[i].vertexes[j], "lt", "dn", "B", "italic 10pt Arial");
				}
			}

			if (x_coord > -100) //  Удостоверяемся, что мышь получила 
			{					// какие-то координаты при перемещении по холсту
								// и только в этом случае следует создать точку point_test
				// point_test - координаты курсора мыши в системе координат WebGeomtry
				var point_test = new Point3D(x_coord, y_coord);
				var rez = PointInPolygon(point_test, i); // курсор мыши находится на на грани модели ???
				if (rez == true)
				{
					index = i; // номер грани на которой находится курсор мыши
					var index_text = "Facet = " + roundNumber(index, 3);
					// номер грани на которой находится курсор мыши отображаем цветом rgb(255, 0, 151)
					ctx.fillStyle = "rgb(255, 0, 151)";
					ctx.fillText(index_text, 30, 40);
					ctx.fillStyle = "#00F"; // устанавливаем исходный цвет
					
					// Обводим ребра выделенной грани цветом rgb(255, 0, 151)
					draw_polygon_line(ctx, plgs[index].vertexes, 3, "rgb(255, 0, 151)", "B");
					
					// Отображаем значения координат именно той точки грани (!!!) на которой находится курсор мыши
					var x_text = roundNumber(x_intersect_facet, 3);
					var y_text = roundNumber(y_intersect_facet, 3);
					var z_text = roundNumber(z_intersect_facet, 3);
					var xyz_text = "x, y, z = (" + x_text + ", " + y_text + ", " + z_text + ")";
					ctx.fillText(xyz_text, 20, 20);
					
//					xyz_text = "(" + x_text + ", " + y_text + ", " + z_text + ")";
//					text1(ctx, xyz_text, new Point2D(x_coord, y_coord), "rt", "mid", "Black", "9px Courier New");
				}
				else
				{	
					index = -1; // курсор мыши НЕ находится на на грани модели
				}
			}
		}	
	}
	if (sizes == true)  //   Если рисуются координатные размеры,
	{					// то пунктирными линиями рисуются ребра на задней части модели.
		// Отрисовка модели на холсте - только ребра - с задней стороны модели
		for (i = 0; i < plgs.length; i++) // цикл по всем граням модели
		{		
			// Первые три точки каждого многоугольника используются для создания двух 3D-векторов.
			var pt0 = new Point3D(plgs[i].vertexes[0][0], plgs[i].vertexes[0][1], plgs[i].vertexes[0][2]);
			var pt1 = new Point3D(plgs[i].vertexes[1][0], plgs[i].vertexes[1][1], plgs[i].vertexes[1][2]);
			var pt2 = new Point3D(plgs[i].vertexes[2][0], plgs[i].vertexes[2][1], plgs[i].vertexes[2][2]);
			
			// Два 3D-вектора
			var vec1 = new Vector3D(pt1[0] - pt0[0], pt1[1] - pt0[1], pt1[02] - pt0[2]);
			var vec2 = new Vector3D(pt2[0] - pt0[0], pt2[1] - pt0[1], pt2[02] - pt0[2]);
			// Векторное произведение vec1 и vec2
			var vecNormal = vec1.Cross(vec2); 
			if (vecNormal[2] < 0) // По направлению нормали определяем передние и задние грани модели
			{                 
				// Рисуем только ребра на задней части модели при помощи пунктирной линии
				draw_polygon_line_dash(ctx, plgs[i].vertexes, 0.5, "rgb(66, 28, 20)");
			}
		}
	}
	
	var angleX_deg = angleX/DEGREE;
	var angleX_text = "angle X = " + roundNumber(angleX_deg, 3) + "°";
	
	var angleY_deg = angleY/DEGREE;
	var angleY_text = "angle Y = " + roundNumber(angleY_deg, 3) + "°";
	
	var angleZ_deg = angleZ/DEGREE;
	var angleZ_text = "angle Z = " + roundNumber(angleZ_deg, 3) + "°";
	
	ctx.fillText(angleX_text, 380, 14);
	ctx.fillText(angleY_text, 380, 32);
	ctx.fillText(angleZ_text, 380, 50);
	
	var x_text = roundNumber(x_coord, 3);
	var y_text = roundNumber(y_coord, 3);
	var xy_text = "x, y = (" + x_text + ", " + y_text + ")";
	ctx.fillText(xy_text, 20, 390);
	
	if (sizes == true)
	{	// наносим размеры модели на канвас
		Draw_FullHeight(matX, matY, matZ);
		Draw_CrownHeight(matX, matY, matZ);
		Draw_PavilionDepth(matX, matY, matZ);
		Draw_Table(matX, matY, matZ);
	}
}

function handleMouseDown(event) 
{
	mouseDown = true; // клавиша мыши нажата
	event.preventDefault();
	elem = document.getElementById('canvas_draw');
	var coords = elem.getBoundingClientRect();	
	
	// пересчет координат мыши к холсту (canvas_draw)
	x_last_mouse = event.clientX - coords.left;
	y_last_mouse = event.clientY - coords.top;
}

function handleMouseUp(event) 
{
	mouseDown = false; // клавиша мыши отжата
}    

function handleMouseMove(event) 
{
	event.preventDefault();
	elem = document.getElementById('canvas_draw');
	var coords = elem.getBoundingClientRect();	
	
	// координаты мыши 	
	var x_mouse, y_mouse;
	
	// координаты мыши на холсте (canvas_draw)
	x_mouse = event.clientX - coords.left;
	y_mouse = event.clientY - coords.top;	
	
	// приводим координаты мыши к WebGeometry
	x_coord = (x_mouse - xC)/SCALE;
	y_coord = (yC - y_mouse)/SCALE;

	if (mouseDown == true) 
	{	// Если мышь нажата, то призводится вращение модели.

		// координаты мыши на холсте пересчитаны 
		// в координаты используемые в webgeometry	
		
		var deltaX = x_mouse - x_last_mouse;
		var deltaY = y_mouse - y_last_mouse;
		
		// Число 100 задает скорость поворота модели.
		angleX = angleX + (x_mouse - x_last_mouse)/100;
		angleY = angleY + (y_mouse - y_last_mouse)/100;
		
		// Не забываем и про отражение значений в панели GUI
		controller.rotationX = angleX/DEGREE;
		controller.rotationY = angleY/DEGREE;
		gui.updateDisplay();	

		// пересчет координат и отображение модели
		recalc();
		draw();
		
		// Запоминаем текущее положение курсора мыши
		x_last_mouse = x_mouse;
		y_last_mouse = y_mouse;
	}
	else
	{	//  Вращение модели не призводится.
		recalc();
		draw();		
	}
}

// Наносим размер модели FullHeight на чертеж (канвас - canvas)
function Draw_FullHeight(matX, matY, matZ)
{
	var i;
	// Расчет нанесенного на чертеж размера FullHeight
	
	// Для отрисовки соответствующих  отрезков понадобятся в общем 
	// случае 6 точек, которые будут определять положение концов отрезков
	// на canvas в системе координат WebGeometry
	// Седьмая точка определит положение текста "Full Height"
	var pts = [7];

	pts[0] = new Point3D(points[0][0], points[0][1], points[0][2]);
	pts[1] = new Point3D(2.2 * points[0][0], 2.2 * points[0][1], points[0][2]);
	
	pts[2] = new Point3D(points[48][0], points[48][1], points[48][2]);
	pts[3] = new Point3D(2.2 * points[0][0], 2.2 * points[0][1], points[48][2]);
	
	pts[4] = new Point3D(2.0 * points[0][0], 2.0 * points[0][1], points[0][2]);
	pts[5] = new Point3D(2.0 * points[0][0], 2.0 * points[0][1], points[48][2]);
	
	pts[6] = new Point3D(pts[4][0], pts[4][1], (pts[4][2] + pts[5][2])/2);
	
	for (i = 0; i < 7; i++) //  Координаты всех семи точек должны быть соответсвующим образом
	{						// отмасштабированы и повернуты на углы angleX, angleY и angleZ.
		pts[i][0] = scale_controller * pts[i][0];
		pts[i][1] = scale_controller * pts[i][1];
		pts[i][2] = scale_controller * pts[i][2];
		
		pts[i] = pts[i].Rotate(matX);
		pts[i] = pts[i].Rotate(matY);
		pts[i] = pts[i].Rotate(matZ);
	}

	csp(ctx, pts[0], 4, "R");  // рисуем точку красным цветом и размером в 4 пикселя
	csp(ctx, pts[2], 4, "R");  // рисуем точку красным цветом и размером в 4 пикселя
	
	csp(ctx, pts[4], 4, "Brown"); // рисуем точку коричневым цветом и размером в 4 пикселя
	csp(ctx, pts[5], 4, "Brown"); // рисуем точку коричневым цветом и размером в 4 пикселя
	
	// Рисуем отрезок сооединяющий точки pts[0] и pts[1] черным цветом линией шириной 0.5
	line_segment(ctx, pts[0], pts[1], 0.5, "Black"); 
	// Рисуем отрезок сооединяющий точки pts[2] и pts[3] черным цветом линией шириной 0.5
	line_segment(ctx, pts[2], pts[3], 0.5, "Black");
	// Рисуем отрезок сооединяющий точки pts[4] и pts[5] красным цветом линией шириной 0.5
	// и стрелками на конце отрезка. Параметр имеющий значение 0.2 масштабирует размер стрелок.
	segment_two_arrow(ctx, pts[4], pts[5], 0.5, 0.2, "Red");
	// Рисуем текст "Full Height" красным цветом. Координаты текста заданы точкой pts[5].
	// "center" и "md" задают положение начала текста относительно pts[5].
	text1(ctx, "Full Height", pts[6], "center", "md", "R")
}

// Crown Height
function Draw_CrownHeight(matX, matY, matZ)
{
	var i;
	// Расчет нанесенного на чертеж размера Crown Height
	var pts = [7];
	var d1 = 0.3
	var d2 = 0.18;
	pts[0] = new Point3D(points[4][0], points[4][1], points[4][2]);
	pts[1] = new Point3D(0.74 * (points[19][0] + points[20][0]), 0.74 * (points[19][1] + points[20][1]), points[4][2]);
	
	pts[2] = new Point3D((points[19][0] + points[20][0])/2, (points[19][1] + points[20][1])/2, points[19][2]);
	pts[3] = new Point3D(0.74 * (points[19][0] + points[20][0]), 0.74 * (points[19][1] + points[20][1]), points[19][2]);
	
	pts[4] = new Point3D(0.7 * (points[19][0] + points[20][0]), 0.7 *(points[19][1] + points[20][1]), points[4][2]);
	pts[5] = new Point3D(0.7 * (points[19][0] + points[20][0]), 0.7 * (points[19][1] + points[20][1]), points[19][2]);
	
	pts[6] = new Point3D(pts[4][0], pts[4][1], (pts[4][2] + pts[5][2])/2);
	
	for (i = 0; i < 7; i++)
	{
		pts[i][0] = scale_controller * pts[i][0];
		pts[i][1] = scale_controller * pts[i][1];
		pts[i][2] = scale_controller * pts[i][2];
		
		pts[i] = pts[i].Rotate(matX);
		pts[i] = pts[i].Rotate(matY);
		pts[i] = pts[i].Rotate(matZ);
	}

	csp(ctx, pts[0], 4, "R");
	csp(ctx, pts[2], 4, "R");
	
	csp(ctx, pts[4], 4, "Brown");
	csp(ctx, pts[5], 4, "Brown");
	
	line_segment(ctx, pts[0], pts[1], 0.5, "Black");
	line_segment(ctx, pts[2], pts[3], 0.5, "Black");
	segment_two_arrow(ctx, pts[4], pts[5], 0.5, 0.2, "Red");	
	text1(ctx, "Crown height", pts[6], "center", "md", "R")
}

// Pavilion depth
function Draw_PavilionDepth(matX, matY, matZ)
{
	var i;
	// Расчет нанесенного на чертеж размера Pavilion depth
	var pts = [7];
	pts[0] = new Point3D((points[27][0] + points[28][0])/2, (points[27][1] + points[28][1])/2, points[27][2]);
	pts[1] = new Point3D(1.6 * (points[27][0] + points[28][0])/2, 1.6 * (points[27][1] + points[28][1])/2, points[27][2]);
	
	pts[2] = new Point3D(points[48][0], points[48][1], points[48][2]);
	pts[3] = new Point3D(1.6 * (points[27][0] + points[28][0])/2, 1.6 * (points[27][1] + points[28][1])/2, points[48][2]);
	
	pts[4] = new Point3D(1.5 * (points[27][0] + points[28][0])/2, 1.5 * (points[27][1] + points[28][1])/2, points[27][2]);
	pts[5] = new Point3D(1.5 * (points[27][0] + points[28][0])/2, 1.5 * (points[27][1] + points[28][1])/2, points[48][2]);
	
	pts[6] = new Point3D(pts[4][0], pts[4][1], (pts[4][2] + pts[5][2])/2);
	
	for (i = 0; i < 7; i++)
	{
		pts[i][0] = scale_controller * pts[i][0];
		pts[i][1] = scale_controller * pts[i][1];
		pts[i][2] = scale_controller * pts[i][2];
		
		pts[i] = pts[i].Rotate(matX);
		pts[i] = pts[i].Rotate(matY);
		pts[i] = pts[i].Rotate(matZ);
	}

	csp(ctx, pts[0], 4, "R");
	csp(ctx, pts[2], 4, "R");
	
	csp(ctx, pts[4], 4, "Brown");
	csp(ctx, pts[5], 4, "Brown");
	
	line_segment(ctx, pts[0], pts[1], 0.5, "Black");
	line_segment(ctx, pts[2], pts[3], 0.5, "Black");
	segment_two_arrow(ctx, pts[4], pts[5], 0.5, 0.2, "Red");	
	text1(ctx, "Pav. depth", pts[6], "center", "md", "R")
}

// Table
function Draw_Table(matX, matY, matZ)  // 0, 4
{
	var i;
	// Расчет нанесенного на чертеж размера table
	var pts = [7];
	pts[0] = new Point3D(points[0][0], points[0][1], points[0][2]);
	pts[1] = new Point3D(points[0][0], points[0][1], points[0][2] + 0.15);
	
	pts[2] = new Point3D(points[4][0], points[4][1], points[2][2]);
	pts[3] = new Point3D(points[4][0], points[4][1], points[2][2] + 0.15);
	
	pts[4] = new Point3D(points[0][0], points[0][1], points[0][2] + 0.13);
	pts[5] = new Point3D(points[4][0], points[4][1], points[2][2] + 0.13);
	
	pts[6] = new Point3D((pts[0][0] + pts[2][0])/2, (pts[0][1] + pts[2][1])/2, (pts[4][2] + pts[5][2])/2);
	
	for (i = 0; i < 7; i++)
	{
		pts[i][0] = scale_controller * pts[i][0];
		pts[i][1] = scale_controller * pts[i][1];
		pts[i][2] = scale_controller * pts[i][2];
		
		pts[i] = pts[i].Rotate(matX);
		pts[i] = pts[i].Rotate(matY);
		pts[i] = pts[i].Rotate(matZ);
	}

	csp(ctx, pts[0], 4, "R");
	csp(ctx, pts[2], 4, "R");
	
	csp(ctx, pts[4], 4, "Brown");
	csp(ctx, pts[5], 4, "Brown");
	
	line_segment(ctx, pts[0], pts[1], 0.5, "Black");
	line_segment(ctx, pts[2], pts[3], 0.5, "Black");
	segment_two_arrow(ctx, pts[4], pts[5], 0.5, 0.2, "Red");	
	text1(ctx, "Table", pts[6], "center", "up", "R")
}