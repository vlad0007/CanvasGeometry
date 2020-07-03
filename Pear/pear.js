// pear.js

var colors = [];    // массив в котором хранятся цвета граней
var points = [];    // массив для хранения вершин всех полигонов в виде Point3D

var elem; // ссылка на элемент canvas_draw
var ctx; // контекст рисования на холсте

var gui;
var controller;
var index = -1;  // индекс (номер) грани (фасеты)

// Исходные углы задающие положении модели
var angleX = 50*DEGREE;
var angleY = 40*DEGREE;
var angleZ = 10*DEGREE;

// scale_controller - коэффициент масштабирования размеров модели. Он задается в dat.GUI.
// Изначальный коэффициент масштабирования задается значением SCALE.
var scale_controller = 1.0;

var lighting = false; // для включения/выключения света (да/нет)

var enumeration = false; // для переключателя отображения номеров вершин модели (да/нет)

var correct = true; // включает/выключает проверку корректности построения модели огранки

var mouseDown = false;
var x_last_mouse = 0;
var y_last_mouse = 0;

var mouseDown = false;
var x_last_mouse = 0;
var y_last_mouse = 0;

var x_coord = -100; //   Значения координат (в единицах WebGeometry) 
var y_coord = -100; // положения курсора мыши на холсте.

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

