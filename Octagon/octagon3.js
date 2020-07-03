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

var enumeration = false; // для переключателя отображения номеров вершин модели (да/нет)

var lighting = true; // для включения/выключения света (да/нет)

var correct = true; // включает/выключает проверку корректности построения модели огранки

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

// Направление света
var lightVector = new Vector3D(0.0, 0.0, 1.0);
lightVector.Normer();

// "яркость" света
var brightness = 0.9;

// цвет граней
var color = "#eeeeff";

var text;

function octagon()
{
	elem = document.getElementById('canvas_draw'); // получаем ссылку на элемент canvas_draw 
	elem.style.position = "relative";
	elem.style.border = "1px solid";
	ctx = elem.getContext("2d"); // получаем 2D-контекст рисования на холсте
	
	ctx.font = "italic 10pt Arial";
	ctx.fillStyle = '#0000ff';
	ctx.globalAlpha = 1.0;
	
	// SCALE задает ИСХОДНЫЙ масштаб при рисовании проекции модели на плоскость OXY
	SCALE = 320;
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
		this.lighting = true;
		this.brightness = 0.9;
		this.transparent = ctx.globalAlpha;
		this.color = color;
		this.enumeration = false;
		this.correct = true;
    }();
	
	// Создаем новый объект dat.GUI с правой стороны от canvas.
	// В dat.GUI будут отображаться значения параметров модели, углы поворота модели и т.д.
	gui = new dat.GUI({ autoPlace: false });
	gui.domElement.id = 'gui';
	gui_container.appendChild(gui.domElement);
	
	gui.add( controller, 'lighting', false ).onChange( function() 
	{
		lighting = controller.lighting; 
		if (lighting == true)
		{
			ctx.globalAlpha = 0.75;
		}
		else
		{
			ctx.globalAlpha = 1.0;
		}
		recalc();
		draw();
	});
	
	gui.add( controller, 'brightness', 0.0, 1.0 ).onChange( function() 
	{
		var temp = brightness;
		if (lighting == false)
		{
			controller.brightness = temp;
			gui.updateDisplay();
			return;
		}
		brightness = controller.brightness; 
		recalc();
		draw();
	});
	
	gui.add(controller, 'transparent', 0.0, 1.0 ).onChange(function()
	{
		var temp = ctx.globalAlpha;
		if (lighting == false)
		{
			controller.transparent = temp;
			gui.updateDisplay();
			return;
		}
		ctx.globalAlpha = controller.transparent;
		recalc();
		draw();
	});	
	
	gui.addColor(controller, 'color' ).onChange(function()
	{
		var temp = color;
		if (lighting == false)
		{
			controller.color = temp;
			gui.updateDisplay();
			return;
		}
		color = controller.color;
		recalc();
		draw();
	});
	
	gui.add( controller, 'enumeration', false ).onChange( function() 
	{
		enumeration = controller.enumeration; 
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
	
	gui.add( controller, 'correct', true ).onChange( function() 
	{
		correct = controller.correct; 
		if (correct == true)
		{
			// Рундист
			lw = 1.0;      // отношение длина/ширина
			r = 0.1;       // высота рундиста
			corner_break_ratio = 0.55;
			corner_break_angle = 45*DEGREE;

			// Корона
			hCrown = 0.16;	// Высота верхней части короны
			t = 0.3;		// размер площадки
			angle_B0 = 45*DEGREE;	// верхний угол короны (для передней и боковой грани) B0 - angle_B0
			angle_B1 = 35*DEGREE;	// верхний угол короны (для угловой грани) // B7 - angle_B1
			angle_A0 = 53*DEGREE;    // нижний угол короны (одинаковый для всех граней)
			H2H = 0.5;	// Отношение высоты нижней части короны ко всей ее высоте

			// Павильон
			hp = 0.62;		// Высота павильона
			angle_C0 = 65*DEGREE;	// Угол наклона грани A
			angle_C1 = 65*DEGREE;	// Угол наклона грани B
			angle_C2 = 65*DEGREE;	// Угол наклона грани C
			hLowerFacet = 0.5;	// Отношение высоты LowerFacet к hp
			hMiddleFacet = 0.2;	// Отношение высоты MiddleFacet к hp

			controller.lw = lw;
			controller.r = r;
			controller.corner_br_ratio = corner_break_ratio;
			controller.corner_br_angle = corner_break_angle / DEGREE;   // перевели в градусы;

			controller.hCrown = hCrown;
			controller.angle_B0 = angle_B0 / DEGREE;	// верхний угол короны
			controller.angle_B1 = angle_B1 / DEGREE;	// верхний угловой угол короны
			controller.angle_A0 = angle_A0 / DEGREE;  // нижний угол короны
			controller.H2H = H2H;		  

			controller.hp = hp;    // глубина павильона
			controller.angle_C0 = angle_C0 / DEGREE;	// Угол наклона грани A
			controller.angle_C1 = angle_C1 / DEGREE;	// Угол наклона грани B
			controller.angle_C2 = angle_C2 / DEGREE;	// Угол наклона грани C
			controller.hLowerFacet = hLowerFacet;	    // Отношение высоты LowerFacet к hp
			controller.hMiddleFacet = hMiddleFacet;	// Отношение высоты MiddleFacet к hp			
		}
		gui.updateDisplay();
		recalc();
		draw();
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
	var hhhh = 444;
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
		// Векторное произведение - нормаль грани
		var vecNormal = vec1.Cross(vec2); 
		
		if (vecNormal[2] >= 0) // По направлению нормали определяем  
		{                      // передние и задние грани модели
			// освещение включено
			if (lighting == true)
			{
				vecNormal.Normer();
				// scal - косинус угла между векторами lightVector и vecNormal
				var scal = lightVector.Dot(vecNormal);
				// lightFactor - яркость грани
				var lightFactor = brightness * scal;
				
				// От цвета отбрасываем решетку # ( #eeeeff => eeeeff )
				var tcol = color.slice(1);
				// col - целое число в системе счисления с основанием 16
				var col = parseInt(tcol, 16);
				
				// Новые  R, G, B - компоненты цвета с учетом lightFactor
				var red = (col >> 16) * lightFactor;
				var green = (col >> 8 & 0xff) * lightFactor;
				var blue = (col & 0xff) * lightFactor;
				
				// Формируем строку соответствующую новому цвету 
				col = '#' + ('00000' + ((red << 16 | green << 8 | blue) | 0).toString(16)).substr(-6);
				
				// Рисуем многоугольник без окаймления (width < 0)
				draw_polygon(ctx, plgs[i].vertexes, -1, col, col);
			}
			else
			{
				// рисуем грани и ребра на внешней части модели
				draw_polygon(ctx, plgs[i].vertexes, 1, "Black", colors[i]);  
			}
			
			if (enumeration == true) // Производим нумерацию передних граней модели
			{
				var ind_facets = plgs[i].IndexFacet;
				for(j = 0; j < plgs[i].vertexes.length; j++)
				{
					var num_vertex = ind_facets[j];
					// Для вывода номеров грани на холст используем функцию text из файла canvas2D
					var vertex_enum = roundNumber(num_vertex, 2);
					text(ctx, vertex_enum, plgs[i].vertexes[j], "lt", "dn", "B", "12px Arial");
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
					if (lighting == true)
					{
						draw_polygon_line(ctx, plgs[index].vertexes, 1, "rgb(255, 0, 151)", "B");
					}
					else
					{
						draw_polygon_line(ctx, plgs[index].vertexes, 3, "rgb(255, 0, 151)", "B");
					}
					
					// Отображаем значения координат именно той точки грани (!!!) на которой находится курсор мыши
					var x_text = roundNumber(x_intersect_facet, 3);
					var y_text = roundNumber(y_intersect_facet, 3);
					var z_text = roundNumber(z_intersect_facet, 3);
					var xyz_text = "x, y, z = (" + x_text + ", " + y_text + ", " + z_text + ")";
					ctx.fillText(xyz_text, 20, 20);
				}
				else
				{	
					index = -1; // курсор мыши НЕ находится на на грани модели
				}
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
