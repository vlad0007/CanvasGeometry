var DEGREE = 0.01745329251994;
var M_PI =   3.14159265358979;
var SQRT2 =  1.41421356237309;

var lw = 1.8;        // Отношение длины огранки к ее ширине

// Форма и толщиа рундиста
var r = 0.05;            // Толщина рундиста
var vp = 0.0;            // Угол, определяющий величину отклонения кривой от окружности

// Корона
var beta = 35*DEGREE;    // Угол короны 
var DeltaAngleCrown = -1.0*DEGREE; // Значение отклонения угла наклона короны
var t = 0.60;            // Ширина площадки
var table_length = 0.72; // Позволяет изменять длину площадки (вдоль оси X)
var starFacet = 0.5;
var dSquare = 0.00001;

// Павильон
var angle_pav = 40*DEGREE; // Угол павильона
var hPavFacet = 0.8;        // Определяет положение нижних вершин клиньев павильона
var CuletX = 0.00001;           // Смещение калетты вдоль оси X
var CuletY = 0.00001;

// Расстановка вершин на рундисте
var DelAngGirdle_4 = 2.0*DEGREE;   // Задает положение вершины рундиста g4
var DelAngGirdle_8 = 2.0*DEGREE;   // Задает положение вершины рундиста g8
var DelAngGirdle_12 = 2.0*DEGREE;  // Задает положение вершины рундиста g12

var vertices = [];
var girdle = [64];
var crown = [];
var pavil = [];	

var star_facets = starFacet;

