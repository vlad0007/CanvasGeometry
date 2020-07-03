var DEGREE = 0.01745329251994;
var SQRT2 =  1.41421356237309;

var lw = 1.5;           // Отношение длины огранки к ее ширине 

// Форма и толщиа рундиста
var r = 0.04;            // Толщина рундиста
var vp = 0.000010; // Угол, определяющий величину отклонения кривой от окружности
var Lh = 0.34;           // отклонение смещения самого широкого места рундиста 
var square_deviation = 0;  // степень отклонения рундиста от эллипса

// Корона
var beta = 35*DEGREE;         // Угол короны
var t = 0.6;            // Ширина площадки
var dSquare = 0.00001;      // Задает положение средних вершин короны.
var vLh = 0.00001;          // определяет смещение центральной точки огранки

// Павильон
var hp = 0.44;          // Задает глубину павильона
var hPavFacet = 0.8;	// Определяет положение нижних вершин клиньев павильона
var CuletX = 0.00001;	    // смещение калетты вдоль оси X
var CuletY = 0.00001;      // смещение калетты по оси Y

// Следующие параметры задают положение узловых вершин на рундисте
var DelAngGirdle_4 = 0;
var DelAngGirdle_8 = 0.0*DEGREE;
var DelAngGirdle_12 = 0.0*DEGREE;
var DelAngGirdle_16 = -2.0*DEGREE;
var DelAngGirdle_20 = 0.0*DEGREE;
var DelAngGirdle_24 = 0.0*DEGREE;
var DelAngGirdle_28 = 0.0*DEGREE;

var vertices = [];
var girdle = [64];
var crown = [];
var pavil = [];	

