var DEGREE = 0.01745329251994;
var M_PI =   3.14159265358979;
var SQRT2 =  1.41421356237309;

var lw = 1.8;        // Отношение длины огранки к ее ширине

// Форма и толщиа рундиста
var r = 0.05;            // Толщина рундиста
var vp = 0.0;            // Угол, определяющий величину отклонения кривой от окружности

// Корона
var beta = 35*DEGREE;    // Угол короны 
var DeltaAngleCrown = 0.0*DEGREE; // Значение отклонения угла наклона короны
var t = 0.60;            // Ширина площадки
var table_length = 0.72; // Позволяет изменять длину площадки (вдоль оси X)
var starFacet = 0.5;

// Павильон
var hp = 0.464;               // Задает глубину павильона
var hPavFacet = 0.8;        // Определяет положение нижних вершин клиньев павильона
var CuletX = 0.00001;           // Смещение калетты вдоль оси X
var MoonFacetAngle = 53.5*DEGREE; // Угол наклона лунных граней павильона
var MoonRotateAngle = 17.9*DEGREE;  // Угол наклна плоскости planePitch

// Расстановка вершин на рундисте
var DelAngGirdle_4 = 2.0*DEGREE;   // Задает положение вершины рундиста g4
var DelAngGirdle_8 = 2.0*DEGREE;   // Задает положение вершины рундиста g8
var DelAngGirdle_12 = 2.0*DEGREE;  // Задает положение вершины рундиста g12

