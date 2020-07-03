var DEGREE = 0.01745329251994;
var M_PI =   3.14159265358979;
var SQRT2 =  1.41421356237309;

var lw = 1.0;      // Отношение длины огранки к ширине
// Рундист
var r = 0.05;     // Толщина рундиста
var del_gd = 0.02;
var rounnd_cir1 = 0.054;         // "Roundness front"
var rounnd_cir2 = 0.054;         // "Roundness flank"
var R3 = 0.11;                   // "Radius corner"
var crown_ang_gd = 35.0*DEGREE;  // то же что и ang_2 и ang_3
var pav_ang_gd = 63.0*DEGREE;    // то же что и ang_2 и ang_3
var ang_corner = 45.0*DEGREE;    // "Corner angle girdle"
var gd_segments = 0.29;          // // Основной параметр задающий размеры сегментов

// Корона
var beta = 32*DEGREE;            // Угол короны
var t = 0.60;                    // Размер площадки
var starFacets = 0.5;            // Задает положение средних вершин короны

// Павильон
var hp = 0.57;
var pavilionAngle = 56*DEGREE; // Угол наклона грани павильона примыкающей к рундисту
var virtCuletOffsetX = 0.00001*DEGREE;  // Смещение виртуальной калетты по оси OX
var virtCuletOffsetY = 0.00001*DEGREE;  // Смещение виртуальной калетты по оси OY
var pavilionFirstLevel = 0.65;  // Отношение размера  большой грани 
                                //    к максимально-возможному ( >= 0, <= 1 )
var pavilionLastLevel = 0.35;   // Отношение размера основной грани 
                                //    к максимально-возможному ( >= 0, <= 1 )
var kf_bulge_s2 = 0.5           // Задает выпуклость грани S2 с выпуклой стороны
var kf_bulge_s3 = 0.1;          // Задает выпуклость грани S3 с выпуклой стороны
var kf_flat_s2 = 0.50;          // Задает выпуклость грани S2 с плоской стороны
var kf_flat_s3 = 0.01;          // Задает выпуклость грани S2 с плоской стороны

var vertices = [];
var girdle = [];
var crown = [];
var pavil = [];	

