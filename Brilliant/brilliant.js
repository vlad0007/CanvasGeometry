// brilliant.js

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
var brightness = 0.95;

// цвет граней
var color = "#bb88ff";

function brilliant()
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
		this.square_deviation = square_deviation;

		this.beta = beta / DEGREE;
		this.t = t;
		this.dSquare = dSquare;
		this.star_facets = star_facets;

		this.alpha = alpha / DEGREE;
		this.hPavFacet = hPavFacet;
		this.culet = culet;
		this.culet_R = culet_R;
		this.culet_A = culet_A / DEGREE;
		this.low_az = low_az / DEGREE;
		this.up_az = up_az / DEGREE;

		this.hCrown = Math.tan(beta) * (1 - t) / 2;
		this.beta_hCrownFix = beta / DEGREE;
		this.hPavilion = Math.tan(alpha) * (1 - culet) / 2;
		this.full_height = r + Math.tan(alpha) * (1 - culet) / 2 + Math.tan(beta) * (1 - t) / 2;

		this.culet_offsetX = culet_R * Math.cos(culet_A);
		this.culet_offsetY = - culet_R * Math.sin(culet_A);
		
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
			ctx.globalAlpha = 0.6;
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
    f1.add(controller, 'square_deviation', -1, 1).onChange( function() 
	{
		var temp = square_deviation;
		square_deviation = controller.square_deviation;
		recalc();
	    if (isCorrect() == -1) 
	    {
		   square_deviation = temp;
		   recalc();
		   controller.square_deviation = temp;
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
		controller.hCrown = Math.tan(beta) * (1 - t) / 2;
		controller.beta = beta / DEGREE;
		controller.beta_hCrownFix = beta / DEGREE;
		draw();
		gui.updateDisplay();
	});
	
    f2.add(controller, 'beta_hCrownFix', 10, 80).onChange( function() 
	{
		var temp1 = beta;
		var temp2 = t;
		beta = (controller.beta_hCrownFix) * DEGREE;
		t = 1 - Math.tan(temp1) / Math.tan(beta) * (1 - t);
		recalc();
	    if (isCorrect() == -1) 
	    {
		   beta = temp1;
		   t = temp2;
		   recalc();
	    }		
		controller.hCrown = Math.tan(beta) * (1 - t) / 2;
		controller.t = t;
		controller.beta = beta / DEGREE;
		controller.beta_hCrownFix = beta / DEGREE;
		draw();
		gui.updateDisplay();
	});	
	
    f2.add(controller, 'hCrown', 0.001, 0.99).onChange( function() 
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
		controller.t = t;
		controller.hCrown = Math.tan(beta) * (1 - t) / 2;
		draw();
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
		controller.t = t;
		controller.hCrown = Math.tan(beta) * (1 - t) / 2;
		draw();
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
		controller.dSquare = dSquare;
		controller.star_facets = star_facets;
		draw();
		gui.updateDisplay();
    });	
	
    f2.add(controller, 'star_facets'); 
	
	// Павильон
	var f3 = gui.addFolder('Pavilion');
    f3.add(controller, 'alpha', 10.0, 80.0).onChange( function() 
	{
		var temp = alpha;
		alpha = (controller.alpha) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   alpha = temp;
		   recalc();
	    }			
		controller.alpha = temp / DEGREE;
		controller.hPavilion = Math.tan(alpha) * (1 - culet) / 2;
		draw();
		gui.updateDisplay();
    });
	
    f3.add(controller, 'hPavilion', 0.01, 0.99).onChange( function()
	{
		var temp = alpha;
		hPavilion = controller.hPavilion;
		alpha = Math.atan2(hPavilion + hPavilion, 1 - culet);
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   alpha = temp;
		   recalc();
	    }	
		controller.alpha = alpha / DEGREE;
		controller.hPavilion = Math.tan(alpha) * (1 - culet) / 2;
		draw();
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
		controller.hPavFacet = hPavFacet;
		draw();
		gui.updateDisplay();
    });

    f3.add(controller, 'culet', 0.00001, 0.95).onChange( function() 
	{
		var temp = culet;
		culet = controller.culet;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   culet = temp;
		   recalc();
	    }	
		controller.culet = culet;
		draw();
		gui.updateDisplay();
    });
	
    f3.add(controller, 'culet_R', -0.3, 0.3).onChange( function() 
	{
		var temp = culet_R;
		culet_R = controller.culet_R;
		recalc(); 
	    if (isCorrect() == -1) 
	    {
		   culet_R = temp;
		   recalc();
	    }
		controller.culet_R = culet_R;
		controller.culet_offsetX = culet_R * Math.cos(culet_A);
		controller.culet_offsetY = - culet_R * Math.sin(culet_A);
		draw();
		gui.updateDisplay();
    });
	
    f3.add(controller, 'culet_A', -360.0, 360.0).onChange( function() 
	{
		var temp = culet_A;
		culet_A = (controller.culet_A) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   culet_A = temp;
		   recalc();
	    }
		controller.culet_A = culet_A / DEGREE;
		controller.culet_offsetX = culet_R * Math.cos(culet_A);
		controller.culet_offsetY = - culet_R * Math.sin(culet_A);
		draw();
		gui.updateDisplay();
    });
	
    f3.add(controller, 'culet_offsetX', -0.3, 0.3).onChange( function() 
	{
		var temp1 = culet_R;
		var temp2 = culet_A;
		var x = controller.culet_offsetX;
		var y = - culet_R * Math.sin(culet_A);
		if ((Math.abs(x) < 0.000001) && (Math.abs(y) < 0.000001))
		{
			culet_A = 0.00001;
		}
		else
		{
			culet_A = - Math.atan2(y,x);
		}
		culet_R = Math.sqrt(x*x + y*y);
		recalc();   

		if (isCorrect() == -1) 
	    {
			culet_R = temp1;
			culet_A = temp2;
			recalc();
	    }			
		controller.culet_R = culet_R;
		controller.culet_A = culet_A / DEGREE;
		controller.culet_offsetX = culet_R * Math.cos(culet_A);
		controller.culet_offsetY = - culet_R * Math.sin(culet_A);
		draw();
		gui.updateDisplay();
    });		
	
    f3.add(controller, 'culet_offsetY', -0.3, 0.3).onChange( function() 
	{
		var temp1 = culet_R;
		var temp2 = culet_A;
		var x = culet_R * Math.cos(culet_A);
		var y = controller.culet_offsetY;
		if ((Math.abs(x) < 0.000001) && (Math.abs(y) < 0.000001))
		{
			culet_A = 0;
		}
		else
		{
			culet_A = - Math.atan2(y,x);
		}
		culet_R = Math.sqrt(x*x + y*y);
		recalc();   

		if (isCorrect() == -1) 
	    {
			culet_R = temp1;
			culet_A = temp2;
			recalc();
	    }			
		controller.culet_R = culet_R;
		controller.culet_A = culet_A / DEGREE;
		controller.culet_offsetX = culet_R * Math.cos(culet_A);
		controller.culet_offsetY = - culet_R * Math.sin(culet_A);
		draw();
		gui.updateDisplay();
    });	
	
	var f4 = gui.addFolder('Advanced setting');
    f4.add(controller, 'low_az', -30.0, 30.0).onChange( function() 
	{
		var temp = low_az;
		low_az = (controller.low_az) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   low_az = temp;
		   recalc();
		   controller.low_az = temp / DEGREE;
	    }			
		draw();
		gui.updateDisplay();
    });
	
    f4.add(controller, 'up_az', -30.0, 30.0).onChange( function() 
	{
		var temp = up_az;
		up_az = (controller.up_az) * DEGREE;
		recalc();   
	    if (isCorrect() == -1) 
	    {
		   up_az = temp;
		   recalc();
		   controller.low_up = temp / DEGREE;
	    }			
		draw();
		gui.updateDisplay();
    });

	f4.add(controller, 'full_height', 0.005, 5.0).onChange( function() 
	{
		var temp1 = beta;
		var temp2 = alpha;
		var temp3 = r;
		
		var value = controller.full_height;
		
		var hp = Math.tan(alpha) * (1 - culet) / 2;
		var hCrown = Math.tan(beta) * (1 - t) / 2;
		var ratio = value / (r + hp + hCrown);
		hCrown = ratio * hCrown;
		beta = Math.atan2(hCrown, (0.5 - t/2));
		hp = ratio * hp;
		alpha = Math.atan2(2 * hp, 1 - culet);
		r = r * ratio;		
		recalc(); 
	    if (isCorrect() == -1) 
	    {
			beta = temp1;
			alpha = temp2;
			r = temp3;
			recalc();
	    }
		controller.beta  = beta / DEGREE;
		controller.alpha = alpha / DEGREE;
		controller.r = r;
		controller.full_height = r + Math.tan(alpha) * (1 - culet) / 2 + Math.tan(beta) * (1 - t) / 2;
		controller.hCrown = Math.tan(beta) * (1 - t) / 2;
		controller.beta_hCrownFix = beta / DEGREE;
		controller.hPavilion = Math.tan(alpha) * (1 - culet) / 2;
		draw();
		gui.updateDisplay();
    });
	
	gui.add( controller, 'correct', true ).onChange( function() 
	{
		correct = controller.correct; 
		if (correct == true)
		{
			lw = 1.0;      			// отношение длины огранки к ее ширине
			// Рундист
			r = 0.04;       		// толщина рундиста
			square_deviation = 0.0001; // квадратичность рундиста
			// Корона
			beta = 30*DEGREE;//0.67831821947314540;//   34.5*DEGREE;    	// угол короны
			t = 0.57;				// размер площадки
			dSquare = 0.0001; 
			// Павильон
			alpha = 50*DEGREE;   // угол павильона
			hPavFacet = 0.60; 		// глубина нижних вершин фасет павильона
			// Калетта
			culet = 2*PERCENT;// Размер калетты
			culet_R = 0.00001; // Смещение калетты в процентах от диаметра
			culet_A = 0*DEGREE; // Направление (азимут) смещения калетты
			// Азимуты
			low_az = 11.25*DEGREE;	// Азимут граней павильона
			up_az = 11.25*DEGREE;	// Азимут граней короны		

			star_facets = 0.5;		

			controller.lw = lw;
			controller.r = r;
			controller.square_deviation = square_deviation;

			controller.beta = beta / DEGREE;
			controller.t = t;
			controller.dSquare = dSquare;
			controller.star_facets = star_facets;

			controller.alpha = alpha / DEGREE;
			controller.hPavFacet = hPavFacet;
			controller.culet = culet;
			controller.culet_R = culet_R;
			controller.culet_A = culet_A / DEGREE;
			controller.low_az = low_az / DEGREE;
			controller.up_az = up_az / DEGREE;

			controller.hCrown = Math.tan(beta) * (1 - t) / 2;
			controller.beta_hCrownFix = beta / DEGREE;
			controller.hPavilion = Math.tan(alpha) * (1 - culet) / 2;
			controller.full_height = r + Math.tan(alpha) * (1 - culet) / 2 + Math.tan(beta) * (1 - t) / 2;

			controller.culet_offsetX = culet_R * Math.cos(culet_A);
			controller.culet_offsetY = - culet_R * Math.sin(culet_A);		
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
					index = i;
					var index_text = "Facet = " + roundNumber(index, 3);
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

					// Отображаем значения координат именно той точки грани (!!!)
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
	{	
		recalc();
		draw();		
	}
}