function pear()
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
	// xC и yC задают центральную точку на плоскости OXY (на канвасе)
	xC = elem.width / 2;
	yC = elem.height / 2;
	
	// Расчет координат вершин 3D модели.
	recalc();
	// Вывод модели на экран
	draw();

	elem.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	elem.onmousemove = handleMouseMove;

    controller = new function() 
	{
		this.lw = lw;
		// Рундист
		this.r = r;
		this.vp = vp;
		this.Lh = Lh;

		// Корона
		this.beta = beta / DEGREE;
		this.t = t;
		this.vLh = vLh;
		this.dSquare = dSquare;

		// Павильон
		this.hp = hp;
		this.hPavFacet = hPavFacet;
		this.CuletX = CuletX;
		this.CuletY = CuletY;
	  
		// Углы рундиста
		this.DelAngGirdle_4 = DelAngGirdle_4 / DEGREE;
		this.DelAngGirdle_8 = DelAngGirdle_8 / DEGREE;
		this.DelAngGirdle_12 = DelAngGirdle_12 / DEGREE;
		this.DelAngGirdle_16 = DelAngGirdle_16 / DEGREE;
		this.DelAngGirdle_20 = DelAngGirdle_20 / DEGREE;
	    this.DelAngGirdle_24 = DelAngGirdle_24 / DEGREE;
		this.DelAngGirdle_28 = DelAngGirdle_28 / DEGREE;

		this.rotationX = angleX/DEGREE;
		this.rotationY = angleY/DEGREE;
		this.rotationZ = angleZ/DEGREE;
		this.scale_controller = scale_controller;
		this.lighting = false;
		this.brightness = 0.9;
		this.transparent = ctx.globalAlpha;
		this.color = color;		
		this.enumeration = false;
		this.correct = true;
    }();
	
	// Создаем новый объект dat.GUI.
	gui = new dat.GUI({ autoPlace: false });
	gui.domElement.id = 'gui';
	gui_container.appendChild(gui.domElement);
	
	gui.add( controller, 'lighting', false ).onChange( function() 
	{
		lighting = controller.lighting; 
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
		ctx.font = "italic 10pt Arial";
		ctx.fillStyle = '#0000ff';
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
		ctx.font = "italic 10pt Arial";
		ctx.fillStyle = '#0000ff';
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
		ctx.font = "italic 10pt Arial";
		ctx.fillStyle = '#0000ff';
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
    f1.add(controller, 'lw', 0.3, 4.0).onChange( function() 
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
    f1.add(controller, 'r', 0.0001, 0.5).onChange( function() 
	{
		var temp = r;
		r = controller.r;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   r = temp;
		   recalc();
	    }
		draw();
		gui.updateDisplay();
	});
    f1.add(controller, 'vp', -10, 20).onChange( function() 
	{
		var temp = vp;
		vp = (controller.vp) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   vp = temp;
		   recalc();
	    }
		draw();
		controller.vp = vp / DEGREE;
		gui.updateDisplay();
	});
    f1.add(controller, 'Lh', 0.0001, 0.5).onChange( function() 
	{
		var temp = Lh;
		Lh = controller.Lh;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   Lh = temp;
		   recalc();
	    }
		draw();
		gui.updateDisplay();
	});

	// Корона
    var f2 = gui.addFolder('Crown');
    f2.add(controller, 'beta', 10, 80).onChange( function() 
	{
		var temp = beta;
		beta = (controller.beta) * DEGREE;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   beta = temp;
		   recalc();
	    }
		draw();		
		controller.beta = beta / DEGREE;
		gui.updateDisplay();
	});	
	
    f2.add(controller, 't', 0.01, 0.9).onChange( function() 
	{
		var temp = t;
		t = controller.t;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   t = temp;
		   recalc();
	    }
		draw();
		controller.t = t;
		gui.updateDisplay();
    });

    f2.add(controller, 'dSquare', -0.5, 0.5).onChange( function() 
	{
		var temp = dSquare;
		dSquare = controller.dSquare;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   dSquare = temp;
		   recalc();
	    }
		draw();
		controller.dSquare = dSquare;
		//controller.starFacet = star_facets;
		gui.updateDisplay();
    });	
	
    f2.add(controller, 'vLh', -1.0, 1.0).onChange( function() 
	{
		var temp = vLh;
		vLh = controller.vLh;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   vLh = temp;
		   recalc();
	    }
		draw();		
		controller.vLh = vLh;
		gui.updateDisplay();
    });
	// Павильон
	var f3 = gui.addFolder('Pavilion');

    f3.add(controller, 'hp', 0.1, 1.0).onChange( function() 
	{
		var temp = hp;
		hp = controller.hp;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   hp = temp;
		   recalc();
	    }
		draw();
		controller.hp = hp;
		gui.updateDisplay();
    });

    f3.add(controller, 'hPavFacet', 0.1, 0.95).onChange( function() 
	{
		var temp = hPavFacet;
		hPavFacet = controller.hPavFacet;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   hPavFacet = temp;
		   recalc();
	    }
		draw();
		controller.hPavFacet = hPavFacet;
		gui.updateDisplay();
    });

    f3.add(controller, 'CuletX', -0.3, 0.3).onChange( function() 
	{
		var temp = CuletX;
		CuletX = controller.CuletX;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   CuletX = temp;
		   recalc();
	    }
		draw();
		controller.CuletX = CuletX;
		gui.updateDisplay();
    });
	
    f3.add(controller, 'CuletY', -0.3, 0.3).onChange( function() 
	{
		var temp = CuletX;
		CuletY = controller.CuletY;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   CuletY = temp;
		   recalc();
	    }
		draw();
		controller.CuletY = CuletY;
		gui.updateDisplay();
    });

	var f4 = gui.addFolder('Advanced setting');
    f4.add(controller, 'DelAngGirdle_4', -10.0, 10.0).onChange( function() 
	{
		var temp = DelAngGirdle_4;
		DelAngGirdle_4 = (controller.DelAngGirdle_4) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   DelAngGirdle_4 = temp;
		   recalc();
	    }
		draw();
		controller.DelAngGirdle_4 = DelAngGirdle_4 / DEGREE;
		gui.updateDisplay();
    });
	
    f4.add(controller, 'DelAngGirdle_8', -10.0, 10.0).onChange( function() 
	{
		var temp = DelAngGirdle_8;
		DelAngGirdle_8 = (controller.DelAngGirdle_8) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   DelAngGirdle_8 = temp;
		   recalc();
	    }
		draw();
		controller.DelAngGirdle_8 = DelAngGirdle_8 / DEGREE;
		gui.updateDisplay();
    });
	
    f4.add(controller, 'DelAngGirdle_12', -10.0, 10.0).onChange( function() 
	{
		var temp = DelAngGirdle_12;
		DelAngGirdle_12 = (controller.DelAngGirdle_12) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   DelAngGirdle_12 = temp;
		   recalc();
	    }
		draw();
		controller.DelAngGirdle_12 = DelAngGirdle_12 / DEGREE;
		gui.updateDisplay();
    });

    f4.add(controller, 'DelAngGirdle_16', -10.0, 10.0).onChange( function() 
	{
		var temp = DelAngGirdle_16;
		DelAngGirdle_16 = (controller.DelAngGirdle_16) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   DelAngGirdle_16 = temp;
		   recalc();
	    }
		draw();
		controller.DelAngGirdle_16 = DelAngGirdle_16 / DEGREE;
		gui.updateDisplay();
    });
	
    f4.add(controller, 'DelAngGirdle_20', -10.0, 10.0).onChange( function() 
	{
		var temp = DelAngGirdle_20;
		DelAngGirdle_20 = (controller.DelAngGirdle_20) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   DelAngGirdle_20 = temp;
		   recalc();
	    }
		draw();
		controller.DelAngGirdle_20 = DelAngGirdle_20 / DEGREE;
		gui.updateDisplay();
    });
	
    f4.add(controller, 'DelAngGirdle_24', -10.0, 10.0).onChange( function() 
	{
		var temp = DelAngGirdle_24;
		DelAngGirdle_24 = (controller.DelAngGirdle_24) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   DelAngGirdle_24 = temp;
		   recalc();
	    }
		draw();
		controller.DelAngGirdle_24 = DelAngGirdle_24 / DEGREE;
		gui.updateDisplay();
    });

    f4.add(controller, 'DelAngGirdle_28', -10.0, 10.0).onChange( function() 
	{
		var temp = DelAngGirdle_28;
		DelAngGirdle_28 = (controller.DelAngGirdle_28) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   DelAngGirdle_28 = temp;
		   recalc();
	    }
		draw();
		controller.DelAngGirdle_28 = DelAngGirdle_28 / DEGREE;
		gui.updateDisplay();
    });
	
	gui.add( controller, 'correct', true ).onChange( function() 
	{
		correct = controller.correct; 
		if (correct == true)
		{
			lw = 1.5;           // Отношение длины огранки к ее ширине 

			// Форма и толщиа рундиста
			r = 0.04;            // Толщина рундиста
			vp = 0.000010; // Угол, определяющий величину отклонения кривой от окружности
			Lh = 0.34;           // отклонение смещения самого широкого места рундиста 
			square_deviation = 0;  // степень отклонения рундиста от эллипса

			// Корона
			beta = 35*DEGREE;         // Угол короны
			t = 0.6;            // Ширина площадки
			dSquare = 0.00001;      // Задает положение средних вершин короны.vLh = 0.00001;          // определяет смещение центральной точки огранки

			// Павильон
			hp = 0.44;          // Задает глубину павильона
			hPavFacet = 0.8;	// Определяет положение нижних вершин клиньев павильона
			CuletX = 0.00001;	    // смещение калетты вдоль оси X
			CuletY = 0.00001;      // смещение калетты по оси Y

			// Следующие параметры задают положение узловых вершин на рундисте
			DelAngGirdle_4 = 0;
			DelAngGirdle_8 = 0.0*DEGREE;
			DelAngGirdle_12 = 0.0*DEGREE;
			DelAngGirdle_16 = -2.0*DEGREE;
			DelAngGirdle_20 = 0.0*DEGREE;
			DelAngGirdle_24 = 0.0*DEGREE;
			DelAngGirdle_28 = 0.0*DEGREE;

			controller.lw = lw;
			// Рундист
			controller.r = r;
			controller.vp = vp;
			controller.Lh = Lh;

			// Корона
			controller.beta = beta / DEGREE;
			controller.t = t;
			controller.vLh = vLh;
			controller.dSquare = dSquare;

			// Павильон
			controller.hp = hp;
			controller.hPavFacet = hPavFacet;
			controller.CuletX = CuletX;
			controller.CuletY = CuletY;
		  
			// Углы рундиста
			controller.DelAngGirdle_4 = DelAngGirdle_4 / DEGREE;
			controller.DelAngGirdle_8 = DelAngGirdle_8 / DEGREE;
			controller.DelAngGirdle_12 = DelAngGirdle_12 / DEGREE;
			controller.DelAngGirdle_16 = DelAngGirdle_16 / DEGREE;
			controller.DelAngGirdle_20 = DelAngGirdle_20 / DEGREE;
			controller.DelAngGirdle_24 = DelAngGirdle_24 / DEGREE;
			controller.DelAngGirdle_28 = DelAngGirdle_28 / DEGREE;			
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
		vec1 = new Vector3D(pt1[0] - pt0[0], pt1[1] - pt0[1], pt1[02] - pt0[2]);
		vec2 = new Vector3D(pt2[0] - pt0[0], pt2[1] - pt0[1], pt2[02] - pt0[2]);
		// Векторное произведение
		vecNormal = vec1.Cross(vec2); 
		
		if (vecNormal[2] >= 0) // По направлению нормали определяем  
		{                      // передние и задние грани модели
			// рисуем грани
			if (lighting == true)
			{
				vecNormal.Normer();
				var scal = lightVector.Dot(vecNormal);
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
			
			if (enumeration == true) // Производим нумерацию передних граней
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
			if (x_coord > -100)
			{
				var point = new Point3D(x_coord, y_coord);
				var rez = PointInPolygon(point, i);
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
					index = -1;
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
	mouseDown = true;
	event.preventDefault();
	elem = document.getElementById('canvas_draw');
	var coords = elem.getBoundingClientRect();	
	
	x_last_mouse = event.clientX - coords.left;
	y_last_mouse = event.clientY - coords.top;
}

function handleMouseUp(event) 
{
	mouseDown = false;
}    

function handleMouseMove(event) 
{
	event.preventDefault();
	elem = document.getElementById('canvas_draw');
	var coords = elem.getBoundingClientRect();	
	
	// координаты мыши 	
	var x_mouse, y_mouse;
	
	x_mouse = event.clientX - coords.left;
	y_mouse = event.clientY - coords.top;	
	
	x_coord = (x_mouse - xC)/SCALE;
	y_coord = (yC - y_mouse)/SCALE;

	if (mouseDown == true) 
	{
		// координаты мыши на холсте пересчитаны 
		// в координаты используемые в webgeometry	
		
		var deltaX = x_mouse - x_last_mouse;
		var deltaY = y_mouse - y_last_mouse;
		
		angleX = angleX + (x_mouse - x_last_mouse)/100;
		angleY = angleY + (y_mouse - y_last_mouse)/100;
		
		controller.rotationX = angleX/DEGREE;
		controller.rotationY = angleY/DEGREE;
		gui.updateDisplay();	

		recalc();
		draw();
		
		x_last_mouse = x_mouse;
		y_last_mouse = y_mouse;
	}
	else
	{	
		recalc();
		draw();		
	}
}