function VerticesCalculation()
{
	var i;
	var X1 = new Vector3D(1, 0, 0);
	var Y1 = new Vector3D(0, 1, 0);
	var Z1 = new Vector3D(0, 0, 1);
	var nCrown  = 16;
	var nGirdle = 64;
	var nPav    = 19;

	InitGirdle();
	
	// Crown
	var offset = vLh + lw * Lh - 0.5; // сдвиг центральной точки
	var upPoint = new Point3D(offset, 0, r/2 + 0.5 * Math.tan(beta));	
    for ( i = 0; i < 8; i++ )
    {
        var dir = new Vector3D(girdle[i*8][0] - upPoint[0], girdle[i*8][1] - upPoint[1], girdle[i*8][2] - upPoint[2]);
		// Значение параметра t (ширина площадки) выступает в качестве коэффициентата пропорциональности при нахождении
		// координат вершин короны лежащих на площадке.
		crown[i] = new Point3D(upPoint[0] + t * dir[0], upPoint[1] + t * dir[1], upPoint[2] + t * dir[2]);
    }	
	
	//    Определение уравнений касательных в заданных вершинах рундиста. 
	// Для решения этой задачи поступим следующим образом. 
	// Найдем направляющий вектор отрезка, соединяющего две вершины рундиста, 
	// ближайшие к той его вершине, через которую требуется провести касательную. 
	// Причем эти две вершины, через которые проходит отрезок, должны лежать 
	// по разные стороны от вершины рундиста через которую проводится касательная.  
	// Исходя из построенного отрезка, находим его направляющий вектор. 
	// Теперь у нас есть все необходимые составляющие, чтобы составить уравнение 
	// касательной к рундисту на плоскости – направляющий вектор касательной и точка (вершина рундиста),
    // через которую эта касательная проходит.
	
	var line = []; // касательные к 8 узловым точкам на рундисте
    for ( i = 0; i < 8; i++ )
    {
		var i1 = 1 + i*8;
		var i2 = (63 + i*8) % 64;

		var dir = new Vector2D(girdle[1+i*8][0] - girdle[(63+i*8)%64][0], girdle[1+i*8][1] - girdle[(63+i*8)%64][1]);
		dir.Normer();

		var pt = new Point2D(girdle[i*8][0], girdle[i*8][1]);
		line[i] = new Line2D();
		line[i].CreateLineVectorPoint(dir, pt);
	}	
	
	// Находим точки пересечения касательных между собой	
	var g2 = []; 
	for ( i = 0; i < 8; i++ )
	{
		var i3 = (i + 1) % 8;
		var pt = line[i].IntersectionTwoLines(line[(i+1)%8]);
		g2[i] = new Point2D(pt[0], pt[1]);
	}
	
	// При расчете мы учитываем, что ширина огранки равна 1, а ширина площадки равна t.
	
	// Коэффициент пропорциональности m задаем следующей формулой:
    var m = (1 + SQRT2) / 2 * t; 
    if ( dSquare <= 0 ) 
	{
		m = m + dSquare * (m - 1 + t);
	}
    else 
	{
		m = m + dSquare * (1 - m);
	}
	
	// Если dSquare = 0, то m =(1 + √2)*(t/2)
	
	//  Предварительное определение координат вершин короны, которые расположены между площадкой и рундистом огранки.
	//      Построение можно объяснить приблизительно следующим образом:
	//  Мы строим восемь отрезков, каждый из которых соединяет точку upPoint с одной из точек пересечения касательных к рундисту.
	// Затем  полученные отрезки делятся на две части в определенном отношении. 
	// Величина этого отношения вычисляется при помощи значения значения m и величины параметра dSquare.
    for ( i = 0; i < 8; i++ )
    {
		var dir = new Vector3D(g2[i][0] - upPoint[0], g2[i][1] - upPoint[1], r/2 - upPoint[2]);
		crown[i+8] = new Point3D(upPoint[0] + m * dir[0], upPoint[1] + m * dir[1], upPoint[2] + m * dir[2]);
    }
	
	// Корректировка положения вершин лежащих на площадке огранки.
	// Создаем горизонтальную плоскость на уровне площадки.
	var plane_table = new Plane3D(); 
	plane_table.CreatePlaneThreePoints(crown[0], crown[1], crown[2]);

	// Создаем три плоскости в которых лежат боковые грани короны огранки.
	// Всего боковых граней короны шесть, но мы считаем корону симметричной.
	var plane_B = new Plane3D();
	plane_B.CreatePlaneThreePoints(crown[14], crown[15], crown[7]);
	var plane_C = new Plane3D();
	plane_C.CreatePlaneThreePoints(crown[15], crown[8], crown[0]);
	var plane_D = new Plane3D();
	plane_D.CreatePlaneThreePoints(crown[1], crown[8], crown[9]);
	
	// Корректировка положения вершины корон 3 и 1 с целью "улучшения красоты" короны. 
	
	// Точка pt1 выбирается посередине  между точками crown[8] и crown[9] в горизонтальной плоскости.
	var pt1 = new Point3D( (crown[8][0] + crown[9][0])/2.0,
						   (crown[8][1] + crown[9][1])/2.0, 1.0);
	// 	Строим вектор dir_8_9 от crown[8] до  crown[9] в горизонтальной плоскости  . 
	var dir_8_9 = new Vector3D(crown[8][0] - crown[9][0], 
							   crown[8][1] - crown[9][1], 0.0);
	dir_8_9.Normer();				
	
	// Находим уравнение плоскости проходящей через pt1 и имеющую в качестве вектора нормали dir_8_9.
	var plane_Vert_1 = new Plane3D();
	plane_Vert_1.CreatePlaneNormalVectorPoint(dir_8_9, pt1);
	// Корректируем положение вершины 3 короны.
	crown[1] = plane_table.IntersectionThreePlanes(plane_Vert_1, plane_D);
	crown[3][0] = crown[1][0];
	crown[3][1] = - crown[1][1]; // из условия симметрии короны

	// Корректировку положения вершин короны 4 и 0 осуществляем также как и вершин 1 и 3 короны.
	var pt2 = new Point3D( (crown[15][0] + crown[8][0])/2.0,
						   (crown[15][1] + crown[8][1])/2.0, 1.0);
	var dir_15_8 = new Vector3D(crown[15][0] - crown[8][0], 
								crown[15][1] - crown[8][1], 0.0);
	var plane_Vert_2 = new Plane3D();
	plane_Vert_2.CreatePlaneNormalVectorPoint(dir_15_8, pt2);
	crown[0] = plane_table.IntersectionThreePlanes(plane_Vert_2, plane_C);
	crown[4][0] = crown[0][0];
	crown[4][1] = - crown[0][1];	// из условия симметрии короны
	
	// Корректировка положения вершин короны 5 и 7 осуществляем также как и вершин 1 и 3 короны.
	var pt3 = new Point3D( (crown[14][0] + crown[15][0])/2.0,
						   (crown[14][1] + crown[15][1])/2.0, 1.0);
	var dir_14_15 = new Vector3D(crown[14][0] - crown[15][0], 
								 crown[14][1] - crown[15][1], 0.0);
	var plane_Vert_3 = new Plane3D();
	plane_Vert_3.CreatePlaneNormalVectorPoint(dir_14_15, pt3);
	crown[7] = plane_table.IntersectionThreePlanes(plane_Vert_3, plane_B);
	crown[5][0] = crown[7][0];
	crown[5][1] = - crown[7][1]; // из условия симметрии короны
	
	// Корректировка положения вершин рундиста по оси Z
	corr_gd_crown(0, 4, 8);
	corr_gd_crown(4, 8, 8);
	corr_gd_crown(8, 12, 9);
	corr_gd_crown(12, 16, 9);
	
	corr_gd_crown(16, 20, 10);
	corr_gd_crown(20, 24, 10);
	corr_gd_crown(24, 28, 11);
	corr_gd_crown(28, 32, 11);	
	
	corr_gd_crown(32, 36, 12);
	corr_gd_crown(36, 40, 12);
	corr_gd_crown(40, 44, 13);
	corr_gd_crown(44, 48, 13);

	corr_gd_crown(48, 52, 14);
	corr_gd_crown(52, 56, 14);
	corr_gd_crown(56, 60, 15);
	corr_gd_crown(60, 0, 15);		

	//  Pavilion
	
	
	
	var kollet = new Point3D();
	kollet[0] = CuletX + vLh;
	kollet[1] = CuletY;
	kollet[2] = - hp - r/2;
	
	pavil[7] = new Point3D(kollet[0], kollet[1], kollet[2]);
	
	var dir_0 = new Vector2D(girdle [63][0] - girdle [1][0], girdle [63][1] - girdle [1][1]);
	dir_0.Normer();
	var dir_1 = new Vector2D(girdle [7][0] - girdle [9][0], girdle [7][1] - girdle [9][1]);
	dir_1.Normer();
	var dir_2 = new Vector2D(girdle [23][0] - girdle [25][0], girdle [23][1] - girdle [25][1]);
	dir_2.Normer();
	var dir_3 = new Vector2D(girdle [31][0] - girdle [33][0], girdle [31][1] - girdle [33][1]);
	dir_3.Normer();
	var dir_4 = new Vector2D(girdle [39][0] - girdle [41][0], girdle [39][1] - girdle [41][1]);
	dir_4.Normer();
	var dir_5 = new Vector2D(girdle [47][0] - girdle [49][0], girdle [47][1] - girdle [49][1]);
	dir_5.Normer();
	var dir_6 = new Vector2D(girdle [55][0] - girdle [57][0], girdle [55][1] - girdle [57][1]);
	dir_6.Normer();	
	
    // Точки пересечения основных граней короны между собой на уровне рундиста
	var line_0 = new Line2D();
	line_0.CreateLineVectorPoint(dir_0, new Point2D(girdle[0][0], girdle[0][1]));
	var line_1 = new Line2D();
	line_1.CreateLineVectorPoint(dir_1, new Point2D(girdle[8][0], girdle[8][1]));
	var line_2 = new Line2D();
	line_2.CreateLineVectorPoint(dir_2, new Point2D(girdle[24][0], girdle[24][1]));
	var line_3 = new Line2D();
	line_3.CreateLineVectorPoint(dir_3, new Point2D(girdle[32][0], girdle[32][1]));
	var line_4 = new Line2D();
	line_4.CreateLineVectorPoint(dir_4, new Point2D(girdle[40][0], girdle[40][1]));
	var line_5 = new Line2D();
	line_5.CreateLineVectorPoint(dir_5, new Point2D(girdle[48][0], girdle[48][1]));
	var line_6 = new Line2D();
	line_6.CreateLineVectorPoint(dir_6, new Point2D(girdle[56][0], girdle[56][1]));
	
	var g2_pav = [7];
	g2_pav[0] = line_0.IntersectionTwoLines(line_1);
	g2_pav[1] = line_1.IntersectionTwoLines(line_2);
	g2_pav[2] = line_2.IntersectionTwoLines(line_3);
	g2_pav[3] = line_3.IntersectionTwoLines(line_4);
	g2_pav[4] = line_4.IntersectionTwoLines(line_5);
	g2_pav[5] = line_5.IntersectionTwoLines(line_6);
	g2_pav[6] = line_6.IntersectionTwoLines(line_0);	
	
    for (i = 0; i < 7; i++)
    {
        var dir = new Vector3D(kollet[0] - g2_pav[i][0], kollet[1] - g2_pav[i][1], kollet[2] + r/2);
		
		pavil[i] =  new Point3D(kollet[0] - (1 - hPavFacet) * dir[0],
								kollet[1] - (1 - hPavFacet) * dir[1],
								kollet[2] - (1 - hPavFacet) * dir[2]);
	}	
	
	// Корректировка положения вершин рундиста по оси Z
	corr_gd_pav(64, 68, 0);
	corr_gd_pav(68, 72, 0);
	corr_gd_pav(72, 76, 1);
	corr_gd_pav(76, 80, 1);
	
	corr_gd_pav(80, 84, 1);
	corr_gd_pav(84, 88, 1);
	corr_gd_pav(88, 92, 2);
	corr_gd_pav(92, 96, 2);

	corr_gd_pav(96, 100, 3);
	corr_gd_pav(100, 104, 3);
	corr_gd_pav(104, 108, 4);
	corr_gd_pav(108, 112, 4);

	corr_gd_pav(112, 116, 4);
	corr_gd_pav(116, 120, 4);
	corr_gd_pav(120, 124, 5);
	corr_gd_pav(124, 64, 5);
	
/*
	GIRDLE_PAV_POINTS(64, 68, 0)
	GIRDLE_PAV_POINTS(68, 72, 1)
	GIRDLE_PAV_POINTS(72, 76, 2)
	GIRDLE_PAV_POINTS(76, 80, 12)

	GIRDLE_PAV_POINTS(124, 64, 0)
	GIRDLE_PAV_POINTS(120, 124, 9)
	GIRDLE_PAV_POINTS(116, 120, 8)
	GIRDLE_PAV_POINTS(112, 116, 16)
*/	
	// Производим вычисления рундиста для остальных квадрантов
	for(i = 0; i < 16; i++)
	{
		girdle[80+i][2] = girdle[80-i][2];
	}
	for(i = 1; i < 16; i++)
	{
		girdle[96+i][2] = girdle[128-i][2];
	}
	
	for(i = 0; i < 16; i++)
	{
		vertices.push(crown[i][0]);
		vertices.push(crown[i][1]);
		vertices.push(crown[i][2]);
	}
	
	for(i = 0; i < 128; i++)
	{
		vertices.push(girdle[i][0]);
		vertices.push(girdle[i][1]);
		vertices.push(girdle[i][2]);
	}
	
	for(i = 0; i < 8; i++)
	{
		vertices.push(pavil[i][0]);
		vertices.push(pavil[i][1]);
		vertices.push(pavil[i][2]);
	}	
}