var vertices = [];
var girdle = [64];
var crown = [];
var pavil = [];	

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
	var nPav    = 19;
	
	// Конструируем корону

	var h = h = 0.5 * Math.tan(beta);
	var h_crown = h * (1 - t);
	
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
	// Определяем уравнения плоскостей в которых лежат грани A и B короны
	//Plane3D plane_C, plane_B;
	var plane_C = new Plane3D(); 
	plane_C.CreateInclinePlane(beta, girdle[60], girdle[4], girdle[0]);
	var plane_B = new Plane3D();
	plane_B.CreateInclinePlane(beta - DeltaAngleCrown, girdle[52], girdle[60], girdle[56]);
	
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
	
	//     Расчет координат вершин павильона огранки маркиз с лунными гранями
	
	//  Находим уравнение плоскости planePitch проходящей под заданным углом 
	// MoonRotateAngle к горизонтальной плоскости.
	var vecPitch = new Vector3D(0, 0, 1);
	vecPitch[0] = 0.0;
	vecPitch[1] = - Math.sin(MoonRotateAngle);
	vecPitch[2] = - Math.cos(MoonRotateAngle);
	vecPitch.Normer();
	var planePitch = new Plane3D();
	planePitch.CreatePlaneNormalVectorPoint(vecPitch, girdle[64+12]);

	// Находим уравнения плоскотей в которых лежат лунные грани павильона огранки
	var planeMoon1 = Facet(- MoonFacetAngle, girdle[116], girdle[120], girdle[116]);
	var planeMoon2 = Facet(- MoonFacetAngle, girdle[120], girdle[124], girdle[120]);
	var planeMoon3 = Facet(- MoonFacetAngle, girdle[124], girdle[64], girdle[124]);
	var planeMoon4 = Facet(- MoonFacetAngle, girdle[64], girdle[68], girdle[64]);
	var planeMoon5 = Facet(- MoonFacetAngle, girdle[68], girdle[72], girdle[68]);
	var planeMoon6 = Facet(- MoonFacetAngle, girdle[72], girdle[76], girdle[72]);

	//  Вершины павильона 0, 1, 2, 9, 8 находятся как точки пересечения 
	// соответствующих лунных граней с плоскостью planePitch.
	pavil[8] = planePitch.IntersectionThreePlanes(planeMoon1, planeMoon2);
	pavil[9] = planePitch.IntersectionThreePlanes(planeMoon2, planeMoon3);
	pavil[0] = planePitch.IntersectionThreePlanes(planeMoon3, planeMoon4);
	pavil[1] = planePitch.IntersectionThreePlanes(planeMoon4, planeMoon5);
	pavil[2] = planePitch.IntersectionThreePlanes(planeMoon5, planeMoon6);
	
	// исходя из учета симметрии огранки
	pavil[3] = new Point3D(pavil[2][0], -pavil[2][1], pavil[2][2]);
	pavil[4] = new Point3D(pavil[1][0], -pavil[1][1], pavil[1][2]);
	pavil[5] = new Point3D(pavil[0][0], -pavil[0][1], pavil[0][2]);
	pavil[6] = new Point3D(pavil[9][0], -pavil[9][1], pavil[9][2]);
	pavil[7] = new Point3D(pavil[8][0], -pavil[8][1], pavil[8][2]);

	// kolett - самая нижняя вершина павильона
	pavil[18] = new Point3D(CuletX, 0.0, - hp - r/2);
	
	// Горизонтальная плоскость на уровне фасет павильона
	var planeHorPav = new Plane3D();
	planeHorPav.CreatePlaneNormalDistOXYZ(Z1, - hPavFacet * hp - r/2);

	// !!! Азимуты граней павильона (НЕ лунных граней) определяются направлением касательных к рундисту.
	
	// Касательная к рундисту в вершине girdle[116]  // Грань A
	var vec_A_pav = new Vector3D(girdle[114][0] - girdle[115][0], girdle[114][1] - girdle[115][1], 0);
	vec_A_pav.Normer();
	var pl_A = new Plane3D(); // Грань A
	pl_A.CreatePlaneVectorTwoPoints(vec_A_pav, pavil[18], girdle[116]);

	// Касательная к рундисту в вершине girdle[124]
	var vec_B_pav = new Vector3D(girdle[123][0] - girdle[125][0], girdle[123][1] - girdle[125][1], 0);
	vec_B_pav.Normer();
	var pl_B = new Plane3D(); // Грань B
	pl_B.CreatePlaneVectorTwoPoints(vec_B_pav, pavil[18], pavil[9]);

	// Касательная к рундисту в вершине girdle[68]
	var vec_C_pav = new Vector3D(girdle[67][0] - girdle[69][0], girdle[67][1] - girdle[69][1], 0);
	vec_C_pav.Normer();
	var pl_C = new Plane3D(); // Грань C
	pl_C.CreatePlaneVectorTwoPoints(vec_C_pav, pavil[18], pavil[1]);

	// Касательная к рундисту в вершине girdle[76]
	var vec_D_pav = new Vector3D(girdle[77][0] - girdle[78][0], girdle[77][1] - girdle[78][1], 0);
	vec_D_pav.Normer();
	var pl_D = new Plane3D();
	pl_D.CreatePlaneVectorTwoPoints(vec_D_pav, pavil[18], girdle[76]);
	
	pavil[16] = planeHorPav.IntersectionThreePlanes(OXZ, pl_A);
	pavil[17] = planeHorPav.IntersectionThreePlanes(pl_A, pl_B);
	pavil[10] = planeHorPav.IntersectionThreePlanes(pl_B, pl_C);
	pavil[11] = planeHorPav.IntersectionThreePlanes(pl_C, pl_D);
	pavil[12] = planeHorPav.IntersectionThreePlanes(OXZ, pl_D);
	
	// исходя из учета симметрии огранки относительно плоскости OYZ
	pavil[13] = new Point3D(pavil[11][0], -pavil[11][1], pavil[11][2]);
	pavil[14] = new Point3D(pavil[10][0], -pavil[10][1], pavil[10][2]);
	pavil[15] = new Point3D(pavil[17][0], -pavil[17][1], pavil[17][2]);
	
	// Корректировка положения вершин рундиста по оси Z
	corr_gd_pav(64, 68, 0);
	corr_gd_pav(68, 72, 1);
	corr_gd_pav(72, 76, 2);
	corr_gd_pav(76, 80, 12);
	
	corr_gd_pav(80, 84, 12);
	corr_gd_pav(84, 88, 3);
	corr_gd_pav(88, 92, 4);
	corr_gd_pav(92, 96, 5);

	corr_gd_pav(96, 100, 5);
	corr_gd_pav(100, 104, 6);
	corr_gd_pav(104, 108, 7);
	corr_gd_pav(108, 112, 16);

	corr_gd_pav(112, 116, 16);
	corr_gd_pav(116, 120, 8);
	corr_gd_pav(120, 124, 9);
	corr_gd_pav(124, 64, 0);

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
	
	for(i = 0; i < 19; i++)
	{
		vertices.push(pavil[i][0]);
		vertices.push(pavil[i][1]);
		vertices.push(pavil[i][2]);
	}	
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
/*
function corr_gd_crown(gd1, gd2, gd3, gd4, cr)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(gd1, gd2, cr);
	var vert_line = new Line3D(gd3, gd4);
	var pt = vert_line.IntersectionLinePlane(planeT);
	return pt;
}

function corr_gd_pav(gd1, gd2, gd3, gd4, pav)
{
	var planeT = new Plane3D(0, 0);
	planeT.CreatePlaneThreePoints(gd1, gd2, pav);
	var vert_line = new Line3D(gd3, gd4);
	var pt = vert_line.IntersectionLinePlane(planeT);
	return pt;
}
*/
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
	// Лунные грани
	144, 80, 81, 82, 83, 84, 145, 144,
	145, 84, 85, 86, 87, 88, 146, 145,
	146, 88, 89, 90, 91, 92, 146,

	147, 100, 101, 102, 103, 104, 147,
	148, 147, 104, 105, 106, 107, 108, 148,
	149, 148, 108, 109, 110, 111, 112, 149,
	150, 149, 112, 113, 114, 115, 116, 150,
	151, 150, 116, 117, 118, 119, 120, 151,
	124, 151, 120, 121, 122, 123, 124,

	132, 133, 134, 135, 136, 152, 132,
	152, 136, 137, 138, 139, 140, 153, 152,
	153, 140, 141, 142, 143, 80, 144, 153,

	// Средние грани павильона
	154, 144, 145, 154, 
	155, 145, 146, 155,
	155, 146, 92, 155,
	156, 92, 93, 94, 95, 96, 156,

	156, 96, 97, 98, 99, 100, 156,
	157, 100, 147, 157,
	157, 147, 148, 157,
	158, 148, 149, 158,
	
	158, 149, 150, 158,
	159, 150, 151, 159,
	159, 151, 124, 159,
	160, 124, 125, 126, 127, 128, 160,

	160, 128, 129, 130, 131, 132, 160,
	161, 132, 152, 161,
	161, 152, 153, 161,
	154, 153, 144, 154,

	// Самые нижние грани павильона
	162, 154, 145, 155, 162,
	162, 155, 92, 156, 162,
	162, 156, 100, 157, 162,
	162, 157, 148, 158, 162,
	162, 158, 150, 159, 162,
	162, 159, 124, 160, 162,
	162, 160, 132, 161, 162,
	162, 161, 153, 154, 162,

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
	
	// moon facets
	for (i = 0; i < 6; i++)
	{
		colors[ind] = "rgb(170, 170, 250)";
		ind++;
		colors[ind] = "rgb(200, 200, 250)";		
		ind++;
	}

	// upper pavilion facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(100, 100, 250)";
		ind++;
		
		colors[ind] = "rgb(120, 120, 250)";
		ind++;
	}	
	
	// lower pavilion facets
	for (i = 0; i < 4; i++)
	{
		colors[ind] = "rgb(170, 170, 250)";
		ind++;
		colors[ind] = "rgb(200, 200, 250)";
		ind++;
	}	
};