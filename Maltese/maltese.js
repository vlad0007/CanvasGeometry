// maltese.js

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

// scale_controller_controller - коэффициент масштабирования размеров модели. Он задается в dat.GUI.
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
var color = "#55ffff";

function maltese()
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
		this.r = r;
		this.rounnd_cir1 = rounnd_cir1;
		this.rounnd_cir2 = rounnd_cir2;
		this.R3 = R3;
		this.ang_2 = ang_2 / DEGREE;
		this.ang_3 = ang_3 / DEGREE;
		this.ang_corner = ang_corner / DEGREE;
		this.gd_segments = gd_segments;

		this.beta = beta / DEGREE;
		this.t = t;
		this.starFacets = starFacets;
		
		this.hCrown = Math.tan(beta) * (1 - t) / 2;
		this.hCrown2 = Math.tan(beta) * (1 - t) / 2;

		this.hp1 = hp1;
		this.hp2 = hp2;
		this.del_hp1 = del_hp1;
		this.pav_ang_a = pav_ang_a / DEGREE;
		this.pav_ang_c = pav_ang_c / DEGREE;
		this.pav_ang_b = pav_ang_b / DEGREE;
		this.hA0 = hA0;
		this.hA1 = hA1;

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
	f1.add(controller, 'rounnd_cir1', 0.02, 0.4).onChange( function() 
	{
		var temp = rounnd_cir1;
		rounnd_cir1 = controller.rounnd_cir1;
		recalc();
		if (isCorrect() == -1) 
		{
		   rounnd_cir1 = temp;
		   recalc();
		}
		draw();
		controller.rounnd_cir1 = rounnd_cir1;
		gui.updateDisplay();
	});
	f1.add(controller, 'rounnd_cir2', 0.02, 0.4).onChange( function() 
	{
		var temp = rounnd_cir2;
		rounnd_cir2 = controller.rounnd_cir2;
		recalc();
		if (isCorrect() == -1) 
		{
		   rounnd_cir2 = temp;
		   recalc();
		}
		draw();
		controller.rounnd_cir2 = rounnd_cir2;
		gui.updateDisplay();
	});
	f1.add(controller, 'R3', 0.005, 0.4).onChange( function() 
	{
		var temp = R3;
		R3 = controller.R3;
		recalc();
		if (isCorrect() == -1) 
		{
		   R3 = temp;
		   recalc();
		}
		draw();
		controller.R3 = R3;
		gui.updateDisplay();
	});
	f1.add(controller, 'ang_2', 5, 95).onChange( function() 
	{
		var temp = ang_2;
		ang_2 = (controller.ang_2) * DEGREE;
		recalc();
		if (isCorrect() == -1) 
		{
		   ang_2 = temp;
		   recalc();
		}
		draw();
		controller.ang_2 = ang_2 / DEGREE;
		gui.updateDisplay();
	});
	f1.add(controller, 'ang_3', 5, 95).onChange( function() 
	{
		var temp = ang_3;
		ang_3 = (controller.ang_3) * DEGREE;
		recalc();
		if (isCorrect() == -1) 
		{
		   ang_3 = temp;
		   recalc();
		}
		draw();
		controller.ang_3 = ang_3 / DEGREE;
		gui.updateDisplay();
	});
	f1.add(controller, 'ang_corner', 40, 50).onChange( function() 
	{
		var temp = ang_corner;
		ang_corner = (controller.ang_corner) * DEGREE;
		recalc();
		if (isCorrect() == -1) 
		{
		   ang_corner = temp;
		   recalc();
		}
		draw();
		controller.ang_corner = ang_corner / DEGREE;
		gui.updateDisplay();
	});
	f1.add(controller, 'gd_segments', 0.0001, 0.5).onChange( function() 
	{
		var temp = gd_segments;
		gd_segments = controller.gd_segments;
		recalc();
		if (isCorrect() == -1) 
		{
		   gd_segments = temp;
		   recalc();
		}
		draw();
		controller.gd_segments = gd_segments;
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
	
    f2.add(controller, 'hCrown', 0.01, 0.9).onChange( function() 
	{
		var temp = t;
		hCrown = controller.hCrown;
		var h = Math.tan(beta);
		t = 1 - 2 * hCrown / h;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   t = temp;
		   recalc();
	    }
		draw();
		controller.t = t;
		controller.hCrown = Math.tan(beta) * (1 - t) / 2
		controller.hCrown2 = hCrown;
		gui.updateDisplay();
    });	
	
    f2.add(controller, 'hCrown2', 0.01, 0.9).onChange( function() 
	{
		var temp = beta;
		hCrown2 = controller.hCrown2;
		
		beta = Math.atan2(hCrown2, 0.5 - t/2);
		
		recalc();
	    if (isCorrect() == -1) 
	    {
		   beta = temp;
		   recalc();
	    }
		draw();
		controller.beta = beta / DEGREE;
		controller.hCrown2 = Math.tan(beta) * (1 - t) / 2;
		controller.hCrown = hCrown2;
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
		controller.hCrown = Math.tan(beta) * (1 - t) / 2;
		controller.hCrown2 = Math.tan(beta) * (1 - t) / 2;
		gui.updateDisplay();
    });	
    f2.add(controller, 'starFacets', 0.1, 0.9).onChange( function() 
	{
		var temp = starFacets;
		starFacets = controller.starFacets;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   starFacets = temp;
		   recalc();
	    }
		draw();
		controller.starFacets = starFacets;
		gui.updateDisplay();
    });	
	// Павильон
	var f3 = gui.addFolder('Pavilion');
	
    f3.add(controller, 'pav_ang_a', 10.0, 88.0).onChange( function() 
	{
		var temp = pav_ang_a;
		pav_ang_a = (controller.pav_ang_a) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   pav_ang_a = temp;
		   recalc();
	    }
		draw();
		controller.pav_ang_a = pav_ang_a / DEGREE;
		gui.updateDisplay();
    });
    f3.add(controller, 'pav_ang_b', 10.0, 88.0).onChange( function() 
	{
		var temp = pav_ang_b;
		pav_ang_b = (controller.pav_ang_b) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   pav_ang_b = temp;
		   recalc();
	    }
		draw();
		controller.pav_ang_b = pav_ang_b / DEGREE;
		gui.updateDisplay();
    });
    f3.add(controller, 'pav_ang_c', 10.0, 88.0).onChange( function() 
	{
		var temp = pav_ang_c;
		pav_ang_c = (controller.pav_ang_c) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   pav_ang_c = temp;
		   recalc();
	    }
		draw();
		controller.pav_ang_c = pav_ang_c / DEGREE;
		gui.updateDisplay();
    });
    f3.add(controller, 'hp1', 0.05, 0.7).onChange( function() 
	{
		var temp = hp1;
		hp1 = controller.hp1;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   hp1 = temp;
		   recalc();
	    }
		draw();
		controller.hp1 = hp1;
		gui.updateDisplay();
    });

    f3.add(controller, 'hp2', 0.005, 0.2).onChange( function() 
	{
		var temp = hp2;
		hp2 = controller.hp2;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   hp2 = temp;
		   recalc();
	    }
		draw();		
		controller.hp2 = hp2;
		gui.updateDisplay();
    });
	
    f3.add(controller, 'del_hp1', 0.0, 0.05).onChange( function() 
	{
		var temp = del_hp1;
		del_hp1 = controller.del_hp1;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   del_hp1 = temp;
		   recalc();
	    }
		draw();
		controller.del_hp1 = del_hp1;
		gui.updateDisplay();
    });
    f3.add(controller, 'hA0', 0.01, 0.3).onChange( function() 
	{
		var temp = hA0;
		hA0 = controller.hA0;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   hA0 = temp;
		   recalc();
	    }
		draw();
		controller.hA0 = hA0;
		gui.updateDisplay();
    });	
    f3.add(controller, 'hA1', 0.01, 0.3).onChange( function() 
	{
		var temp = hA1;
		hA1 = controller.hA1;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   hA1 = temp;
		   recalc();
	    }
		draw();
		controller.hA1 = hA1;
		gui.updateDisplay();
    });	
	
	gui.add( controller, 'correct', true ).onChange( function() 
	{
		correct = controller.correct; 
		if (correct == true)
		{
			lw = 1.0;           // Отношение длины огранки к ширине
			// Рундист
			r = 0.040;          // Толщина рундиста
			// Для следующих трех полей в dat.GUI не будем вводить параметры
			del_gd_1 = 0.013;   // изменяет глубину рундиста в его вершинах g64, g80 ...
			del_gd_2 = 0.004;   // изменяет глубину рундиста в его вершинах g72, g88 ...
			del_gd_3 = -0.003;  // изменяет глубину рундиста в его вершинах g68, g76 ...
			// Форма рундиста задается точно также как в Girdle1_A.html и Girdle1_B.html
			rounnd_cir1 = 0.114;        // "Roundness front"
			rounnd_cir2 = 0.114;        // "Roundness flank"
			R3 = 0.034;                 // "Radius corner"
			// Расстановка вершин на рундисте задается также как в Girdle1_B.html
			ang_2 = 38*DEGREE;          // "Front angle girdle"
			ang_3 = 38*DEGREE;          // "Flank angle girdle"
			ang_corner = 45.0*DEGREE;   // "Corner angle girdle"
			gd_segments = 0.18;         // Основной параметр задающий размеры сегментов
			// Корона
			beta = 35*DEGREE;         // Угол наклона короны к горизонтальной плоскости
			t = 0.60;                 // Размер площадки
			starFacets = 0.5;         // Star facets
			// Павильон
			hp1 = 0.32;               //"Ht.pav.level 1"
			hp2 = 0.163;              //"Ht.pav.level 2"
			del_hp1 = 0.020;           // "Del.ht.level 1"
			pav_ang_a = 54*DEGREE;    // Угол наклона грани a павильона
			pav_ang_b = 41.9*DEGREE;  // Угол наклона грани b павильона
			pav_ang_c = 54*DEGREE;    // Угол наклона грани c павильона
			hA0 = 0.192;              // Высота центральных вершины на гранях a и b 
			hA1 = 0.09;               // Высота боковых вершины на гранях a, b и c			

			controller.lw = lw;
			controller.r = r;
			controller.rounnd_cir1 = rounnd_cir1;
			controller.rounnd_cir2 = rounnd_cir2;
			controller.R3 = R3;
			controller.ang_2 = ang_2 / DEGREE;
			controller.ang_3 = ang_3 / DEGREE;
			controller.ang_corner = ang_corner / DEGREE;
			controller.gd_segments = gd_segments;

			controller.beta = beta / DEGREE;
			controller.t = t;
			controller.starFacets = starFacets;
			
			controller.hCrown = Math.tan(beta) * (1 - t) / 2;
			controller.hCrown2 = Math.tan(beta) * (1 - t) / 2;

			controller.hp1 = hp1;
			controller.hp2 = hp2;
			controller.del_hp1 = del_hp1;
			controller.pav_ang_a = pav_ang_a / DEGREE;
			controller.pav_ang_c = pav_ang_c / DEGREE;
			controller.pav_ang_b = pav_ang_b / DEGREE;
			controller.hA0 = hA0;
			controller.hA1 = hA1;
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