function InitGirdle()
{
	// Для понимания действия параметров на форму рундиста
	// следует запустить PearGirdle.html .
	// следует учесть, что параметр vp обозначен как δ на экране при запуске программы.
	
	var i;
	// Вспомогательный массив для хранения координат X и Y рундиста
	var girdle2 = [];
	//  Названия приняты такими для совместимости с ранее
	// используемыми названиями.
	var v = lw * Lh - 0.5;
	var e = square_deviation;
    var g = 1. + v + v;
    if ( g < 0 )
		return null;
    var u = 2*lw - g;
    if ( u < 0 )
		return null;
    var fi = Math.asin ( ( u + u ) / ( u * u + 1.0) );
	var psi = fi + vp;
	if ( vp >= Math.Pi/2 ) 
		return null;
	var temp = Math.sqrt(0.5) + 2*square_deviation / Math.sqrt ( 1.+ g * g );
    if ( temp > 0.99 || temp < 0.5 ) 
		return null;
	var p = 2 / (1 - square_deviation);
    var t = u * Math.tan(psi);
    if ( t <= 2.0) 
		return null;
	var n = 64;
    var n2 = n / 2;
    var n4 = n / 4;
	var h = Math.PI / n2;

	var a = ( t - 1. ) / ( t - 2. );
	var s = a - 1.;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );

	// Переменные A, B и C определяют уравнение A*x + B*y + C = 0
	var A, B, C;
	var angle_current;
	var delta, x, y, w, x_rez, y_rez;
	var bRez;

	//   Вершина рундиста 16 изначально находится в точке сопряжения двух кривых, а именно ellipse 2 и ellipse 3
	// (это можно увидеть, усли запустить программу PearGirdle.html).
	// Поэтому, если мы хотим двигать вершину 16 рундиста по линии рундиста, то необходимо рассмотреть два
	// случая - когда значение DelAngGirdle_16 меньше или равно нулю, и когда значение DelAngGirdle_16 больше нуля.
	// Соответственно будут меняться координаты остальных вершин рундиста.
	// Заметим, что в программе PearGirdle.html регулировка положения вершины рундиста 16 отсутствует,
	// (также как и другие регулировки разбиения рундиста на сегменты) для того, 
	// чтобы не затенять построение собственно формы линии рундиста.
	if (DelAngGirdle_16 <= 0.0)
	{
		//  Сдвиг центральной точки рундиста в сторону
		// противоположную от носика груши.
		var ang_0_16 = Math.PI/2 + DelAngGirdle_16;
		var E = new Point2D(Math.sin(ang_0_16), Math.cos(ang_0_16));
		var alpha = Math.atan2(E[1], (E[0] + s));

		// Вершины в квадранте (X > 0; Y > 0)
		var ang_0_8 = ang_0_16 / 2 + DelAngGirdle_8;
		var ang_8_16 = ang_0_16 - ang_0_8;
		var ang_0_4 = ang_0_8 / 2 + DelAngGirdle_4;
		var ang_4_8 = ang_0_8 - ang_0_4;
		var ang_8_12 = ang_8_16 / 2 + DelAngGirdle_12;
		var ang_12_16 = ang_8_16 - ang_8_12;
		
		angle_current = 0.0;
		for ( i = 0; i <= 16; i++ )
		{
			x = Math.sin(angle_current);
			y = Math.cos (angle_current);
			w = Math.pow( y, p ) + Math.pow ( x, p );
			w = 1. / Math.pow ( w, 1./p );
			
			girdle2[i] = new Point2D( w * x, w * y * g);

			if (i < 4)
				delta = ang_0_4 / 4;
			else if (i < 8)
				delta = ang_4_8 / 4;
			else if (i < 12)
				delta = ang_8_12 / 4;
			else
				delta = ang_12_16 / 4;
			
			angle_current = angle_current + delta;
		}
		var v16_1_x = girdle2[16][0];
		var v16_1_y = girdle2[16][1];
		
		// Вершины в квадранте (X > 0; Y < 0)
		var ang_32 = Math.acos (s / a);
		var ang_16 = - alpha;
		var ang_24 = ang_32 - (ang_32 - ang_16 )/ 2.0 + DelAngGirdle_24;
		var ang_20 = ang_24 - (ang_24 - ang_16) / 2.0 + DelAngGirdle_20;
		var ang_28 = ang_32 - (ang_32 - ang_24) / 2.0 + DelAngGirdle_28;

		var j = 31;
		angle_current = ang_32;
		
		for ( i = 15; i >= 0; i-- )
		{
		
			if (i < 4)
				delta = (ang_20 - ang_16) / 4.0;
			else if ( (i >= 4) && (i < 8) )
				delta = (ang_24 - ang_20) / 4.0;
			else if ( (i >= 8) && (i < 12) )
				delta = (ang_28 - ang_24) / 4.0;
			else
				delta = (ang_32 - ang_28) / 4.0;

			angle_current = angle_current - delta;
			if (angle_current <= 0)
			{
				// x и y - координаты точки L
				x = a * Math.cos ( angle_current ) - s;
				y = b * Math.sin ( angle_current );
				// k - угловой коэффициент прямой DL
				var k = y / (x + s);
				//  Находим координаты точки K,
				// лежащей на пересечении прямой DL с Ellipse_1
				A = g*g + k*k;
				B = 2*k*k*s;
				C = s*s*k*k - g*g;
				// x_rez и x_yez - координаты точки K
				var pts = []; // Две точки пересечения
				bRez = QuadraticEquation(A, B, C, pts);
				if (pts[0] > pts[1])
					x_rez = pts[0];
				else
					x_rez = pts[1];
				y_rez = (x_rez + s)*k;
				girdle2[j] = new Point2D(x_rez, y_rez);
				j--;
			}
			else
			{
				girdle2[j] = new Point2D(a * Math.cos(angle_current) - s, b * Math.sin(angle_current));
				j--;
			}
		}
		girdle2[16] = new Point2D(v16_1_x, v16_1_y);
	}
	else
	{
		
		// DelAngGirdle_16 > 0.0
		//  Сдвиг центральной точки рундиста в сторону носика груши.
		// Определяем координаты точки N (g16)
		var N = new Point2D(a * Math.cos(DelAngGirdle_16) - s, b * Math.sin(DelAngGirdle_16)); 
		// Находим точку M пересечения прямой ON с Ellipse_1
		var k = N[1] / N[0];
		var beta = Math.atan2(-N[1], N[0]);
		var ang_0_16 = Math.PI/2 + beta;

		// Вершины g0 - g16
		var ang_0 = 0.0;
		var ang_8 = ang_0_16 / 2.0 + DelAngGirdle_8;
		var ang_4 = ang_0 + (ang_8 - ang_0) / 2.0 + DelAngGirdle_4;
		var ang_12 = ang_8 + (ang_0_16 - ang_8) / 2.0 + DelAngGirdle_12;
		var ang_16 = ang_0_16;
		
		angle_current = 0.0;
		for ( i = 0; i <= 15; i++ )
		{
			if (i <= 4)
				delta = (ang_4 - ang_0) / 4.0;
			else if ( (i >= 5) && (i <= 8) )
				delta = (ang_8 - ang_4) / 4.0;
			else if ( (i >= 9) && (i <= 12) )
				delta = (ang_12 - ang_8) / 4.0;
			else
				delta = (ang_16 - ang_12) / 4.0;
			// Это могут быть и координаты точки R
			// если окжется, что angle_current > Math.PI/2
			var x = Math.sin(angle_current);
			var y = g * Math.cos (angle_current);
			
			if (angle_current > Math.PI/2)
			{
				//  Находим точку P пересечения  
				// прямой OR с Ellipse_2
				k = y / x;	
				A = b*b + a*a*k*k;
				B = 2*b*b*s;
				C = b*b*s*s - a*a*b*b;
				var pts = [];
				bRez = QuadraticEquation(A, B, C, pts);
				if (pts[0] > pts[1])
					x_rez = pts[0];
				else
					x_rez = pts[1];
				y_rez = k * x_rez;

				girdle2[i] = new Point2D(x_rez, y_rez);
			}
			else
			{
				w = Math.pow ( y, p ) + Math.pow ( x, p );
				w = 1. / Math.pow ( w, 1./p );
				girdle2[i] = new Point2D(w * x, w * y * g);
			}
			angle_current = angle_current + delta;
		}
		
		// Вершины g16 - g32
		var ang_32 = Math.acos(s / a);
		ang_16 = DelAngGirdle_16; 
		var ang_24 = ang_32 - (ang_32 - ang_16 )/ 2.0 + DelAngGirdle_24;
		var ang_20 = ang_24 - (ang_24 - ang_16) / 2.0 + DelAngGirdle_20;
		var ang_28 = ang_32 - (ang_32 - ang_24) / 2.0 + DelAngGirdle_28;

		var j = 31;
		angle_current = Math.acos(s / a);
		for ( i = 16; i > 0; i-- )
		{
			if (i <= 4)
				delta = (ang_20 - ang_16) / 4.0;
			else if ( (i > 4) && (i <= 8) )
				delta = (ang_24 - ang_20) / 4.0;
			else if ( (i > 8) && (i <= 12) )
				delta = (ang_28 - ang_24) / 4.0;
			else
				delta = (ang_32 - ang_28) / 4.0;

			angle_current = angle_current - delta;
			girdle2[j] = new Point2D(a * Math.cos(angle_current) - s, b * Math.sin(angle_current));
			j--;
		}
	}

	// Остальные вершины
	girdle2[n2] = new Point2D(0.0, -u);
	for ( i = 1; i < n2; ++ i )
	{
		girdle2[i+n2] = new Point2D(-girdle2[n2-i][0], girdle2[n2-i][1]);
	}

	// Координату y вершины 0 рундиста удобно сделать равной нулю.
    var d = 1.0 - girdle2[0][1];
    for (i = 0; i < 64; ++ i)
    {
		girdle2[i][1] += d; // сдвиг координаты y всех вершин рундиста 
							// на величину d
	}
 
	//  Разворачиваем рундист в горизонтальной плоскости 
	// таким образом, чтобы основной диаметр рундиста
	// был направлен вдоль оси Y (разворот на 90°)
	for(i = 0; i < 48; i++)
	{
		girdle[i] = new Point3D(-0.5 * girdle2[i+16][1], 0.5 * girdle2[i+16][0], r/2);
		girdle[i+64] = new Point3D(girdle[i][0], girdle[i][1], -r/2);
	}

	for(i = 48; i < 64; i++)
	{
		girdle[i] = new Point3D(-0.5 * girdle2[i - 48][1], 0.5 * girdle2[i - 48][0], r/2);
		girdle[i+64] = new Point3D(girdle[i][0], girdle[i][1], -r/2);
	}

	return 1;
}

