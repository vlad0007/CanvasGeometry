var DEGREE = 0.01745329251994;
var M_PI =   3.14159265358979;
var SQRT2 =  1.41421356237309;

var lw = 1.0;           // Отношение длины огранки к ширине
// Рундист
var r = 0.040;          // Толщина рундиста
// Для следующих трех полей в dat.GUI не будем вводить параметры
var del_gd_1 = 0.013;   // изменяет глубину рундиста в его вершинах g64, g80 ...
var del_gd_2 = 0.004;   // изменяет глубину рундиста в его вершинах g72, g88 ...
var del_gd_3 = -0.003;  // изменяет глубину рундиста в его вершинах g68, g76 ...
// Форма рундиста задается точно также как в Girdle1_A.html и Girdle1_B.html
var rounnd_cir1 = 0.114;        // "Roundness front"
var rounnd_cir2 = 0.114;        // "Roundness flank"
var R3 = 0.034;                 // "Radius corner"
// Расстановка вершин на рундисте задается также как в Girdle1_B.html
var ang_2 = 38*DEGREE;          // "Front angle girdle"
var ang_3 = 38*DEGREE;          // "Flank angle girdle"
var ang_corner = 45.0*DEGREE;   // "Corner angle girdle"
var gd_segments = 0.18;         // Основной параметр задающий размеры сегментов
// Корона
var beta = 35*DEGREE;         // Угол наклона короны к горизонтальной плоскости
var t = 0.60;                 // Размер площадки
var starFacets = 0.5;         // Star facets
// Павильон
var hp1 = 0.32;               //"Ht.pav.level 1"
var hp2 = 0.163;              //"Ht.pav.level 2"
var del_hp1 = 0.020;           // "Del.ht.level 1"
var pav_ang_a = 54*DEGREE;    // Угол наклона грани a павильона
var pav_ang_b = 41.9*DEGREE;  // Угол наклона грани b павильона
var pav_ang_c = 54*DEGREE;    // Угол наклона грани c павильона
var hA0 = 0.192;              // Высота центральных вершины на гранях a и b 
var hA1 = 0.09;               // Высота боковых вершины на гранях a, b и c

var vertices = [];
var girdle = [64];
var crown = [];
var pavil = [];	