function VerticesCalculation()
{
	InitGirdle();
	
	// Вспомогательные переменные
	var i;
	var Y1 = new Vector3D(0, 1, 0);
	var Z1 = new Vector3D(0, 0, 1);
	var OXZ = new Plane3D();
	OXZ.CreatePlaneThreePoints(new Point3D(1,0,0), new Point3D(0,0,1), new Point3D(0,0,0));
	var OYZ = new Plane3D();
	OYZ.CreatePlaneThreePoints(new Point3D(0,0,0), new Point3D(0,0,1), new Point3D(0,1,0));	
	
	var nCrown  = 16;
	var nGirdle = 64;
	var nPav    = 6;
	
	// Конструируем корону
	if (crown_variant_2 == true)
	{
		var h = h = 0.5 * Math.tan(beta);
		var h_crown = h * (1 - t);
		
		// Определяем уравнения плоскостей в которых лежат грани A и B короны
		//Plane3D plane_C, plane_B;
		var plane_C = new Plane3D(); 
		plane_C.CreateInclinePlane(beta, girdle[60], girdle[4], girdle[0]);
		var plane_B = new Plane3D();
		plane_B.CreateInclinePlane(beta - DeltaAngleCrown, girdle[52], girdle[60], girdle[56]);
		
		// Вектора идущие вдоль линий касательных к рундисту в его вершинах 56 и 0
		var dir_B = new Vector3D(girdle[57][0] - girdle[55][0], girdle[57][1] - girdle[55][1], 0);
		dir_B.Normer()
		var dir_C = new Vector3D(girdle[1][0] - girdle[63][0], girdle[1][1] - girdle[63][1], 0);
		dir_C.Normer();
		
		//  Плоскости проходящие перпендикулярно к линиям, 
		//касательным к рундисту в его вершинах 56 и 0
		var pl_Bp = new Plane3D();
		pl_Bp.CreatePlaneNormalVectorPoint(dir_B, girdle[56]);
		
		var pl_Cp = new Plane3D();
		pl_Cp.CreatePlaneNormalVectorPoint(dir_C, girdle[0]);
		
		var pl_table = new Plane3D(); // горизонтальная плоскость на уровне площадки
		pl_table.CreatePlaneNormalDistOXYZ(Z1, h_crown + r/2);
		// Находим координаты вершины 0 короны
		crown[0] = pl_table.IntersectionThreePlanes(plane_C, OYZ);
		
		var pl_tab_len = new Plane3D(); // вспомогательная вертикальная плоскость || OYZ
		pl_tab_len.CreatePlaneNormalDistOXYZ(new Vector3D(1,0,0), - lw * table_length / 2);
			  
		// Координаты вершины 6 короны
		crown[6] = pl_table.IntersectionThreePlanes(pl_tab_len, OXZ); 
		
		// Координаты вершины 7 короны
		crown[7] = pl_table.IntersectionThreePlanes(plane_B, pl_Bp);
		
		//  Вычисление исходя из значения StarFacet высоты 
		// горизонтальной плоскости короны, которая определяет
		// расположение вершин 13, 14, 15, 8, 9, 10 короны

		// Вычисляем векторное произведение нормалей к плоскостям pl_B и pl_C
		var vecB = plane_B.Normal();
		var vecC = plane_C.Normal();
		var vec_cross = vecB.Cross(vecC);

		// Вектор направленный касательно к рундисту в вершине girdle[60]
		var dir_g60 = new Vector2D(girdle[61][0] - girdle[59][0], girdle[61][1] - girdle[59][1]);
		dir_g60.Normer();
		
		// Вектор направленный перпендикулярно к предыдущему вектору
		// является нормальным вектором вертикальной плоскости
		// касательной к рундисту в его вершине g60
		var dir_g60_p = new Vector3D(dir_g60[1], -dir_g60[0], 0.0);
		
		// Плоскость направленная перпендикулярно к рундисту в вершине girdle[60]
		var pl_g60_p = new Plane3D();
		pl_g60_p.CreatePlaneNormalVectorPoint(dir_g60_p, girdle[60]);		
		
		//  Вспомогательная точка pt_help_1, лежащая на линии 
		// пересечения плоскостей plane_B и plane_C и pl_g60_p
		var pt_help_1 = pl_g60_p.IntersectionThreePlanes(plane_B, plane_C);

		//  Прямая, проходящая по линии пересечения 
		// плоскостей plane_B и plane_C и точку pt_help_1
		var line = new Line3D();
		var ln_help = line.CreateLineVectorPoint(vec_cross, pt_help_1);
		
		// Вертикальная плоскость проходящая через вершины crown[0] и crown[7] 
		var pl_cr7_cr_0 = new Plane3D();;
		pl_cr7_cr_0.CreatePlaneThreePoints(crown[7], crown[0], 
			  new Point3D(crown[0][0], crown[0][1], crown[0][2] + 1.0));

		// Находим точку пересечения плоскости pl_cr7_cr_0 и прямой ln_help
		var pt_help_2 = ln_help.IntersectionLinePlane(pl_cr7_cr_0);

		var l = pt_help_2[0] - pt_help_1[0];
		var m = pt_help_2[1] - pt_help_1[1];
		var n = pt_help_2[2] - pt_help_1[2];
		
		crown[15] = new Point3D(pt_help_2[0] - l*starFacet, 
								pt_help_2[1] - m*starFacet, 
								pt_help_2[2] - n*starFacet);

		// Пл-ть. проходящая через вершину 15 короны параллельно пл-ти OXY
		var pl_middle = new Plane3D(); 
		pl_middle.CreatePlaneNormalDistOXYZ(Z1, crown[15][2]);
		
		var plane_A = new Plane3D; // уравнение плоскости грани A
		plane_A.CreatePlaneVectorTwoPoints(new Vector3D(0,1,0), girdle[48], crown[6]);
		
		// Находим координаты вершины короны 14 
		crown[14] = pl_middle.IntersectionThreePlanes(plane_A, plane_B);
		
		//  Находим координаты середины отрезка  
		// заключенного между вершинами короны 14 и 15
		var pt = new Point3D((crown[14][0] + crown[15][0])/2.0, (crown[14][1] + crown[15][1])/2.0, 1.0);
					
		// Находим уравнение вертикальной плоскости проходящей через точку pt
		var dir = new Vector3D(crown[14][0] - crown[15][0], crown[14][1] - crown[15][1], 0.0);
		dir.Normer();
		var pl_Vert = new Plane3D();
		pl_Vert.CreatePlaneNormalVectorPoint(dir, pt);
		// Пересчет координат вершины короны 7
		crown[7] = pl_table.IntersectionThreePlanes(pl_Vert, plane_B);		                               	
	}
	else
	{
		var upPoint = 0.5 * Math.tan(beta) + r/2; 
		var h_cr = 0.5 * Math.tan(beta) * (1 - t);	
		
		//  Определение уравнений касательных в заданных вершинах рундиста к самому рундисту. 
		// Для решения этой задачи поступим следующим образом. 
		// Найдем направляющий вектор отрезка, соединяющего две вершины рундиста, 
		// ближайшие к той его вершине, через которую требуется провести касательную. 
		// Причем эти две вершины, через которые проходит отрезок, должны лежать 
		//  по разные стороны от вершины рундиста через которую проводится касательная.  
		// Исходя из построенного отрезка, находим его направляющий вектор. 
		// Теперь у нас есть все необходимые составляющие, чтобы составить уравнение 
		// касательной к рундисту на плоскости – направляющий вектор касательной и точка (вершина рундиста),
		// через которую эта касательная проходит.	
		
		// Касательные к рундисту в его вершинах <b>56</b> и <b>0</b>
		var ln_g56 = new Line2D();
		ln_g56.CreateLineVectorPoint(new Vector2D(girdle[57][0] - girdle[55][0],girdle[57][1] - girdle[55][1]),
									   new Point2D(girdle[56][0], girdle[56][1]));
									   
		var ln_g0 = new Line2D();
		ln_g0.CreateLineVectorPoint(new Vector2D(girdle[1][0] - girdle[63][0], girdle[1][1] - girdle[63][1]),
									   new Point2D(girdle[0][0], girdle[0][1]));
		// Находим точку пересечения касательных
		var point = ln_g56.IntersectionTwoLines(ln_g0);	
		
		// При расчете мы учитываем, что ширина огранки равна 1, а ширина площадки равна t.
		
		// Коэффициент пропорциональности m задаем следующей формулой:	
		
		// Точки звезды короны пропорциональны этой точке относительно upPoint
		var mm = (1 + SQRT2) / 2 * t;
		if ( dSquare <= 0 ) 
			mm = mm + dSquare * (mm - 1 + t);
		else 
			mm = mm + dSquare * (1 - mm);
		
		// Если dSquare = 0, то m =(1 + √2)*(t/2)

		// Используя значение парметра dSquare находим координаты вершины
		// короны <b>15</b>. Впоследствии эти координаты будут пересчитаны.	
		var dir = new Vector3D(point[0], point[1], r/2 - upPoint);
		crown[15] = new Point3D(mm * dir[0], mm * dir[1], upPoint + mm * dir[2]);
		
		// Определяем координаты вершины <b>6</b> короны
		crown[6] = new Point3D(-lw * table_length / 2, 0.0, h_cr + r/2);
		
		//  Рассчитываем уравнение плоскости в которой лежит грань <b>g48-cr14-cr6-cr13</b> с учетом того, 
		// что эта плоскость параллельна координатной прямой <b>OY</b>.
		var plane_A = new Plane3D();
		plane_A.CreatePlaneVectorTwoPoints(Y1, girdle[48], crown[6]);
											 
		// Для того, чтобы корона огранки выглядела красивой требуется чтобы ребра проходящие через
		// вершины crown[14] и girdle[52], crown[15] и girdle[60] подходили к рундисту под прямым углом.
		// Это также касается всех остальных подобных ребер короны.
											 
		// Вектора идущие вдоль линий касательных к рундисту в его вершинах <b>52</b>, 60</b>
		var dir_52 = new Vector3D(girdle[53][0] - girdle[51][0], girdle[53][1] - girdle[51][1], 0);
		dir_52.Normer();
		var dir_60 = new Vector3D(girdle[61][0] - girdle[59][0], girdle[61][1] - girdle[59][1], 0);
		dir_60.Normer();
							
		//  Плоскости проходящие перпендикулярно к линиям, 
		// касательным к рундисту в его вершинах <b>52</b> и <b>60</b>
		var pl_g52 = new Plane3D();
		pl_g52.CreatePlaneNormalVectorPoint(dir_52, girdle[52]);
		var pl_g60 = new Plane3D();
		pl_g60.CreatePlaneNormalVectorPoint(dir_60, girdle[60]);
		
		// Плоскость проходящая через вершину girdle[0] и имеющую наклон beta к плоскости <b>OXY</b>.
		var plane_C = Facet(beta, girdle[60], girdle[4], girdle[0]);
		
		// Проводим горизонтальную плоскость на уровне средних вершин короны.
		// В дальнейшем будем считать, что этот уровень определяет рассчитанное 
		// (на данном этапе расчета) положение вершины <b>15</b> короны.
		var pl_middle = new Plane3D();  
		pl_middle.CreatePlaneNormalVectorPoint(Z1, crown[15]);	
		
		//  Определяем координаты вершин короны <b>14</b> 
		// и пересчитываем координаты вершины короны <b>15</b>
		crown[14] = pl_middle.IntersectionThreePlanes(plane_A, pl_g52);
		crown[15] = pl_middle.IntersectionThreePlanes(plane_C, pl_g60);
		
		var plane_B = new Plane3D(); // Плоскость <b>B</b> короны
		plane_B.CreatePlaneThreePoints(girdle[56], crown[14], crown[15]);	
		
		// Горизонтальная плоскость на уровне площадки
		var pl_table = new Plane3D();
		pl_table.CreatePlaneNormalDistOXYZ(Z1, h_cr + r/2);

		// Две вспомогательные плоскости.
		var OXZ = new Plane3D();
		OXZ.CreatePlaneThreePoints(new Point3D(1,0,0), new Point3D(0,0,1), new Point3D(0,0,0));	
		var OYZ = new Plane3D();
		OYZ.CreatePlaneThreePoints(new Point3D(0,0,0), new Point3D(0,0,1), new Point3D(0,1,0));
		
		// Определяем координаты вершины короны <b>0</b>.
		crown[0] = pl_table.IntersectionThreePlanes(plane_C, OYZ);	
		
		// Определяем координаты вершины короны <b>7</b>
		var pB = new Point3D( (crown[14][0] + crown[15][0])/2.0, (crown[14][1] + crown[15][1])/2.0, 1.0);
		var vec_B = new Vector3D(crown[14][0] - crown[15][0], crown[14][1] - crown[15][1], 0.0);
		var pl_B_Vert = new Plane3D();
		pl_B_Vert.CreatePlaneNormalVectorPoint(vec_B, pB);
		crown[7] = pl_table.IntersectionThreePlanes(pl_B_Vert, plane_B);
		
		// Расчет значения star_facets
		var line_cr0_cr7 = new Line2D(new Point2D(crown[0][0], crown[0][1]), new Point2D(crown[7][0], crown[7][1]));
		var pt_cr15 = new Point2D(crown[15][0], crown[15][1]);
		var pt_g60 = new Point2D(girdle[60][0], girdle[60][1]);
		var d1 = line_cr0_cr7.Distance(pt_cr15);
		var d2 = line_cr0_cr7.Distance(pt_g60);	
		star_facets = d1/d2;
	}
	// исходя из учета симметрии огранки
	crown[1] = new Point3D(-crown[7][0], crown[7][1], crown[7][2]);
	crown[2] = new Point3D(-crown[6][0], crown[6][1], crown[6][2]);
	crown[8] = new Point3D(-crown[15][0], crown[15][1], crown[15][2]);
	crown[9] = new Point3D(-crown[14][0], crown[14][1], crown[14][2]);
	crown[3] = new Point3D(crown[1][0], -crown[1][1], crown[1][2]);
	crown[4] = new Point3D(crown[0][0], -crown[0][1], crown[0][2]);
	crown[5] = new Point3D(crown[7][0], -crown[7][1], crown[7][2]);
	crown[10] = new Point3D(crown[9][0], -crown[9][1], crown[9][2]);
	crown[11] = new Point3D(crown[8][0], -crown[8][1], crown[8][2]);
	crown[12] = new Point3D(crown[15][0], -crown[15][1], crown[15][2]);
	crown[13] = new Point3D(crown[14][0], -crown[14][1], crown[14][2]);
	
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
	
	//     Pavilion
	
	var kollet = new Point3D(CuletX, CuletY, - 0.5 * Math.tan(angle_pav) - r/2);
	pavil[6] = new Point3D(kollet[0], kollet[1], kollet[2]);
	
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
	var dir_5 = new Vector2D(girdle [55][0] - girdle [57][0], girdle [55][1] - girdle [57][1]);
	dir_5.Normer();	
	
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
	line_5.CreateLineVectorPoint(dir_5, new Point2D(girdle[56][0], girdle[56][1]));
	
	var g2_pav = [6];
	g2_pav[0] = line_0.IntersectionTwoLines(line_1);
	g2_pav[1] = line_1.IntersectionTwoLines(line_2);
	g2_pav[2] = line_2.IntersectionTwoLines(line_3);
	g2_pav[3] = line_3.IntersectionTwoLines(line_4);
	g2_pav[4] = line_4.IntersectionTwoLines(line_5);
	g2_pav[5] = line_5.IntersectionTwoLines(line_0);	
	
    for (i = 0; i < 6; i++)
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

	// В массиве vertices хранятся координаты (x, y, z) всех вершин огранки подряд.
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
	
	for(i = 0; i < 7; i++)
	{
		vertices.push(pavil[i][0]);
		vertices.push(pavil[i][1]);
		vertices.push(pavil[i][2]);
	}	
	var uuu = 100;
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

function InitGirdle()
{
	// Для понимания действия параметров на форму рундиста
	// следует запустить MarquiseGirdle.html .
	// следует учесть, что параметр vp обозначен как δ .
	
	var u =  lw;
    if ( u < 0 ) 
		return null;

	var fi = Math.asin ( ( u + u ) / ( u * u + 1.) );
	var psi = fi + vp;  // δ - это угол vp

    var t = u * Math.tan(psi);
    if ( t <= 2.0) 
		return null;

	var a = ( t - 1.0 ) / ( t - 2.0 );
	var q = a - 1.;
	var b = u * ( 1.- t ) / Math.sqrt( t * t - ( t + t ) );

	// Расчет сегментов на рундисте.
	var interval_all = Math.acos ( q / a );
	var interval_0_8 = interval_all / 2 + DelAngGirdle_8;
	var interval_8_16 = interval_all - interval_0_8;

	var interval_0_4 = interval_0_8 / 2 + DelAngGirdle_4;
	var interval_4_8 = interval_0_8 - interval_0_4;

	var interval_8_12 = interval_8_16 / 2 + DelAngGirdle_12;
	var interval_12_16 = interval_8_16 - interval_8_12;

	var delta = 0;

	var i = 0;
	var fi_curr = 0.0;

	var center = new Point2D(-q, 0.0);
	var cir = new Circle2D(center, a);

	b = -b;

    var x, y, w;

	for ( i = 0; i < 17; i++ )
	{
		x = Math.cos(fi_curr);
		y = Math.sin(fi_curr);

		girdle[i] = new Point3D( (b * y)/2, (a * x - q)/2, r/2);

		if (i < 4)
		{
			delta = interval_0_4 / 4;
		}
		else if (i < 8)
		{
			delta = interval_4_8 / 4;
		}
		else if (i < 12)
		{
			delta = interval_8_12 / 4;
		}
		else
		{
			delta = interval_12_16 / 4;
		}

		fi_curr = fi_curr + delta;
	}

	girdle[16] = new Point3D(u/2, 0, r/2);

	for (i = 1; i < 16; i++)
	{
		girdle[64-i] = new Point3D(- girdle[i][0], girdle[i][1], r/2);
	}

	for (i = 1; i <= 16; i++)
	{
		girdle[16+i] = new Point3D(girdle[16-i][0], - girdle[16-i][1], r/2);
	}

	for (i = 1; i < 16; i++)
	{
		girdle[48-i] = new Point3D(- girdle[16+i][0], girdle[16+i][1], r/2);
	}
	
	girdle[48] = new Point3D(- girdle[16][0], girdle[16][1], r/2);

    // Заполняем второй уровень рундиста
    for (i = 0; i < 64; i++)
    {
		girdle[i+64] = new Point3D(girdle[i][0], girdle[i][1], -r/2);
    }
}

// Все грани (полигоны) 3D модели огранки обходим против часовой стрелки
// если смотреть на модель находясь от нее снаружи.
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

//	27, 28, 29, 93, 92, 91, 27,
	27,28,92,91,27,
	28,29,93,92,28,


	29,30,94,93,29,
	30,31,95,94,30,
	31,32,96,95,31,
	32,33,97,96,32,
	33,34,98,97,33,
	34,35,99,98,34,

//	35, 36, 37, 101, 100, 99, 35,
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

	// Верхние грани павильона
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

	148, 128, 129, 130, 131, 132, 148,
	148, 132, 133, 134, 135, 136, 148,
	149, 136, 137, 138, 139, 140, 149,
	149, 140, 141, 142, 143, 80, 149,

	// Самые нижние грани павильона
	150, 149, 80, 144, 150,
	150, 144, 88, 145, 150,
	150, 145, 104, 146, 150,
	150, 146, 112, 147, 150,
	150, 147, 120, 148, 150,
	150, 148, 136, 149, 150,
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

	// upper pavilion facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(100, 100, 150)";
		ind++;
		
		colors[ind] = "rgb(120, 120, 250)";
		ind++;
	}	
	
	// lower pavilion facets
	for (i = 0; i < 3; i++)
	{
		colors[ind] = "rgb(170, 170, 100)";
		ind++;
		colors[ind] = "rgb(200, 200, 100)";
		ind++;
	}	
};