function VerticesCalculation()
{
	var X1 = new Vector3D(1, 0, 0);
	var Y1 = new Vector3D(0, 1, 0);
	var Z1 = new Vector3D(0, 0, 1);	
	
	var i;
	var nCrown  = 16;
	var nGirdle = 80;
	var nPav    = 21;
	
	InitGirdle();
	

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

	// Конструируем павильон
    var z0 = - r/2 - hp;
	var vec_lw = new Vector3D(-lw, 1.0, 0);
	vec_lw.Normer();
	var pav = new Plane3D();
	pav.CreatePlaneVectorTwoPoints(vec_lw, girdle[8+64], new Point3D(0, 0, - r/2 - hp));

	for ( i = 0; i < 4; i++ )
    {
        var wd, w5, tg_alpha;
        if (i == 0)
		{
			// Ось X > 0
			wd = lw/2 + 0.5/lw;
            w5 = lw * 0.5;
            tg_alpha = Math.tan(pavilionAngle + virtCuletOffsetX);
		}
        else if (i == 1)
		{
			// Ось Y > 0
            w5 = 0.5;
			wd = 0.5 + 0.5 * lw * lw;
            tg_alpha = Math.tan(pavilionAngle + virtCuletOffsetY );
		}
		else if (i == 2)
		{
			// Ось X < 0
			wd = lw/2 + 0.5/lw;
            w5 = lw * 0.5;
            tg_alpha = Math.tan(pavilionAngle - virtCuletOffsetX );
		}
		else 
		{
			// Ось Y < 0
            w5 = 0.5;
			wd = 0.5 + 0.5 * lw * lw;
            tg_alpha = Math.tan(pavilionAngle - virtCuletOffsetY );
        }
	
        var wm = wd * ( w5 * tg_alpha - hp ) / ( wd * tg_alpha - hp );
        var w4 = w5 + ( wm - w5 ) * pavilionFirstLevel;
        var z4 = - r/2 - ( w5 - w4 ) * tg_alpha;
        var w1 = wm * pavilionLastLevel; 

		var line_vert_1 = new Line3D(new Point3D(w1, 0, 0), new Point3D(w1, 0, 1));
		var line_vert_2 = new Line3D(new Point3D(0, w1, 0), new Point3D(0, w1, 1));

		var z1, kf_s2, kf_s3;

		if (i == 0)
		{
			// Ось X > 0
			var pt = line_vert_1.IntersectionLinePlane(pav);
			z1 = pt[2];

			if (virtCuletOffsetX >= 0)
			{
				kf_s2 = kf_bulge_s2;
				kf_s3 = kf_bulge_s3;
			}
			else
			{
				kf_s2 = kf_flat_s2;
				kf_s3 = kf_flat_s3;
			}
		}
		else if (i == 1)
		{
			// Ось Y > 0
			var pt = line_vert_2.IntersectionLinePlane(pav);
			z1 = pt[2];

			if (virtCuletOffsetY >= 0)
			{
				kf_s2 = kf_bulge_s2;
				kf_s3 = kf_bulge_s3;
			}
			else
			{
				kf_s2 = kf_flat_s2;
				kf_s3 = kf_flat_s3;
			}
		}
		else if (i == 2)
		{
			// Ось X < 0
			var pt = line_vert_1.IntersectionLinePlane(pav);
			z1 = pt[2];

			if (virtCuletOffsetX <= 0)
			{
				kf_s2 = kf_bulge_s2;
				kf_s3 = kf_bulge_s3;
			}
			else
			{
				kf_s2 = kf_flat_s2;
				kf_s3 = kf_flat_s3;
			}
		}
		else
		{
			// Ось Y < 0
			var pt = line_vert_2.IntersectionLinePlane(pav);
			z1 = pt[2];

			if (virtCuletOffsetY <= 0)
			{
				kf_s2 = kf_bulge_s2;
				kf_s3 = kf_bulge_s3;
			}
			else
			{
				kf_s2 = kf_flat_s2;
				kf_s3 = kf_flat_s3;
			}
        }

		var s0 = new Point2D(0.0, -z0);
		var s1 = new Point2D(w1, -z1);
		var s4 = new Point2D(w4, -z4);
		var s5 = new Point2D(w5, -r/2);

		var line0 = new Line2D(s0, s1);
		var s1_s4 = new Line2D(s1, s4);

		var del_x = (w4 - w1)/3.0;
		var w3 = w4 - del_x;
		var w2 = w4 - del_x - del_x;

		var ln_w2 = new Line2D(new Point2D(w2,0), new Point2D(w2,1));
		var ln_w3 = new Line2D(new Point2D(w3,0), new Point2D(w3,1));

		var point_1 = ln_w2.IntersectionTwoLines(line0);
		var point_0 = ln_w2.IntersectionTwoLines(s1_s4);

		// s2
		var s2 = new Point2D(w2, point_0[1] - kf_s2 * ( point_0[1] - point_1[1]));

		var line1 = new Line2D(s1, s2);
		var s2_s4 = new Line2D(s2, s4);
		var point_3 = ln_w3.IntersectionTwoLines(line1);
		var point_2 = ln_w3.IntersectionTwoLines(s2_s4);
		var s3 = new Point2D(w3, point_2[1] - kf_s3 * ( point_2[1] - point_3[1]));

        if (i == 0)
		{
			// Ось X > 0
			pavil[1] = new Point3D();
            pavil[1][0] = w4;
			pavil[1][1] = 0.0;
			pavil[1][2] = z4;

			pavil[5] = new Point3D();
			pavil[5][0] = w3;
			pavil[5][1] = 0;
			pavil[5][2] = -s3[1];

			pavil[9] = new Point3D();
			pavil[9][0] = w2;
			pavil[9][1] = 0;
			pavil[9][2] = -s2[1];

			pavil[13] = new Point3D();
			pavil[13][0] = w1;
			pavil[13][1] = 0.0;
			pavil[13][2] = z1;
		}
		else if (i == 1)
		{
			// Ось Y > 0
			pavil[0] = new Point3D();
            pavil[0][0] = 0.0;
			pavil[0][1] = w4;
			pavil[0][2] = z4;
			
			pavil[4] = new Point3D();
			pavil[4][0] = 0;
			pavil[4][1] = w3;
			pavil[4][2] = -s3[1];

			pavil[8] = new Point3D();
			pavil[8][0] = 0;
			pavil[8][1] = w2;
			pavil[8][2] = -s2[1];

			pavil[12] = new Point3D();
            pavil[12][0] = 0.0;
			pavil[12][1] = w1;
			pavil[12][2] = z1;
		}
		else if (i == 2)
		{
			// Ось X < 0
			pavil[3] = new Point3D();
            pavil[3][0] = -w4;
			pavil[3][1] = 0.0;
			pavil[3][2] = z4;

			pavil[7] = new Point3D();
			pavil[7][0] = -w3;
			pavil[7][1] = 0;
			pavil[7][2] = -s3[1];

			pavil[11] = new Point3D();
			pavil[11][0] = -w2;
			pavil[11][1] = 0;
			pavil[11][2] = -s2[1];

			pavil[15] = new Point3D();
            pavil[15][0] = -w1;
			pavil[15][1] = 0.0;
			pavil[15][2] = z1;
		}
		else
		{
			// Ось Y < 0
			pavil[2] = new Point3D();
            pavil[2][0] = 0.0;
			pavil[2][1] = -w4;
			pavil[2][2] = z4;

			pavil[6] = new Point3D();
			pavil[6][0] = 0;
			pavil[6][1] = -w3;
			pavil[6][2] = -s3[1];

			pavil[10] = new Point3D();
			pavil[10][0] = 0;
			pavil[10][1] = -w2;
			pavil[10][2] = -s2[1];

			pavil[14] = new Point3D();
            pavil[14][0] = 0.0;
			pavil[14][1] = -w1;
			pavil[14][2] = z1;
        }
    }
	pavil[16] = new Point3D();
    pavil[16][0] = 0.0;
    pavil[16][1] = 0.0;
    pavil[16][2] = -hp - r/2;

	// Конструируем нижнюю часть рундиста
	
	girdle[64][2] = girdle[64][2] + del_gd;
	girdle[66][2] = girdle[66][2] + del_gd;
	girdle[126][2] = girdle[126][2] + del_gd;

	girdle[78][2] = girdle[78][2] + del_gd;
	girdle[80][2] = girdle[80][2] + del_gd;
	girdle[82][2] = girdle[82][2] + del_gd;

	girdle[94][2] = girdle[94][2] + del_gd;
	girdle[96][2] = girdle[96][2] + del_gd;
	girdle[98][2] = girdle[98][2] + del_gd;

	girdle[110][2] = girdle[110][2] + del_gd;
	girdle[112][2] = girdle[112][2] + del_gd;
	girdle[114][2] = girdle[114][2] + del_gd;
	
	corr_gd_pav2(64, 66, 0);
	corr_gd_pav6(66, 72, 0);
	corr_gd_pav6(72, 78, 1);
	corr_gd_pav2(78, 80, 1);
	
	corr_gd_pav2(80, 82, 1);
	corr_gd_pav6(82, 88, 1);
	corr_gd_pav6(88, 94, 2);
	corr_gd_pav2(94, 96, 2);
	
	corr_gd_pav2(96, 98, 2);
	corr_gd_pav6(98, 104, 2);
	corr_gd_pav6(104, 110, 3);
	corr_gd_pav2(110, 112, 3);
	
	corr_gd_pav2(112, 114, 3);
	corr_gd_pav6(114, 120, 3);
	corr_gd_pav6(120, 126, 0);
	corr_gd_pav2(126, 64, 0);

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
	
	for(i = 0; i < 17; i++)
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
	var i;
	
	var DEGREE = 0.01745329251994;

	// Радиус большей окружности
	var R1 = rounnd_cir1/2.0 + (lw * lw)/(8.0*rounnd_cir1);
	RR1 = R1;

	// Радиус меньшей окружности
	var R2 = rounnd_cir2/2.0 + 1/(8.0*rounnd_cir2);
	RR2 = R2;
	
	// Центр большей окружности - лежит на оси OY
	var O1 = new Point2D(0, 0.5 - R1);

	// Центр меньшей окружности - лежит на оси OX
	var O2 = new Point2D(lw/2 - R2, 0);

	// Центр сопрягающей окружности
	var O3 = new Point2D(); 

	// Меньшая окружность
	var cir2 = new Circle2D(O2, R2);
	// Большая окружность
	var cir1 = new Circle2D(O1, R1);

	//  Окружности, используемые для вычисления центра 
	// сопрягающей окружности
	//var R3 = R3;
	var R2_R3 = new Circle2D(O2, R2 - R3); 
	var R1_R3 = new Circle2D(O1, R1 - R3); 

	var points = R2_R3.Intersection_TwoCircles(R1_R3);
	if (points == null)
	{
		return null;
	}
	// Центр сопрягающей окружности
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
	var cir3 = new Circle2D(O3, R3 + 0.00001); // R3+ EPSILON);

	// Проверяем пересекаются или нет окружности 
	// cir2 и cir1 с сопрягающей окружностью cir3
	// Координаты точек пересечения g и point2
	// и также f и point2 должны отличаться совершенно незначительно
	points = cir2.Intersection_TwoCircles(cir3);
	if (points == null)
	{
		return null;
	}
	var g = new Point2D(points[0][0], points[0][1]); // Точки пересечения окружностей cir1

	
	points = cir1.Intersection_TwoCircles(cir3); 
	if (points == null)
	{
		return null;
	}
	var f = new Point2D(points[0][0], points[0][1]); // и cir2 с сопрягающей окружностью cir3


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
	t[0] = O4[0] + Math.cos(ang_corner + crown_ang_gd);
	t[1] = O4[1] + Math.sin(ang_corner + crown_ang_gd);

	w[0] = O4[0] + Math.cos(ang_corner - crown_ang_gd);
	w[1] = O4[1] + Math.sin(ang_corner - crown_ang_gd);

	// Прямые используемые для нахождения границ сегментов рундиста.
	var ln_O4_t = new Line2D(O4, t);
	var ln_O4_u = new Line2D(O4, u);
	var ln_O4_w = new Line2D(O4, w);
	
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////
	t1, w1; // Точки на радиусах сопрягающей окружности cir3
			// На рисунке они лежат на сопрягающей окружности
			
	var t1 = new Point2D();
	t1[0] = O4[0] + Math.cos(ang_corner + pav_ang_gd);
	t1[1] = O4[1] + Math.sin(ang_corner + pav_ang_gd);
	var w1 = new Point2D();
	w1[0] = O4[0] + Math.cos(ang_corner - pav_ang_gd);
	w1[1] = O4[1] + Math.sin(ang_corner - pav_ang_gd);

	// Прямые используемые для нахождения границ сегментов рундиста.
	var ln_O4_t1 = new Line2D(O4, t1);
	var ln_O4_w1 = new Line2D(O4, w1);
	
	/////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////

	//  Конструируем верхнюю часть рундиста
	var s;// s, v - Точки лежащие на границе сегментов seg1 и seg2
	var v; // и также на границе сегментов seg3 и seg4

	points = cir1.Intersection_LineCircle(ln_O4_t);
	if (points == null)
	{
		return null;
	}
	if (points[0][1] > points[1][1])
	{
		s = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		s = new Point2D(points[1][0], points[1][1]);		
	}
	
	girdle[4] = new Point3D(s[0], s[1], r/2);

	points = cir2.Intersection_LineCircle(ln_O4_w);
	if (points == null)
	{
		return null;
	}
	if (points[0][0] > points[1][0])
	{
		v = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		v = new Point2D(points[1][0], points[1][1]);		
	}
	
	girdle[12] = new Point3D(v[0], v[1], r/2);
	
	//     Еще две новые точки s1 и v1 
	// так как два новых семента по сравнению с рундистом Maltese !!!
	
	points = cir1.Intersection_LineCircle(ln_O4_t1);
	if (points == null)
	{
		return null;
	}
	var s1 = new Point2D();
	if (points[0][1] > points[1][1])
	{
		s1[0] = points[0][0]; s1[1] = points[0][1];
	}
	else
	{
		s1[0] = points[1][0]; s1[1] = points[1][1]			
	}

	girdle[2] = new Point3D(s1[0], s1[1], r/2);
	
	
	points = cir2.Intersection_LineCircle(ln_O4_w1);
	if (points == null)
	{
		return null;
	}
	var v1 = new Point2D();
	if (points[0][0] > points[1][0])
	{
		v1[0] = points[0][0]; v1[1] = points[0][1];
	}
	else
	{
		v1[0] = points[1][0]; v1[1] = points[1][1];		
	}

	girdle[14] = new Point3D(v1[0], v1[1], r/2);
	
	girdle[0] = new Point3D(0, 0.5, r/2);
	girdle[8] = new Point3D(u[0], u[1], r/2);
	girdle[16] = new Point3D(lw/2, 0, r/2);

	// Остальной рундист
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
		if(x > f[0]) // Правее точки пересечения окружностей cir1 и cir3
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
		girdle[i] = new Point3D(x, y, r/2);  // !!!!
	}

	// seg1
	ang = Fi1;
	var ang_s1 = Math.atan2((s1[0] - O1[0]), (s1[1] - O1[1]));
	dAng = (Fi1 - ang_s1) / 2;

	for(i = 3; i > 1; i--)
	{
		ang = ang - dAng;
		x = Math.sin(ang)*R1 + O1[0];
		if(x > f[0]) // Правее точки пересечения окружностей cir1 и cir3
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

	// seg0
	
	ang = ang_s1;
	dAng = ang_s1 / 2;
	
	for(i = 1; i > 0; i--)
	{
		ang = ang - dAng;
		x = Math.sin(ang)*R1 + O1[0];
		if(x > f[0]) // Правее точки пересечения окружностей cir1 и cir3
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
			if (points[0][1] > points[0][1])
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

	
	
/////////////////////	

	// seg3

	var Fi3 = Math.atan2((u[1] - O2[1]), (u[0] - O2[0]));
	var Fi4 = Math.atan2((v[1] - O2[1]), (v[0] - O2[0]));
	ang = Fi3;
	dAng = (Fi3 - Fi4)/4;

	
	for(i = 9; i < 12; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R2 + O2[1];
		if(y > g[1]) // Выше точки пересечения окружностей cir2 и cir3
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

	// seg4
	
	ang = Fi4;
	var ang_v1 = Math.atan2((v1[1] - O2[1]), (v1[0] - O2[0]));
	dAng = (Fi4 - ang_v1) / 2;
	
	for(i = 13; i < 15; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R2 + O2[1];
		if (y > g[1]) // Выше точки пересечения окружностей cir2 и cir3
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

	// seg5

	ang = ang_v1;
	dAng = ang_v1 / 2;	
	
	for(i = 15; i < 16; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R2 + O2[1];
		if (y > g[1]) // Выше точки пересечения окружностей cir2 и cir3
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



// Функция осуществляющая корректировку координаты z вершин рундиста со стороны павильона.
function Correction_girdle_pavilion(n, gd1, gd2, pav)
{
	var i;
	var pavPlane = new Plane3D();
	pavPlane.CreatePlaneThreePoints(girdle[(gd1)], girdle[(gd2)], pavil[(pav)]); 
	for(i = 1; i < n; i++) 
	{
		var vert_line = new Line3D(girdle[i+(gd1)], girdle[i+(gd1) - 80]);
		girdle[i+gd1] = vert_line.IntersectionLinePlane(pavPlane);
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

function corr_gd_pav2(gd1, gd2, pav)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(girdle[gd1], girdle[gd2], pavil[pav]);
	var n = 2; //gd2 - gd1;
	var i;
	for (i = 1; i < n; i++)
	{
		var vert_line = new Line3D(girdle[gd1 + i], girdle[gd1 + i - 64]);
		var pt = vert_line.IntersectionLinePlane(planeT);
		girdle[gd1 + i][2] = pt[2];
	}	
}

function corr_gd_pav6(gd1, gd2, pav)
{
	var planeT = new Plane3D();
	planeT.CreatePlaneThreePoints(girdle[gd1], girdle[gd2], pavil[pav]);
	var n = 6; //gd2 - gd1;
	var i;
	for (i = 1; i < n; i++)
	{
		var vert_line = new Line3D(girdle[gd1 + i], girdle[gd1 + i - 64]);
		var pt = vert_line.IntersectionLinePlane(planeT);
		girdle[gd1 + i][2] = pt[2];
	}	
}

// Все грани (полигоны) 3D модели огранки обходим против часовой стрелки
// если смотреть на модель находясь от нее снаружи.
var index_cut = 
[
    // Площадка
	0,7,6,5,4,3,2,1,0,

	// Корона
	// Верхние треугольные грани
	0,1,8,0,
	1,2,9,1,
	2,3,10,2,
	3,4,11,3,
	4,5,12,4,
	5,6,13,5,
	6,7,14,6,
	7,0,15,7,

	// Четырехугольные грани
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

	144, 80, 81, 82, 144, 
	144, 82, 83, 84, 85, 86, 87, 88, 144,
	144, 88, 148, 144,
	148, 88, 152, 148,
	152, 88, 156, 152,
	160, 156, 88, 157, 160,
	157, 88, 153, 157,
	153, 88, 149, 153,
	149, 88, 145, 149,
	145, 88, 89, 90, 91, 92, 93, 94, 145,
	145, 94, 95, 96, 145,

	145, 96, 97, 98, 145,
	145, 98, 99, 100, 101, 102, 103, 104, 145,
	145, 104, 149, 145,
	149, 104, 153, 149,
	153, 104, 157, 153,
	160, 157, 104, 158, 160,
	158, 104, 154, 158,
	154, 104, 150, 154,
	150, 104, 146, 150,
	146, 104, 105, 106, 107, 108, 109, 110, 146,
	146, 110, 111, 112, 146,

	146, 112, 113, 114, 146,
	146, 114, 115, 116, 117, 118, 119, 120, 146,
	150, 146, 120, 150,
	154, 150, 120, 154,
	158, 154, 120, 158,
	160, 158, 120, 159, 160,
	159, 120, 155, 159,
	155, 120, 151, 155,
	151, 120, 147, 151,
	147, 120, 121, 122, 123, 124, 125, 126, 147,
	147, 126, 127, 128, 147,

	147, 128, 129, 130, 147,
	147, 130, 131, 132, 133, 134, 135, 136, 147,
	147, 136, 151, 147,
	151, 136, 155, 151,
	155, 136, 159, 155,
	160, 159, 136, 156, 160,
	156, 136, 152, 156,
	152, 136, 148, 152,
	148, 136, 144, 148,
	144, 136, 137, 138, 139, 140, 141, 142, 144,
	144, 142, 143, 80, 144,

	// Признак того, что граней больше нет
	-100      
];

function facet_colors()
{
	var ind = 0;
	var i;

	// table
	colors[ind] = "rgb(200, 200, 200)";
	ind++;
	
	// Корона
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(180, 180, 180)";
		ind++;
	}
	
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(160, 160, 160)";
		ind++;
	}	
	
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(140, 140, 140)"; ind++;
		colors[ind] = "rgb(170, 170, 170)"; ind++;
	}
	
	//  Рундист
	for (i = 0; i < 32; i++)
	{
		colors[ind] = "rgb(100, 100, 100)";
		ind++;
		colors[ind] = "rgb(150, 150, 150)";		
		ind++;
	}
	// Павильон

	// 1
	colors[ind] = "rgb(150, 150, 160)";
	ind++;	
	colors[ind] = "rgb(160, 160, 160)";
	ind++;
	colors[ind] = "rgb(170, 170, 170)";
	ind++;
	colors[ind] = "rgb(180, 180, 180)";
	ind++;
	colors[ind] = "rgb(190, 190, 190)";
	ind++;	
	
	colors[ind] = "rgb(200, 200, 200)";
	ind++;	
	
	colors[ind] = "rgb(190, 190, 190)";
	ind++;	
	colors[ind] = "rgb(180, 180, 180)";
	ind++;	
	colors[ind] = "rgb(170, 170, 170)";
	ind++;	
	colors[ind] = "rgb(160, 160, 160)";
	ind++;	
	colors[ind] = "rgb(155, 155, 155)";
	ind++;		
	
	// 2

	colors[ind] = "rgb(150, 150, 160)";
	ind++;	
	colors[ind] = "rgb(160, 160, 160)";
	ind++;
	colors[ind] = "rgb(170, 170, 170)";
	ind++;
	colors[ind] = "rgb(180, 180, 180)";
	ind++;
	colors[ind] = "rgb(190, 190, 190)";
	ind++;	
	
	colors[ind] = "rgb(200, 200, 230)";
	ind++;	
	
	colors[ind] = "rgb(190, 190, 190)";
	ind++;	
	colors[ind] = "rgb(180, 180, 180)";
	ind++;	
	colors[ind] = "rgb(170, 170, 170)";
	ind++;	
	colors[ind] = "rgb(160, 160, 160)";
	ind++;	
	colors[ind] = "rgb(155, 155, 155)";
	ind++;		
	
	//3
	
	colors[ind] = "rgb(150, 150, 160)";
	ind++;	
	colors[ind] = "rgb(160, 160, 160)";
	ind++;
	colors[ind] = "rgb(170, 170, 170)";
	ind++;
	colors[ind] = "rgb(180, 180, 180)";
	ind++;
	colors[ind] = "rgb(190, 190, 190)";
	ind++;	
	
	colors[ind] = "rgb(200, 200, 220)";
	ind++;	
	
	colors[ind] = "rgb(190, 190, 190)";
	ind++;	
	colors[ind] = "rgb(180, 180, 180)";
	ind++;	
	colors[ind] = "rgb(170, 170, 170)";
	ind++;	
	colors[ind] = "rgb(160, 160, 160)";
	ind++;	
	colors[ind] = "rgb(155, 155, 155)";
	ind++;		
	
	// 4
	
	colors[ind] = "rgb(150, 150, 160)";
	ind++;	
	colors[ind] = "rgb(160, 160, 160)";
	ind++;
	colors[ind] = "rgb(170, 170, 170)";
	ind++;
	colors[ind] = "rgb(180, 180, 180)";
	ind++;
	colors[ind] = "rgb(190, 190, 190)";
	ind++;	
	
	colors[ind] = "rgb(200, 200, 210)";
	ind++;	
	
	colors[ind] = "rgb(190, 190, 190)";
	ind++;	
	colors[ind] = "rgb(180, 180, 180)";
	ind++;	
	colors[ind] = "rgb(170, 170, 170)";
	ind++;	
	colors[ind] = "rgb(160, 160, 160)";
	ind++;	
	colors[ind] = "rgb(150, 150, 150)";
	ind++;		
};