function VerticesCalculation()
{
	InitGirdle();
	
	var i;
	var nCrown  = 16;
	var nGirdle = 64;
	var nPav    = 21;

	// Для большей равномерности толщины рундиста со стороны павильона
	// делаем небольшие добавки (+/-) к значению величины -r/2
	var  d1 = del_gd_1;
	girdle[64+0][2] = -r/2 + d1;
	girdle[64+16][2] = -r/2 + d1;
	girdle[64+32][2] = -r/2 + d1;
	girdle[64+48][2] = -r/2 + d1;

	var d2 = del_gd_2;
	girdle[64+8][2] = -r/2 + d2;
	girdle[64+24][2] = -r/2 + d2;
	girdle[64+40][2] = -r/2 + d2;
	girdle[64+56][2] = -r/2 + d2;

	var d3 = del_gd_3;
	girdle[64+4][2] = -r/2 + d3;
	girdle[64+12][2] = -r/2 + d3;
	girdle[64+20][2] = -r/2 + d3;
	girdle[64+28][2] = -r/2 + d3;
	girdle[64+36][2] = -r/2 + d3;
	girdle[64+44][2] = -r/2 + d3;
	girdle[64+52][2] = -r/2 + d3;
	girdle[64+60][2] = -r/2 + d3;

	var X1 = new Vector3D(1, 0, 0);
	var Y1 = new Vector3D(0, 1, 0);
	var Z1 = new Vector3D(0, 0, 1);
	
	// Плоскости в которых лежат грани короны A, B и C.
	var A = Facet(beta, girdle[60], girdle[4], girdle[0]);
	var B = Facet(beta, girdle[4], girdle[12], girdle[8]);
	var C = Facet(beta, girdle[12], girdle[20], girdle[16]);
	
	// Создаем горизонтальнаую плоскость на уровне площадки
	var h_table = 0.5 * Math.tan (beta) * (1 - t);
	
	var table = new Plane3D();
	table.CreatePlaneNormalDistOXYZ(Z1, h_table + r/2);

	// Вектора идущие вдоль линий касательных к рундисту в его вершинах 4 и 12
	var dir_g4 = new Vector2D(girdle[5][0] - girdle[3][0], girdle[5][1] - girdle[3][1]);
	dir_g4.Normer();
	var dir_g12 = new Vector2D(girdle[13][0] - girdle[11][0], girdle[13][1] - girdle[11][1]);	
	dir_g12.Normer();
					  
	// Вектора идущие вдоль линий касательных к рундисту в его вершинах 0, 8 и 16
	var dir_g0 = new Vector2D(girdle[1][0] - girdle[63][0], girdle[1][1] - girdle[63][1]);
	dir_g0.Normer();				   
	var dir_g8 = new Vector2D(girdle[9][0] - girdle[7][0], girdle[9][1] - girdle[7][1]);
	dir_g8.Normer();			   
	var dir_g16 = new Vector2D(girdle[17][0] - girdle[15][0], girdle[17][1] - girdle[15][1]);
	dir_g16.Normer();			   
	
	// Плоскости проходящие перпендикулярно к касательным к рундисту в его вершинах 0, 8 и 16
	var vec_normal_g0 = new Vector3D(dir_g0[0], dir_g0[1], 0);
	vec_normal_g0.Normer();
	var pl_normal_g0 = new Plane3D();
	pl_normal_g0.CreatePlaneNormalVectorPoint(vec_normal_g0, girdle[0]);
	
	var vec_normal_g16 = new Vector3D(dir_g16[0], dir_g16[1], 0);
	vec_normal_g16.Normer();
	var pl_normal_g16 = new Plane3D();	
	pl_normal_g16.CreatePlaneNormalVectorPoint(vec_normal_g16, girdle[16]);
									  								  
	var vec_normal_g8 = new Vector3D(dir_g8[0], dir_g8[1], 0);
	vec_normal_g8.Normer();
	var pl_normal_g8 = new Plane3D();										  
	pl_normal_g8.CreatePlaneNormalVectorPoint(vec_normal_g8, girdle[8]);
									  
	//  Плоскости проходящие перпендикулярно к касательным к рундисту в его вершинах 4 и 12
	var vec_normal_g4 = new Vector3D(dir_g4[0], dir_g4[1], 0);
	vec_normal_g4.Normer();	
	var pl_normal_g4 = new Plane3D();
	pl_normal_g4.CreatePlaneNormalVectorPoint(vec_normal_g4, girdle[4]);
	
	var vec_normal_g12 = new Vector3D(dir_g12[0], dir_g12[1], 0);
	vec_normal_g12.Normer();	
	var pl_normal_g12 = new Plane3D();
	pl_normal_g12.CreatePlaneNormalVectorPoint(vec_normal_g12, girdle[12]);
											   
	// Находим вершины короны лежащие на уровне площадки
	crown[0] = table.IntersectionThreePlanes(A, pl_normal_g0);
	crown[2] = table.IntersectionThreePlanes(C, pl_normal_g16);

	// Это предварительное вычисление вершины crown[1]
	crown[1] = table.IntersectionThreePlanes(B, pl_normal_g8);

	// Вычисление по заданному значению Star Facet высоты средней
	// горизонтальной плоскости короны, которая определяет
	// высоту вершин 8, 9, 10, 11, 12, 13, 14 и 15.

	// Две вспомогательные плоскости, которые потребуются в процессе вычислений
	var plane_hor_1 = new Plane3D();
	plane_hor_1.CreatePlaneNormalDistOXYZ(Z1, 0.0);
	var plane_hor_2 = new Plane3D();
	plane_hor_2.CreatePlaneNormalDistOXYZ(Z1, 1.0);

	// Две вспомогательные точки для нахождения прямой определяемой пересечением
	// вспомогательных плоскостей с плоскостями в которых лежат грани A и B
	var point_1 = plane_hor_1.IntersectionThreePlanes(A, B);
	var point_2 = plane_hor_2.IntersectionThreePlanes(A, B);

	// Находим прямую, проходящую по линии пересечения плоскостей A и B
	var ln_A_B = new Line3D(point_1, point_2);

	// Вертикальная плоскость прохдящая касательно к рундисту в вершине girdle[4]
	var dir_n = new Vector3D(dir_g4[1], -dir_g4[0], 0.0);
	dir_n.Normer();
	var plane_tang_g4 = new Plane3D();
	plane_tang_g4.CreatePlaneNormalVectorPoint(dir_n, girdle[4]);	

	// Вертикальная плоскость проходящая через вершины короны 0 и 1 
	var plane_cr0_cr1 = new Plane3D();
	plane_cr0_cr1.CreatePlaneThreePoints(crown[1], crown[0],
	                 new Point3D(crown[0][0], crown[0][1], crown[0][2] + 1.0));
					 
	//  Вспомогательная точка point_1, лежащая на линии пересечения 
	// плоскостей A, B и plane_tang_g4
	point_1 = plane_tang_g4.IntersectionThreePlanes(A, B);			

	//  Вспомогательная точка point_2, находящаяся в месте пересечения 
	// плоскости plane_cr0_cr1 и прямой ln_A_B
	point_2 = ln_A_B.IntersectionLinePlane(plane_cr0_cr1);	
	
	//  Средняя горизонтальная плоскость короны лежит между 
	// точками point_1 и point_2 и проходит через вершину короны 8.
	// Находим координаты короны 8 (требуется только высота этой вершины).
	var ht_8_2 = point_2[2] - (point_2[2] - point_1[2]) * starFacets;
	
	// Горизонтальная плоскость проходящая на уровне вершины 8 короны.
	var plane_hor_cr8 = new Plane3D(); 
	plane_hor_cr8.CreatePlaneNormalDistOXYZ(Z1, ht_8_2);

	// Пересчитываем координаты вершины 8 короны 
	// и находим координаты вершины 9 короны.
	crown[8] = plane_hor_cr8.IntersectionThreePlanes(A, pl_normal_g4);
	crown[9] = plane_hor_cr8.IntersectionThreePlanes(C, pl_normal_g12);

	// Новое положение плоскости в которой лежит грань B
	B.CreatePlaneThreePoints(girdle[8], crown[8], crown[9]);
	
	// Точки pt_mid_1 и pt_mid_2 лежат посередине между вершинами 8 и 9
	// короны но располагаются на разной высоте (произвольной).
	var pt_mid_1 = new Point3D((crown[8][0] + crown[9][0])/2, (crown[8][1] + crown[9][1])/2, 1);
	var pt_mid_2 = new Point3D((crown[8][0] + crown[9][0])/2, (crown[8][1] + crown[9][1])/2, 2);
					 
	// Строим вертикальную плоскость проходящую 
	// через точки pt_mid_1, pt_mid_2 и вершину короны 8.
	var pl_normal_g8 = new Plane3D(); 
	pl_normal_g8.CreatePlaneThreePoints(girdle[8], pt_mid_1, pt_mid_2);

	// Пересчитываем положение вершины 1 короны
	crown[1] = B.IntersectionThreePlanes(pl_normal_g8, table);
	
	// Координаты остальных вершин короны находятся из соображений
	// симметрии огранки относительно плоскостей OXZ и OYZ	
	crown[15] = new Point3D(-crown[8][0], crown[8][1], crown[8][2]);
	crown[14] = new Point3D(-crown[9][0], crown[9][1], crown[9][2]);
	crown[7] = new Point3D(-crown[1][0], crown[1][1], crown[1][2]);
	crown[6] = new Point3D(-crown[2][0], crown[2][1], crown[2][2]);
	crown[10] = new Point3D(crown[9][0], -crown[9][1], crown[9][2]);
	crown[3] = new Point3D(crown[1][0], -crown[1][1], crown[1][2]);
	crown[4] = new Point3D(crown[0][0], -crown[0][1], crown[0][2]);
	crown[5] = new Point3D(crown[7][0], -crown[7][1], crown[7][2]);
	crown[11] = new Point3D(crown[8][0], -crown[8][1], crown[8][2]);
	crown[12] = new Point3D(crown[15][0], -crown[15][1], crown[15][2]);
	crown[13] = new Point3D(crown[14][0], -crown[14][1], crown[14][2]);
	
	// Корректировка положения вершин рундиста по оси Z со стороны короны
	girdle[1] = corr_gd_crown(girdle[0], girdle[4], girdle[1], girdle[1+64], crown[8]);
	girdle[2] = corr_gd_crown(girdle[0], girdle[4], girdle[2], girdle[2+64], crown[8]);
	girdle[3] = corr_gd_crown(girdle[0], girdle[4], girdle[3], girdle[3+64], crown[8]);
	
	girdle[5] = corr_gd_crown(girdle[4], girdle[8], girdle[5], girdle[5+64], crown[8]);
	girdle[6] = corr_gd_crown(girdle[4], girdle[8], girdle[6], girdle[6+64], crown[8]);
	girdle[7] = corr_gd_crown(girdle[4], girdle[8], girdle[7], girdle[7+64], crown[8]);
	
	girdle[9] = corr_gd_crown(girdle[8], girdle[12], girdle[9], girdle[9+64], crown[9]);
	girdle[10] = corr_gd_crown(girdle[8], girdle[12], girdle[10], girdle[10+64], crown[9]);
	girdle[11] = corr_gd_crown(girdle[8], girdle[12], girdle[11], girdle[11+64], crown[9]);	
	
	girdle[13] = corr_gd_crown(girdle[12], girdle[16], girdle[13], girdle[13+64], crown[9]);
	girdle[14] = corr_gd_crown(girdle[12], girdle[16], girdle[14], girdle[14+64], crown[9]);
	girdle[15] = corr_gd_crown(girdle[12], girdle[16], girdle[15], girdle[15+64], crown[9]);	

	for (i = 1; i < 16; i++)
	{
		girdle[16+i][2] = girdle[16-i][2];
		girdle[48-i][2] = girdle[16-i][2];
		girdle[48+i][2] = girdle[16-i][2];
	}	

	//  PAVILION
	pavil[20] = new Point3D(0, 0, -r/2 - hp1 - hp2); // калетта 
	
	// Плоскости в которых лежат грани a, b и c павильона
	var a = Facet(- pav_ang_a, girdle[60+64], girdle[4+64], girdle[64]);
	var b = Facet(- pav_ang_b, girdle[4+64], girdle[12+64], girdle[8+64]);
	var c = Facet(- pav_ang_c, girdle[12+64], girdle[20+64], girdle[16+64]);
	
	// Проводим горизонтальную плоскость на уровне точки hA0
	var planeHorA0 = new Plane3D();
	planeHorA0.CreatePlaneNormalVectorPoint(Z1, new Point3D(0, 0, - hA0 - r/2));
							 
	// Проводим горизонтальную плоскость на уровне точки hA1
	var planeHorA1 = new Plane3D();
	planeHorA1.CreatePlaneNormalVectorPoint(Z1, new Point3D(0, 0, - hA1 - r/2));
	
	var planeX0 = new Plane3D();
	planeX0.CreatePlaneNormalDistOXYZ(X1, 0);
	
	var planeY0 = new Plane3D();
	planeY0.CreatePlaneNormalDistOXYZ(Y1, 0);
	
	var planeXY = new Plane3D();
	planeXY.CreatePlaneThreePoints(new Point3D(0,0,0), new Point3D(0,0,1), girdle[64+8]);
							  	
	pavil[0] = planeHorA0.IntersectionThreePlanes(a, planeX0);
	pavil[3] = planeHorA0.IntersectionThreePlanes(c, planeY0);	
	
	var pl_hp1 = new Plane3D();
	pl_hp1.CreatePlaneNormalDistOXYZ(Z1, - hp1 - r/2);
	pavil[13] = planeXY.IntersectionThreePlanes(b, pl_hp1);

	pavil[1] = planeHorA1.IntersectionThreePlanes(a, b);
	pavil[2] = planeHorA1.IntersectionThreePlanes(c, b);	
	
	var radius = Math.sqrt(pavil[13][0] * pavil[13][0] + pavil[13][1] * pavil[13][1]);
					 
	var pl_vert_A = new Plane3D();
	pl_vert_A.CreatePlaneNormalDistOXYZ(Y1, radius);
	var pl_vert_B = new Plane3D();
	pl_vert_B.CreatePlaneNormalDistOXYZ(X1, radius);
	
	// Проводим горизонтальную плоскость на уровне вершин павильона 12 и 14
	var pl_del_hp1 = new Plane3D();
	pl_del_hp1.CreatePlaneNormalVectorPoint(Z1, new Point3D(0, 0, - hp1 - del_hp1 - r/2));
		   
	pavil[12] = pl_del_hp1.IntersectionThreePlanes(pl_vert_A, planeX0);
	pavil[14] = pl_del_hp1.IntersectionThreePlanes(pl_vert_B, planeY0);
	
	// Вершины павильона в других квадрантах
	pavil[4] =  new Point3D( pavil[2][0],   -pavil[2][1],  pavil[2][2]);
	pavil[5] =  new Point3D( pavil[1][0],   -pavil[1][1],  pavil[1][2]);
	pavil[6] =  new Point3D( pavil[0][0],   -pavil[0][1],  pavil[0][2]);
	pavil[7] =  new Point3D(-pavil[5][0],    pavil[5][1],  pavil[5][2]);
	pavil[8] =  new Point3D(-pavil[4][0],    pavil[4][1],  pavil[4][2]);
	pavil[9] =  new Point3D(-pavil[3][0],    pavil[3][1],  pavil[3][2]);
	pavil[10] = new Point3D(-pavil[2][0],    pavil[2][1],  pavil[2][2]);
	pavil[11] = new Point3D(-pavil[1][0],    pavil[1][1],  pavil[1][2]);
	pavil[15] = new Point3D( pavil[13][0],  -pavil[13][1], pavil[13][2]);
	pavil[16] = new Point3D( pavil[12][0],  -pavil[12][1], pavil[12][2]);
	pavil[17] = new Point3D(-pavil[15][0],   pavil[15][1], pavil[15][2]);
	pavil[18] = new Point3D(-pavil[14][0],   pavil[14][1], pavil[14][2]);
	pavil[19] = new Point3D(-pavil[13][0],   pavil[13][1], pavil[13][2]);

	// Корректировка положения вершин рундиста по оси Z со стороны павильона
	// Первый квадрант -  1
	girdle[1+64] = corr_gd_pav(girdle[0+64], girdle[4+64], girdle[1], girdle[1+64], pavil[1]);
	girdle[2+64] = corr_gd_pav(girdle[0+64], girdle[4+64], girdle[2], girdle[2+64], pavil[1]);
	girdle[3+64] = corr_gd_pav(girdle[0+64], girdle[4+64], girdle[3], girdle[3+64], pavil[1]);	
	// Первый квадрант -  2
	girdle[5+64] = corr_gd_pav(girdle[68], girdle[72], girdle[5], girdle[5+64], pavil[1]);
	girdle[6+64] = corr_gd_pav(girdle[68], girdle[72], girdle[6], girdle[6+64], pavil[1]);
	girdle[7+64] = corr_gd_pav(girdle[68], girdle[72], girdle[7], girdle[7+64], pavil[1]);	
	// Первый квадрант -  3
	girdle[9+64] = corr_gd_pav(girdle[72], girdle[76], girdle[9], girdle[9+64], pavil[2]);
	girdle[10+64] = corr_gd_pav(girdle[72], girdle[76], girdle[10], girdle[10+64], pavil[2]);
	girdle[11+64] = corr_gd_pav(girdle[72], girdle[76], girdle[11], girdle[11+64], pavil[2]);
	// Первый квадрант -  4
	girdle[13+64] = corr_gd_pav(girdle[76], girdle[80], girdle[13], girdle[13+64], pavil[2]);
	girdle[14+64] = corr_gd_pav(girdle[76], girdle[80], girdle[14], girdle[14+64], pavil[2]);
	girdle[15+64] = corr_gd_pav(girdle[76], girdle[80], girdle[15], girdle[15+64], pavil[2]);	
	
	// Производим вычисления положения вершин рундиста для остальных квадрантов
	for(i = 0; i < 16; i++)
	{
		girdle[32-i][0] = girdle[i][0];
		girdle[32-i][1] = -girdle[i][1];
		girdle[32-i][2] = girdle[i][2];

		girdle[96-i][0] = girdle[i+64][0];
		girdle[96-i][1] = -girdle[i+64][1];
		girdle[96-i][2] = girdle[i+64][2];
	}

	for(i = 1; i < 32; i++)
	{
		girdle[64-i][0] = -girdle[i][0];
		girdle[64-i][1] = girdle[i][1];
		girdle[64-i][2] = girdle[i][2];

		girdle[128-i][0] = -girdle[i+64][0];
		girdle[128-i][1] = girdle[i+64][1];
		girdle[128-i][2] = girdle[i+64][2];
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
	
	for(i = 0; i < 21; i++)
	{
		vertices.push(pavil[i][0]);
		vertices.push(pavil[i][1]);
		vertices.push(pavil[i][2]);
	}	
}


function InitGirdle()
{
	var i;
	
	// Радиус большей окружности
	var R1 = rounnd_cir1/2.0 + (lw * lw)/(8.0*rounnd_cir1);
	// Центр большей окружности - лежит на оси OY
	var O1 = new Point2D(0, 0.5 - R1);
	// Большая окружность
	var cir1 = new Circle2D(O1, R1);

	// Радиус меньшей окружности
	var R2 = rounnd_cir2/2.0 + 1/(8.0*rounnd_cir2);
	// Центр меньшей окружности - лежит на оси OX
	var O2 = new Point2D(lw/2 - R2, 0);
	// Меньшая окружность
	var cir2 = new Circle2D(O2, R2);

	//  Окружности, используемые для вычисления центра 
	// сопрягающей окружности
	var R2_R3 = new Circle2D(O2, R2 - R3); 
	var R1_R3 = new Circle2D(O1, R1 - R3); 

	var points = R2_R3.Intersection_TwoCircles(R1_R3);
	if (points == null)
	{
		return null;
	}
	// Центр сопрягающей окружности
	var O3 = new Point2D(); // Центр сопрягающей окружности
	if (points[0][0] > points[1][0])
	{
		O3[0] = points[0][0]; O3[1] = points[0][1]
	}
	else
	{
		O3[0] = points[1][0]; O3[1] = points[1][1]			
	}

	// Создаем сопрягающую окружность чуть большего 
	// радиуса чем R3 (для проверки)
	var cir3 = new Circle2D(O3, R3 + 0.00001); // R3 + EPSILON);

	// Проверяем пересекаются или нет окружности 
	// cir2 и cir1 с сопрягающей окружностью cir3
	// Координаты точек пересечения g и points[1]
	// и также f и points[1] должны отличаться совершенно незначительно
	// (points[1] и points[2] должны отличаться совершенно незначительно)
	
	points = cir2.Intersection_TwoCircles(cir3);
	if (points == null)
	{
		return null;
	}
	// Точка пересечения окружностей cir2 и cir3
	var G = new Point2D(points[0][0], points[0][1]); 
	
	points = cir1.Intersection_TwoCircles(cir3);
	if (points == null)
	{
		return null;
	}
	// Точка пересечения окружностей cir1 и cir3
	var F = new Point2D(points[0][0], points[0][1]); 

	// Находим положение точки на луче, 
	//который будет определять направление на котором  
	//лежит угловая вершина рундиста girdle[8]. 
	// Этот луч будет использоваться в качестве 
	//начальной прямой отсчета для углов ang_2 и ang_3.
	//var ang_corner = ang_corner;      !!!!!!!!!

	var u = new Point2D();
	u[0] = O3[0] + Math.cos(ang_corner) * R3;
	u[1] = O3[1] + Math.sin(ang_corner) * R3;
	
	var O4 = new Point2D(gd_segments * lw, gd_segments);

	var t = new Point2D();	// Точки на радиусах сопрягающей окружности cir3
	var w = new Point2D();	// На рисунке они лежат на сопрягающей окружности
	t[0] = O4[0] + Math.cos(ang_corner + ang_2);
	t[1] = O4[1] + Math.sin(ang_corner + ang_2);

	w[0] = O4[0] + Math.cos(ang_corner - ang_3);
	w[1] = O4[1] + Math.sin(ang_corner - ang_3);

	// Прямые используемые для нахождения границ сегментов рундиста.
	//Line2D ln_O4_t, ln_O4_u, ln_O4_w;
	var ln_O4_t = new Line2D(O4, t);
	var ln_O4_u = new Line2D(O4, u);
	var ln_O4_w = new Line2D(O4, w);

	//  Конструируем верхнюю часть рундиста
	var s = new Point2D(); // s, v - Точки лежащие на границе сегментов seg1 и seg2
	var v = new Point2D(); // и также на границе сегментов seg3 и seg4
	girdle[0] = new Point3D(0, 0.5, r/2);

	points = cir1.Intersection_LineCircle(ln_O4_t);
	if (points == null)
	{
		return null;
	}
	if (points[0][1] > points[1][1])
	{
		s[0] = points[0][0]; s[1] = points[0][1];
	}
	else
	{
		s[0] = points[1][0]; s[1] = points[1][1];			
	}
	
	girdle[4] = new Point3D(s[0], s[1], r/2);
	girdle[8] = new Point3D(u[0], u[1], r/2);

	points = cir2.Intersection_LineCircle(ln_O4_w);
	if (points == null)
	{
		return null;
	}
	if (points[0][0] > points[1][0])
	{
		v[0] = points[0][0]; v[1] = points[0][1];
	}
	else
	{
		v[0] = points[1][0]; v[1] = points[1][1];			
	}
	
	girdle[12] = new Point3D(v[0], v[1], r/2);
	girdle[16]= new Point3D(lw/2, 0, r/2);
	
	// Координаты остальных вершин рундиста
	var x, y;
	var Fi2 = Math.atan2((u[0] - O1[0]), (u[1] - O1[1]));
	var Fi1 = Math.atan2((s[0] - O1[0]), (s[1] - O1[1]));
	var ang = Fi2;
	var dAng = (Fi2 - Fi1)/4; // Угловой шаг

	// seg2
	for(i = 7; i > 4; i--)
	{
		ang = ang - dAng;
		x = Math.sin(ang)*R1 + O1[0];
		if(x > F[0]) // Правее точки пересечения окружностей cir1 и cir3
		{
			// Пересечение с сопрягающей окружностью cir3
			var line2 = new Line2D();
			var vector2 = new Vector2D(Math.sin(ang), Math.cos(ang));
			line2.CreateLineVectorPoint(vector2, O1);
			points = cir3.Intersection_LineCircle(line2);
			if (points == null)
			{
				return null;
			}
			if (points[0][1] > points[1][1])
			{
				y = points[0][1];
				x = points[0][0];
			}
			else
			{
				y = points[1][1];
				x = points[1][0];
			}
		}
		else
		{
			y = Math.cos(ang)*R1 + O1[1];
		}
		girdle[i] = new Point3D(x, y, r/2);
	}

	ang = Fi1;
	dAng = Fi1 / 4;
	// seg1
	for(i = 3; i > 0; i--)
	{
		ang = ang - dAng;
		x = Math.sin(ang)*R1 + O1[0];
		if(x > F[0]) // Правее точки пересечения окружностей cir1 и cir3
		{
			// Пересечение с сопрягающей окружностью cir3
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.sin(ang), Math.cos(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir3.Intersection_LineCircle(line1);
			if (points == null)
			{
				return null;
			}
			if (points[0][1] > points[1][1])
			{
				y = points[0][1];
				x = points[0][0];
			}
			else
			{
				y = points[1][1];
				x = points[1][0];
			}
		}
		else
		{
			y = Math.cos(ang)*R1 + O1[1];
		}
		girdle[i] = new Point3D(x, y, r/2);
	}

	var Fi3 = Math.atan2((u[1] - O2[1]), (u[0] - O2[0]));
	var Fi4 = Math.atan2((v[1] - O2[1]) ,(v[0] - O2[0]));
	ang = Fi3;
	dAng = (Fi3 - Fi4)/4;

	// seg3
	for(i = 9; i < 12; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R2 + O2[1];
		if(y > G[1]) // Выше точки пересечения окружностей cir2 и cir3
		{
			// Пересечение с сопрягающей окружностью cir3
			var line3 = new Line2D();
			var vector3 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line3.CreateLineVectorPoint(vector3, O2);
			points = cir3.Intersection_LineCircle(line3);
			if (points == null)
			{
				return null;
			}
			if (points[0][0] > points[1][0])
			{
				x = points[0][0];
				y = points[0][1];
			}
			else
			{
				x = points[1][0];
				y = points[1][1];
			}
		}
		else
		{
			x = Math.cos(ang)*R2 + O2[0];
		}					
		girdle[i] = new Point3D(x, y, r/2);
	}

	ang = Fi4;
	dAng = Fi4 / 4;

	// seg4
	for(i = 13; i < 16; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R2 + O2[1];
		if (y > G[1]) // Выше точки пересечения окружностей cir2 и cir3
		{
			// Пересечение с сопрягающей окружностью cir3
			var line4 = new Line2D();
			var vector4 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line4.CreateLineVectorPoint(vector4, O2);
			points = cir3.Intersection_LineCircle(line4);
			if (points == null)
			{
				return null;
			}
			if (points[0][0] > points[1][0])
			{
				x = points[0][0];
				y = points[0][1];
			}
			else
			{
				x = points[1][0];
				y = points[1][1];
			}
		}
		else
		{
			x = Math.cos(ang)*R2 + O2[0];
		}
		girdle[i] = new Point3D(x, y, r/2);
	}
	
	// Производим вычисления вершин рундиста для остальных квадрантов
	for(i = 0; i < 16; i++)
	{
		girdle[32-i] = new Point3D();
		girdle[32-i][0] = girdle[i][0];
		girdle[32-i][1] = -girdle[i][1];
		girdle[32-i][2] = r/2;
	}
	for(i = 1; i < 32; i++)
	{
		girdle[64-i] = new Point3D();
		girdle[64-i][0] = -girdle[i][0];
		girdle[64-i][1] = girdle[i][1];
		girdle[64-i][2] = r/2;
	}
	
	for (i = 0; i < 64; i++)
	{
		girdle[i+64] = new Point3D ( girdle[i][0], girdle[i][1], -r/2);
	}
}

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
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(gd1, gd2, pav);
	var vert_line = new Line3D(gd3, gd4);
	var pt = vert_line.IntersectionLinePlane(planeT);
	return pt;
}

// Все грани (полигоны) 3D модели огранки обходим против часовой стрелки
// если смотреть на модель находясь от нее снаружи.
var index_cut = [
    // Площадка
	0,7,6,5,4,3,2,1,0,
	// Верхние треугольные грани короны
	0,1,8,0,
	1,2,9,1,
	2,3,10,2,
	3,4,11,3,
	4,5,12,4,
	5,6,13,5,
	6,7,14,6,
	7,0,15,7,
	// Четырехугольные грани короны
	0,8,16,15,0,
	1,9,24,8,1,
	2,10,32,9,2,
	3,11,40,10,3,
	4,12,48,11,4,
	5,13,56,12,5,
	6,14,64,13,6,
	7,15,72,14,7,
	// Грани короны примыкающие к рундисту
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
	// Павильон 
	// Грани павильона примыкающие к рундисту
	145, 80, 81, 82, 83, 84, 145,
	145, 84, 85, 86, 87, 88, 145,
	146, 88, 89, 90, 91, 92, 146,
	146, 92, 93, 94, 95, 96, 146,
	148, 96, 97, 98, 99, 100, 148,
	148, 100, 101, 102, 103, 104, 148,
	149, 104, 105, 106, 107, 108, 149,
	149, 108, 109, 110, 111, 112, 149,
	151, 112, 113, 114, 115, 116, 151,
	151, 116, 117, 118, 119, 120, 151,
	152, 120, 121, 122, 123, 124, 152,
	152, 124, 125, 126, 127, 128, 152,
	154, 128, 129, 130, 131, 132, 154,
	154, 132, 133, 134, 135, 136, 154,
	155, 136, 137, 138, 139, 140, 155,
	155, 140, 141, 142, 143, 80, 155,
	// Восемь четырехугольных граней фасет павильона
	144, 155, 80, 145, 144,
	147, 146, 96, 148, 147,
	150, 149, 112, 151, 150,
	153, 152, 128, 154, 153,
	157, 145, 88, 146, 157,
	159, 148, 104, 149, 159,
	161, 151, 120, 152, 161,
	163, 154, 136, 155, 163,
	// Трехугольные фасеты  в средней части павильона
	156, 163, 155, 156,
	156, 155, 144, 156,
	156, 144, 145, 156,
	156, 145, 157, 156,
	158, 157, 146, 158,
	158, 146, 147, 158,
	158, 147, 148, 158,
	158, 148, 159, 158,
	160, 159, 149, 160,
	160, 149, 150, 160,
	160, 150, 151, 160,
	160, 151, 161, 160,
	162, 161, 152, 162,
	162, 152, 153, 162,
	162, 153, 154, 162,
	162, 154, 163, 162,
	// Восемь граней павильона примыкающих к колете
	164, 156, 157, 164,
	164, 157, 158, 164,
	164, 158, 159, 164,
	164, 159, 160, 164,
	164, 160, 161, 164,
	164, 161, 162, 164,
	164, 162, 163, 164,
	164, 163, 156, 164,
	// Ending flag
		// Признак того, что граней больше нет
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
	
	// pavilion upper facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(170, 170, 250)";
		ind++;		
		colors[ind] = "rgb(200, 200, 250)";
		ind++;	
	}
	
	for (i = 0; i < 4; i++)
	{
		colors[ind] = "rgb(100, 100, 100)";
		ind++;
		colors[ind] = "rgb(100, 100, 100)";
		ind++;		
	}
	
	colors[ind] = "rgb(180, 180, 180)";
	ind++;
	colors[ind] = "rgb(140, 140, 140)";
	ind++;		
	colors[ind] = "rgb(160, 160, 160)";
	ind++;
	colors[ind] = "rgb(180, 180, 180)";
	ind++;	
	
	colors[ind] = "rgb(180, 180, 180)";
	ind++;
	colors[ind] = "rgb(140, 140, 140)";
	ind++;		
	colors[ind] = "rgb(160, 160, 160)";
	ind++;
	colors[ind] = "rgb(180, 180, 180)";
	ind++;	
	
	colors[ind] = "rgb(180, 180, 180)";
	ind++;
	colors[ind] = "rgb(140, 140, 140)";
	ind++;		
	colors[ind] = "rgb(160, 160, 160)";
	ind++;
	colors[ind] = "rgb(180, 180, 180)";
	ind++;		
	
	colors[ind] = "rgb(180, 180, 180)";
	ind++;
	colors[ind] = "rgb(140, 140, 140)";
	ind++;		
	colors[ind] = "rgb(160, 160, 160)";
	ind++;
	colors[ind] = "rgb(180, 180, 180)";
	ind++;		
	
	colors[ind] = "rgb(180, 180, 200)";
	ind++;
	colors[ind] = "rgb(160, 160, 200)";
	ind++;	
	colors[ind] = "rgb(180, 180, 200)";
	ind++;
	colors[ind] = "rgb(160, 160, 200)";
	ind++;	
	colors[ind] = "rgb(180, 180, 200)";
	ind++;
	colors[ind] = "rgb(160, 160, 200)";
	ind++;	
	colors[ind] = "rgb(180, 180, 200)";
	ind++;
	colors[ind] = "rgb(160, 160, 200)";
	ind++;		
};