function corr_gd_crown(gd1, gd2, cr)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(girdle[gd1], girdle[gd2], crown[cr]);
	var n = 4; //gd2 - gd1;
	var i = 0;
	for (i = 1; i < n; i++)
	{
		var vert_line = new Line3D(girdle[gd1 + i], girdle[gd1 + i + 64]);
		var pt = vert_line.IntersectionLinePlane(planeT);
		girdle[gd1 + i][2] = pt[2];
	}
}

function corr_gd_pav(gd1, gd2, pav)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(girdle[gd1], girdle[gd2], pavil[pav]);
	var n = 4; //gd2 - gd1;
	var i;
	for (i = 1; i < n; i++)
	{
		var vert_line = new Line3D(girdle[gd1 + i], girdle[gd1 + i - 64]);
		var pt = vert_line.IntersectionLinePlane(planeT);
		girdle[gd1 + i][2] = pt[2];
	}	
}



function GIRDLE_CROWN_POINTS(gd1, gd2, cr)
{
	var i;
	var crownPlane = new Plane3D();
	crownPlane.CreatePlaneThreePoints(girdle[(gd1)],girdle[(gd2)],crown[(cr)]); 
	for(i = 1; i < 4; i++) 
	{ 
		var vert_line = new Line3D(girdle[i+(gd1)], girdle[64+i+(gd1)]);
		girdle[i+gd1] = vert_line.IntersectionLinePlane(crownPlane);
	}
}

function GIRDLE_PAV_POINTS(gd1, gd2, pav)
{
	var i;
	var pavPlane = new Plane3D();
	pavPlane.CreatePlaneThreePoints(girdle[(gd1)], girdle[(gd2)], pavil[(pav)]); 
	for(i = 1; i < 4; i++) 
	{
		var vert_line = new Line3D(girdle[i+(gd1)], girdle[i+(gd1) - 64]);
		girdle[i+gd1] = vert_line.IntersectionLinePlane(pavPlane);
	}
}

var index_cut =
[
	// Площадка
	0,7,6,5,4,3,2,1,0,

	// грани звезды
	0,1,8,0,
	1,2,9,1,
	2,3,10,2,
	3,4,11,3,
	4,5,12,4,
	5,6,13,5,
	6,7,14,6,
	7,0,15,7,

	// 
	0,8,16,15,0,
	1,9,24,8,1,
	2,10,32,9,2,
	3,11,40,10,3,
	4,12,48,11,4,
	5,13,56,12,5,
	6,14,64,13,6,
	7,15,72,14,7,

	// грани короны расположенные рядом с рундистом
	8,20,19,18,17,16,8,
	8,24,23,22,21,20,8,
	9,28,27,26,25,24,9,
	9,32,31,30,29,28,9,
	10,36,35,34,33,32,10,
	10,40,39,38,37,36,10,
	11,44,43,42,41,40,11,
	11,48,47,46,45,44,11,
	12,52,51,50,49,48,12,
	12,56,55,54,53,52,12,
	13,60,59,58,57,56,13,
	13,64,63,62,61,60,13,
	14,68,67,66,65,64,14,
	14,72,71,70,69,68,14,
	15,76,75,74,73,72,15,
	15,16,79,78,77,76,15,

	// Рундист
	16,17,81,80,16,
	17,18,82,81,17,
	18,19,83,82,18,
	19,20,84,83,19,
	20,21,85,84,20,
	21,22,86,85,21,
	22,23,87,86,22,
	23,24,88,87,23,
	24,25,89,88,24,
	25,26,90,89,25,
	26,27,91,90,26,
	27,28,92,91,27,
	28,29,93,92,28,
	29,30,94,93,29,
	30,31,95,94,30,
	31,32,96,95,31,
	32,33,97,96,32,
	33,34,98,97,33,
	34,35,99,98,34,
	35,36,100,99,35,
	36,37,101,100,36,
	37,38,102,101,37,
	38,39,103,102,38,
	39,40,104,103,39,
	40,41,105,104,40,
	41,42,106,105,41,
	42,43,107,106,42,
	43,44,108,107,43,
	44,45,109,108,44,
	45,46,110,109,45,
	46,47,111,110,46,
	47,48,112,111,47,
	48,49,113,112,48,
	49,50,114,113,49,
	50,51,115,114,50,
	51,52,116,115,51,
	52,53,117,116,52,
	53,54,118,117,53,
	54,55,119,118,54,
	55,56,120,119,55,
	56,57,121,120,56,
	57,58,122,121,57,
	58,59,123,122,58,
	59,60,124,123,59,
	60,61,125,124,60,
	61,62,126,125,61,
	62,63,127,126,62,
	63,64,128,127,63,
	64,65,129,128,64,
	65,66,130,129,65,
	66,67,131,130,66,
	67,68,132,131,67,
	68,69,133,132,68,
	69,70,134,133,69,
	70,71,135,134,70,
	71,72,136,135,71,
	72,73,137,136,72,
	73,74,138,137,73,

	74,75,139,138,74,
	75,76,140,139,75,
	76,77,141,140,76,

	77,78,142,141,77,
	78,79,143,142,78,
	79,16,80,143,79,

	// павильон
	144, 80, 81, 82, 83, 84, 144,
	144, 84, 85, 86, 87, 88, 144,
	145, 88, 89, 90, 91, 92, 145,
	145, 92, 93, 94, 95, 96, 145,
	145, 96, 97, 98, 99, 100, 145,
	145, 100, 101, 102, 103, 104, 145,
	146, 104, 105, 106, 107, 108, 146,
	146, 108, 109, 110, 111, 112, 146,
	147, 112, 113, 114, 115, 116, 147,
	147, 116, 117, 118, 119, 120, 147,
	148, 120, 121, 122, 123, 124, 148,
	148, 124, 125, 126, 127, 128, 148,
	149, 128, 129, 130, 131, 132, 149,
	149, 132, 133, 134, 135, 136, 149,
	150, 136, 137, 138, 139, 140, 150,
	150, 140, 141, 142, 143, 80, 150,

	151, 150, 80, 144, 151,
	151, 144, 88, 145, 151,
	151, 145, 104, 146, 151,
	151, 146, 112, 147, 151,
	151, 147, 120, 148, 151,
	151, 148, 128, 149, 151,
	151, 149, 136, 150, 151,
	// Ending flag
	-100
];

function facet_colors()
{
	
	var ind = 0;
	var i;

	// table
	colors[ind] = "rgb(150, 150, 150)";
	ind++;
	
		// upper crown facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(150, 150, 250)";
		ind++;
	}	
	
	// crown facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(100, 100, 250)";
		ind++;
	}

	// bottom crown facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(170, 170, 250)"; ind++;
		colors[ind] = "rgb(200, 200, 250)"; ind++;
	}	
	
	//  GIRDLE
	for (i = 0; i < 32; i++)
	{
		colors[ind] = "rgb(100, 100, 100)";
		ind++;
		colors[ind] = "rgb(150, 150, 150)";
		ind++;
	}

	// павильон
	
	// upper pavilion facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(100, 100, 150)";
		ind++;
		
		colors[ind] = "rgb(120, 120, 250)";
		ind++;
	}	

	// lower pavilion facets
	colors[ind] = "rgb(170, 170, 100)"; ind++;
	colors[ind] = "rgb(200, 200, 100)"; ind++;
	colors[ind] = "rgb(170, 170, 100)"; ind++;
	colors[ind] = "rgb(200, 200, 100)"; ind++;		
	colors[ind] = "rgb(170, 170, 100)"; ind++;
	colors[ind] = "rgb(200, 200, 100)"; ind++;		
	colors[ind] = "rgb(145, 165, 100)";
		
		
};