var DEGREE = 0.01745329251994;
var M_PI =   3.14159265358979;
var SQRT2 =  1.41421356237309;

var r = 0.06;            // Толщина рундиста
var groove_pav = -0.016; //  Позволяет измененять толщину рундиста в вырезе 
                         // со стороны павильона (изменение глубины вершины g100).
//  Следующие четыре парметра позволяют изменять толщину рундиста со
// стороны короны и павильона в некоторых узловых вершинах рундиста.
// Для того чтобы изменить значения этих параметров следует выбрать
// самый маленький размер шага изменения параметров.
var CrownPaint_1 = - 0.02;   // Позволяет изменять высоту вершин g12 и g26
var CrownPaint_2 = - 0.035;  // Позволяет изменять высоту вершин g38, g46 и g50
var PavPaint_1 = -0.011;     // Позволяет изменять глубину вершин g12 и g18
var PavPaint_2 = -0.001;     // Позволяет изменять глубину вершин g34 и g42
// Форма рундиста
var vp = 9.0*DEGREE;      //  Угол, определяющий степень отклонения 
                          // кривой Ellipse_2 от окружности (см. парметры огранки груша)
var pearRt = 1.8;         // Задает отношение длина/ширина для груши
var lambda = 21.5*DEGREE; // Задает угол наклона груши
var Lh = 0.289;           // Отклонение смещения самого широкого места груши
// Корона
var crown_angle = 32*DEGREE; // Задает угол короны
var t = 0.58;                // Ширина площадки (вдоль оси X)
var table_length = 0.68;     //  Позволяет изменять положение вершины 4 короны
                             // и тем самым изменяет длину площадки (вдоль оси Y)
var dSquare = 0.12;          // Определяет положение средних вершин короны.
// Павильон
var pav_angle = 40*DEGREE;   // Задает угол павильона
var hPavFacet = 0.75;        // Задает глубину нижних вершин клиньев павильона
var culet = 0.01;            // Определяет размер калетты огранки
var CuletX = 0.0;            // Задает смещение калетты огранки вдль оси X
var CuletY = - 0.09;         // Задает смещение калетты огранки вдль оси Y
var del_hPavFacet = 0.017; //   Позволяет в небольших пределах изменять
	                       // глубину вершины p0 павильона находящейся в глубине выреза
						   
//  Следующие восемь параметров определяют положение узловых вершин.
// на рундисте огранки. Названия параметров привязаны к рисунку короны -
// к ребрам нижних клиньев и главным четырехугольным граням короны.
var DelAngGirdle_6 = -0.2*DEGREE;   // ребро короны 8 - g6
var DelAngGirdle_12 = 8.5*DEGREE;   // ребро короны 8 - g12
var DelAngGirdle_18 = 11.7*DEGREE;  // грань A короны
var DelAngGirdle_26 = -2.7*DEGREE;  // ребро короны 9 - g26
var DelAngGirdle_34 = -1.8*DEGREE;  // грань B короны
var DelAngGirdle_38 = 0.5*DEGREE;   // ребро короны 10 - g38
var DelAngGirdle_42 = 0.6*DEGREE;   // грань C короны
var DelAngGirdle_46 = 2.2*DEGREE;   // ребро короны 11 - g46

var vertices = [];
var girdle = [];
var crown = [];
var pavil = [];	

var girdle2 = [54];

var pt_Ymax = new Point2D();

function VerticesCalculation()
{
	var X1 = new Vector3D(1, 0, 0);
	var Y1 = new Vector3D(0, 1, 0);
	var Z1 = new Vector3D(0, 0, 1);
	var i;
	
	InitGirdle();

	// pt_Ymax - точка на рундисте имеющая максимальное значение координаты Y
	var upPoint = new Point3D(0.0, (girdle[50][1] + pt_Ymax[1]) / 2.0, 
											r/2 + 0.5 * Math.tan(crown_angle));

	var dir1 = new Vector3D(girdle[18][0] - upPoint[0], 
							girdle[18][1] - upPoint[1], 
							girdle[18][2] - upPoint[2]);
	crown[1] = new Point3D(upPoint[0] + t * dir1[0],
						   upPoint[1] + t * dir1[1],
						   upPoint[2] + t * dir1[2]);
	// Особым способом находим координаты вершины crown[0]
	crown[0] = new Point3D(0.0, girdle[0][1], crown[1][2]);

	// Несуществующая точка на рундисте
	var gd_0_Virtual = new Point3D(0, upPoint[1] + (crown[0][1] - upPoint[1])/t, r/2); 
	if (gd_0_Virtual[1] < pt_Ymax[1])
	{
		gd_0_Virtual[1] = pt_Ymax[1];
	}
	
	// Касательные к точкам на рундисте gd_0_Virtual и 18
	var line_0 = new Line2D(new Point2D(gd_0_Virtual[0], gd_0_Virtual[1]),
							new Point2D(gd_0_Virtual[0] + 1.0, gd_0_Virtual[1]));
	var dir_2 = new Vector2D(girdle[18+1][0] - girdle[18-1][0], 
							 girdle[18+1][1] - girdle[18-1][1]);
	var line_1 = new Line2D();					 
	line_1.CreateLineVectorPoint(dir_2, new Point2D(girdle[18][0], girdle[18][1]));
	var ptCross = line_0.IntersectionTwoLines(line_1);
	
    // точки звезды пропорциональны этим точкам относительно upPoint
    var m = (1 + SQRT2) / 2 * t;
    if ( dSquare <= 0 ) 
		m = m + dSquare * (m - 1 + t);
    else
		m = m + dSquare * (1 - m);
	// Требуется найти положение только вершины 8 короны
	
	var dir = new Vector3D(ptCross[0] - upPoint[0], ptCross[1] - upPoint[1], r/2 - upPoint[2]);
	crown[8] = new Point3D(upPoint[0] + m * dir[0], upPoint[1] + m * dir[1], upPoint[2] + m * dir[2]);
	
	//  Вектора идущие вдоль линий касательных к рундисту 
	// в его вершинах 26, 38, 46
	var vec_26 = new Vector3D(girdle[25][0] - girdle[27][0], girdle[25][1] - girdle[27][1], 0);
	vec_26.Normer();	                
	var vec_38 = new Vector3D(girdle[37][0] - girdle[39][0], girdle[37][1] - girdle[39][1], 0);
	vec_38.Normer();
	var vec_46 = new Vector3D(girdle[45][0] - girdle[47][0], girdle[45][1] - girdle[47][1], 0);
	vec_46.Normer();              
	var pl_26 = new Plane3D();
	pl_26.CreatePlaneNormalVectorPoint(vec_26, girdle[26]);
	var pl_38 = new Plane3D();
	pl_38.CreatePlaneNormalVectorPoint(vec_38, girdle[38]);
	var pl_46 = new Plane3D();
	pl_46.CreatePlaneNormalVectorPoint(vec_46, girdle[46]);	
	var table = new Plane3D();
	table.CreatePlaneNormalDistOXYZ(Z1, crown[1][2]);	
	var pl_mid = new Plane3D();
	pl_mid.CreatePlaneNormalDistOXYZ(Z1, crown[8][2]);
	
	// грань A
	var A = new Plane3D();
	A.CreatePlaneThreePoints(crown[1], crown[8], girdle[18]);
	crown[9] = pl_mid.IntersectionThreePlanes(pl_26, A);
	// Корректировка положения вершин короны 1
	var pt_A = new Point3D((crown[8][0] + crown[9][0])/2.0,
						   (crown[8][1] + crown[9][1])/2.0, 1.0);
						   
	// Находим уравнение вертикальной плоскости проходящей через точку pt_A
	var dir_8_9 = new Vector3D (crown[8][0] - crown[9][0], 
								crown[8][1] - crown[9][1], 0.0);
	dir_8_9.Normer();
	var pl_Vert_A = new Plane3D();
	pl_Vert_A.CreatePlaneNormalVectorPoint(dir_8_9, pt_A);
	
	// Находим положение вершины короны 1
	crown[1] = table.IntersectionThreePlanes(pl_Vert_A, A);	
	
	// грань B
	var B = new Plane3D();
	B.CreatePlaneThreePoints(crown[9], girdle[26], girdle[38]);
	// Находим положение вершины короны 10
	crown[10] = pl_mid.IntersectionThreePlanes(pl_38, B);
	
	// Корректировка положения вершин короны 2
	var pt_B = new Point3D((crown[9][0] + crown[10][0])/2.0, 
						   (crown[9][1] + crown[10][1])/2.0, 1.0);
	var dir_9_10 = new Vector3D(crown[9][0] - crown[10][0], 
							   crown[9][1] - crown[10][1], 0.0);
	var pl_Vert_B = new Plane3D();
	pl_Vert_B.CreatePlaneNormalVectorPoint(dir_9_10, pt_B);
	crown[2] = table.IntersectionThreePlanes(pl_Vert_B, B);
	
	// грань D
	girdle[50][2] = girdle[18][2] + CrownPaint_2;
	var pt1 = new Point3D(0.0, -table_length * t, crown[0][2]);
	var pt2 = new Point3D(1.0, -table_length * t, crown[0][2]);
	crown[4] = pt1;
	var D = new Plane3D();
	D.CreatePlaneThreePoints(girdle[50], pt1, pt2);	
	
	// грань C
	var C = new Plane3D();
	C.CreatePlaneThreePoints(crown[10], girdle[38], girdle[46]);
	// Находим положение вершины короны 11
	crown[11] = D.IntersectionThreePlanes(pl_46, C);
	// Корректировка положения вершин короны 3
	var pt_C = new Point3D((crown[10][0] + crown[11][0])/2.0, 
						   (crown[10][1] + crown[11][1])/2.0, 1.0);
	var dir_10_11 = new Vector3D(crown[10][0] - crown[11][0], 
								 crown[10][1] - crown[11][1], 0.0);
	var pl_Vert_C = new Plane3D();
	pl_Vert_C.CreatePlaneNormalVectorPoint(dir_10_11, pt_C);
	crown[3] = table.IntersectionThreePlanes(pl_Vert_C, C);	
	
	// Из условия симметрии короны
	crown[12] = new Point3D(- crown[11][0], crown[11][1], crown[11][2]);
	crown[5] =  new Point3D(- crown[3][0], crown[3][1], crown[3][2]);
	crown[6] =  new Point3D(- crown[2][0], crown[2][1], crown[2][2]);
	crown[7] =  new Point3D(- crown[1][0], crown[1][1], crown[1][2]);
	crown[13] = new Point3D(- crown[10][0], crown[10][1], crown[10][2]);
	crown[14] = new Point3D(- crown[9][0], crown[9][1], crown[9][2]);
	crown[15] = new Point3D(- crown[8][0], crown[8][1], crown[8][2]);
	
	//  Вычисление угла наклона двух симметричных относительно оси OY плоскостей в вырезе сердца. 
	//    У этих плоскостей азимуты одинаковы и равны 90 градусам.
	var vec_01 = new Vector2D(0.0, 1.0);
	var ang = Math.atan2(crown[1][2] - crown[8][2], 
		               crown[8][1] - girdle[0][1]);
	var normPlaneVector = new Vector3D(Math.sin(ang) * vec_01[0], Math.sin(ang) * vec_01[1], Math.cos(ang));
	normPlaneVector.Normer();
	
	// грань S
	var S = new Plane3D();
	S.CreatePlaneNormalVectorPoint(normPlaneVector, crown[8]);	
	
	girdle[0][0] = crown[0][0]; // Вершины girdle[0] и crown[0] имеют одно и то же положение.
	girdle[0][1] = crown[0][1];
	girdle[0][2] = crown[0][2];
	
	// Коррекции вершин рундиста 1 - 6
	for(i = 1; i < 7; i++)
	{ 
		var vertLine = new Line3D();
		vertLine.CreateLineVectorPoint(Z1, girdle[i]);
		girdle[i] = vertLine.IntersectionLinePlane(S); 
	} 
	
	// Высоту вершин рундиста 34 и 42 требуется рассчитать
	var vertLine_1 = new Line3D(girdle[34], girdle[34+100]);
	girdle[34] = vertLine_1.IntersectionLinePlane(B);
	vertLine_2 = new Line3D(girdle[42], girdle[42+100]);
	girdle[42] = vertLine_2.IntersectionLinePlane(C);
	// Высоты вершин рундиста 12, 26, 38 и 46 можно задавать
	girdle[12][2] = girdle[12][2] + CrownPaint_1;
	girdle[26][2] = girdle[26][2] + CrownPaint_1;
	girdle[38][2] = girdle[38][2] + CrownPaint_2;
	girdle[46][2] = girdle[46][2] + CrownPaint_2;
	
	Correction_girdle_crown(6, 6, 12, 8)
	Correction_girdle_crown(6, 12, 18, 8)
	Correction_girdle_crown(8, 18, 26, 9)
	Correction_girdle_crown(8, 26, 34, 9)
	Correction_girdle_crown(4, 34, 38, 10)
	Correction_girdle_crown(4, 38, 42, 10)
	Correction_girdle_crown(4, 42, 46, 11)
	Correction_girdle_crown(4, 46, 50, 11)	
	
	for (i = 1; i < 50; i++)
	{
		girdle[100-i][2] = girdle[i][2];
	}
	
	// Pavilion
	
	girdle[12+100][2] = girdle[12+100][2] - PavPaint_1;
	girdle[18+100][2] = girdle[18+100][2] - PavPaint_1;
	girdle[34+100][2] = girdle[34+100][2] - PavPaint_2;
	girdle[42+100][2] = girdle[42+100][2] - PavPaint_2;

	girdle[88+100][2] = girdle[88+100][2] - PavPaint_1;
	girdle[82+100][2] = girdle[82+100][2] - PavPaint_1;
	girdle[66+100][2] = girdle[66+100][2] - PavPaint_2;
	girdle[58+100][2] = girdle[58+100][2] - PavPaint_2;	
	
	var kollet = new Point3D(CuletX, CuletY, - Math.tan(pav_angle)/2 - r/2);
	var hp = Math.tan(pav_angle)/2;

	// Восемь касательных прямых к рундисту в его вершинах 12, 26, 38, 46, 54, 62, 74, 88
	
	// 0
	var dir_ln_0 = new Vector2D(girdle[12+1][0] - girdle[12-1][0], girdle[12+1][1] - girdle[12-1][1]);
	dir_ln_0.Normer();
	var ln_0 = new Line2D();
	ln_0.CreateLineVectorPoint(dir_ln_0, new Point2D(girdle[12][0], girdle[12][1]) );
		                            
	// 1
	var dir_ln_1 = new Vector2D(girdle[26+1][0] - girdle[26-1][0], girdle[26+1][1] - girdle[26-1][1]);
	dir_ln_1.Normer();	  
	var ln_1 = new Line2D();	
	ln_1.CreateLineVectorPoint(dir_ln_1, new Point2D(girdle[26][0], girdle[26][1]) );
		                            
	// 2
	var dir_ln_2 = new Vector2D(girdle[38+1][0] - girdle[38-1][0], girdle[38+1][1] - girdle[38-1][1]);
	dir_ln_2.Normer();
	var ln_2 = new Line2D();		
	ln_2.CreateLineVectorPoint(dir_ln_2, new Point2D(girdle[38][0], girdle[38][1]) );
		                            
	// 3
	var dir_ln_3 = new Vector2D(girdle[46+1][0] - girdle[46-1][0], girdle[46+1][1] - girdle[46-1][1]);
	dir_ln_3.Normer();
	var ln_3 = new Line2D();	
	ln_3.CreateLineVectorPoint(dir_ln_3, new Point2D(girdle[46][0], girdle[46][1]) );
		                            
	// 4
	var dir_ln_4 = new Vector2D(girdle[54+1][0] - girdle[54-1][0], girdle[54+1][1] - girdle[54-1][1]);
	dir_ln_4.Normer();
	var ln_4 = new Line2D();	
	ln_4.CreateLineVectorPoint(dir_ln_4, new Point2D(girdle[54][0], girdle[54][1]) );
		                            
	// 5
	var dir_ln_5 = new Vector2D(girdle[62+1][0] - girdle[62-1][0], girdle[62+1][1] - girdle[62-1][1]);
	dir_ln_5.Normer();
	var ln_5 = new Line2D();
	ln_5.CreateLineVectorPoint(dir_ln_5, new Point2D(girdle[62][0], girdle[62][1]) );
		              
	// 6
	var dir_ln_6 = new Vector2D(girdle[74+1][0] - girdle[74-1][0], girdle[74+1][1] - girdle[74-1][1]);
	dir_ln_6.Normer();
	var ln_6 = new Line2D();	
	ln_6.CreateLineVectorPoint(dir_ln_6, new Point2D(girdle[74][0], girdle[74][1]) );
		                            
	// 7
	var dir_ln_7 = new Vector2D(girdle[88+1][0] - girdle[88-1][0], girdle[88+1][1] - girdle[88-1][1]);
	dir_ln_7.Normer();
	var ln_7 = new Line2D();	
	ln_7.CreateLineVectorPoint(dir_ln_7, new Point2D(girdle[88][0], girdle[88][1]) );
		                            
    var point = [8]; // Точки пересечения касательных прямых 
	point[0] = ln_7.IntersectionTwoLines(ln_0);
	point[1] = ln_0.IntersectionTwoLines(ln_1);
	point[2] = ln_1.IntersectionTwoLines(ln_2);
	point[3] = ln_2.IntersectionTwoLines(ln_3);
	point[4] = ln_3.IntersectionTwoLines(ln_4);
	point[5] = ln_4.IntersectionTwoLines(ln_5);
	point[6] = ln_5.IntersectionTwoLines(ln_6);
	point[7] = ln_6.IntersectionTwoLines(ln_7);
	
	var dir_p = [];
	// Вычисление координат вершин павильона
    for (i = 1; i < 8; i++)
    {
        dir_p[i] = new Vector3D(kollet[0] - point[i][0], 
							   kollet[1] - point[i][1], 
							   kollet[2] + r/2);
		pavil[i] = new Point3D( kollet[0] - dir_p[i][0] * (1 - hPavFacet),
								kollet[1] - dir_p[i][1] * (1 - hPavFacet),
								kollet[2] - dir_p[i][2] * (1 - hPavFacet) );

		pavil[8+i] = new Point3D( kollet[0] - culet * dir_p[i][0],
								  kollet[1] - culet * dir_p[i][1],
								  kollet[2] - culet * dir_p[i][2] );
	}
	
	// Находим уравнение плоскостей павильона a и h
	var pl_a = new Plane3D();
	pl_a.CreatePlaneThreePoints(kollet, pavil[1], girdle[12+100]);
	var pl_h = new Plane3D();
	pl_h.CreatePlaneThreePoints(kollet, pavil[7], girdle[88+100]);

	// Находим вершину 0 павильона
	var pl_PavFacet = new Plane3D();
	pl_PavFacet.CreatePlaneNormalDistOXYZ(Z1, -r/2 - hp * (hPavFacet + del_hPavFacet));
		     
	pavil[0] = pl_PavFacet.IntersectionThreePlanes(pl_a, pl_h);

	// Находим вершину павильона (калетты) 8 
	var pl_culet = new Plane3D();
	pl_culet.CreatePlaneNormalDistOXYZ(Z1, pavil[10][2]);
	pavil[8] = pl_culet.IntersectionThreePlanes(pl_a, pl_h);	
	
	// Находим вершину 100 рундиста
	var p0_g106_g194 = new Plane3D(); // особым способом определенная плоскость
	p0_g106_g194.CreatePlaneThreePoints(pavil[0], girdle[106], girdle[194]);
	var line_g0_g100 = new Line3D(girdle[0], girdle[100]);
	girdle[100] = line_g0_g100.IntersectionLinePlane(p0_g106_g194);
	// Корректировка вершины 100 рундиста
	girdle[100][2] = girdle[100][2] + groove_pav;	
	
	Correction_girdle_pavilion(12, 100+0, 100+12, 0)
	Correction_girdle_pavilion(6, 100+12, 100+18, 1)
	Correction_girdle_pavilion(8, 100+18, 100+26, 1)
	Correction_girdle_pavilion(8, 100+26, 100+34, 2)
	Correction_girdle_pavilion(4, 100+34, 100+38, 2)
	Correction_girdle_pavilion(4, 100+38, 100+42, 3)
	Correction_girdle_pavilion(4, 100+42, 100+46, 3)
	Correction_girdle_pavilion(4, 100+46, 100+50, 4)
	// x < 0
	Correction_girdle_pavilion(4, 100+50, 100+54, 4)
	Correction_girdle_pavilion(4, 100+54, 100+58, 5)
	Correction_girdle_pavilion(4, 100+58, 100+62, 5)
	Correction_girdle_pavilion(4, 100+62, 100+66, 6)
	Correction_girdle_pavilion(8, 100+66, 100+74, 6)
	Correction_girdle_pavilion(8, 100+74, 100+82, 7)
	Correction_girdle_pavilion(6, 100+82, 100+88, 7)
	Correction_girdle_pavilion(12, 100+88, 100+0, 0)	
	
	for(i = 0; i < 16; i++)
	{
		vertices.push(crown[i][0]);
		vertices.push(crown[i][1]);
		vertices.push(crown[i][2]);
	}
	for(i = 1; i < 200; i++)
	{
		vertices.push(girdle[i][0]);
		vertices.push(girdle[i][1]);
		vertices.push(girdle[i][2]);
	}
	for(i = 0; i < 16; i++)
	{
		vertices.push(pavil[i][0]);
		vertices.push(pavil[i][1]);
		vertices.push(pavil[i][2]);
	}	
}

function Fill_Arc_Ellipse (n_begin, n_points, Start, Step, step)
{
	// n_begin - номер первой вершины
	// n_points - количество вершин
	var i;
	for (i = 1; i <= n_points; i++)
	{
		var angle = Start + Step * i;
		girdle2[i + n_begin] = new Point2D(Math.sin(angle), step * Math.cos(angle));
	}
}

function InitGirdle(/* pt_Ymax */)
{
	// Полагаем, что Lh = 1 / (2*pRt)
	// Из этого предположения следует:
	//    g = 2 * pRt * Lh = 1
	//    u = 2 * pRt * (1 - Lh) = 2*pRt - 1

		var i;
	// Переменные A, B и C определяют уравнение A*xx + B*y + C = 0
	var  A, B, C;
	var angle_current, delta, x, y, x_rez, y_rez;
	var rez = [2];
	//bool bRez;

	var pRt = pearRt;
	var v = pearRt * Lh - 0.5;

//	var g = 2 * pRt * Lh;  // размер по оси Y Ellipse_1
	var g = 1. + v + v;
    if (g < 0) 
		return null;
//	var u = 2 * pRt * (1 - Lh); // размер по оси Y Ellipse_2
	var u = 2*pearRt - g;
    if (u < 0)
		return null;
	// Сумма угла носика груши и угла касательной к окружности
	var psi = vp + Math.asin ( (u + u) / (u * u + 1.0));
    if (psi >= Math.PI/2) 
		return null;
    var t = u * Math.tan(psi);
    if (t <= 2) 
		return null;
	
	var a = (t - 1.) / (t - 2.);
	var s = a - 1;
	var b = u * ( 1.- t ) / Math.sqrt ( t * t - ( t + t ) );

    if ( (Math.sin(lambda) * u) > 1 ) 
		return null;
	// Находим 3x6 точек рундиста примыкающих к вырезу сердца
	// Начальное и конечное значение углов определяющих дуги эллипсов
	var Start, Finish;
	Start = - lambda - Math.PI/2 + Math.acos(Math.sin(lambda) * u );
	Finish = lambda / 2 + DelAngGirdle_18; // Почему именно так выбран конечный угол ???
	girdle2[0] = new Point2D(Math.sin(Start), g * Math.cos(Start));

	var del_ang = (Finish - Start) / 3.0;
	var g0 = Start;
	var g6 = Start + del_ang + DelAngGirdle_6;
	var g12 = Start + del_ang + del_ang + DelAngGirdle_12;
	var g18 = Finish;

	Fill_Arc_Ellipse(0, 6, Start, (g6 - g0) / 6, g);
	Fill_Arc_Ellipse(0+6, 6, g6, (g12 - g6) / 6, g);
	Fill_Arc_Ellipse(0+6+6, 6, g12, (g18 - g12) / 6, g);

	Start = Finish;  // Начало двух восьмиэлементных сегментов
	Finish = Math.PI/2 + DelAngGirdle_26 * Math.acos(s / a); // значение угла, где кончаются два 8-элементных сегмента

	var ang_down = Math.acos(s / a);
	var ang_down_gr = 180 * ang_down / Math.PI;

	if (DelAngGirdle_34 <= 0.0)
	{
		// Смещение вершины рундиста в сторону Ellipse_1
		var ang_0_34 = Math.PI/2 + DelAngGirdle_34;
//		var ang_0_34_gr = 180 * ang_0_34 / Math.PI;
		var E = new Point2D(Math.sin(ang_0_34), Math.cos(ang_0_34));
		var alpha = Math.atan2(E[1], (E[0] + s));
		var ang_34_50 = ang_down + alpha;
		var ang_34_50_gr = 180 * ang_34_50 / Math.PI;

		// Вершины рундиста лежащие на Ellipse_1
		Finish = Start + (ang_0_34 - Start) / 2.0 + DelAngGirdle_26;
		del_ang = (Finish - Start) / 8.0;

		Fill_Arc_Ellipse(18, 8, Start, del_ang, g);

		Start = Finish;
		Finish = ang_0_34;
		del_ang = (Finish - Start) / 8.0;

		Fill_Arc_Ellipse(26, 8, Start, del_ang, g);

		Start = Finish;
		del_ang = ang_34_50 / 4.0;

		var g34 = Start;
		var g38 = Start + del_ang + DelAngGirdle_38;
		var g42 = Start + del_ang + del_ang + DelAngGirdle_42;
		var g46 = Start + del_ang + del_ang + del_ang + DelAngGirdle_46;
		var g50 = Start + ang_34_50;

		// Вершины рундиста лежащие на Ellipse_2
		var j = 49;
		angle_current = Math.acos (s / a);
		var gr_angle_current = angle_current * 180.0 / Math.PI;

		for ( i = 15; i > 0; i-- )
		{
			if (i < 4)
				delta = (g38 - g34) / 4;
			else if (i < 8)
				delta = (g42 - g38) / 4;
			else if (i < 12)
				delta = (g46 - g42) / 4;
			else
				delta = (g50 - g46) / 4;

			angle_current = angle_current - delta;
			var angle_current_gr = 180 * angle_current / Math.PI;
			if (angle_current <= 0)
			{
				x = a * Math.cos(angle_current) - s;
				y = b * Math.sin(angle_current);
				
				// k - угловой коэффициент прямой
				var k = y/(x+s);
				//  Находим координаты точки,
				// лежащей на пересечении прямой с Ellipse_1
				A = g*g + k*k;
				B = 2*k*k*s;
				C = s*s*k*k - g*g;
				// x_rez и x_yez - координаты точки K
				bRez = QuadraticEquation(A, B, C, rez);
				if (rez[0] > rez[1])
					x_rez = rez[0];
				else
					x_rez = rez[1];
				y_rez = (x_rez + s)*k;
		
				girdle2[j] = new Point2D(x_rez, y_rez);
				j--;
			}
			else
			{
				girdle2[j] = new Point2D(a * Math.cos(angle_current) - s, b * Math.sin (angle_current));
				j--;
			}
		}
		// Остальные вершины
		girdle2[50] = new Point2D(0, - u);
	}
	else
	{
		// Смещение вершины рундиста в сторону носика сердца
		// DelAngGirdle_34 > 0.0
		var N = new Point2D(a * Math.cos(DelAngGirdle_34) - s, b * Math.sin(DelAngGirdle_34)); 

		// Находим точку M пересечения прямой ON с Ellipse_1
		var k = N[1]/N[0];
		var crown_angle = Math.atan2(-N[1], N[0]);

		var ang_0_34 = Math.PI/2 + crown_angle;
		var ang_34_50 = ang_down - DelAngGirdle_34;

		// Вершины рундиста лежащие на Ellipse_1
		Finish = Start + (ang_0_34 - Start) / 2.0 + DelAngGirdle_26;
		del_ang = (Finish - Start) / 8.0;

		Fill_Arc_Ellipse(18, 8, Start, del_ang, g);

		Start = Finish;
		Finish = ang_0_34;
		del_ang = (Finish - Start) / 8.0;

		for ( i = 1; i <= 8; ++ i )
		{
			if ( (Start + i * del_ang) > Math.PI/2)
			{
				var x = Math.sin(Start + i * del_ang);	// B2[0]
				var y = Math.cos(Start + i * del_ang);	// B2[1]
				var k = y / x;

				b = - b;

				A = b*b + a*a*k*k;
				B = 2*b*b*s;
				C = s*s*b*b - a*a*b*b;

				bRez = QuadraticEquation(A, B, C, rez);
				b = - b;

				var x_rez;
				if (rez[0] > rez[1])
					x_rez = rez[0];
				else
					x_rez = rez[1];

				var y_rez = k * x_rez;

				girdle2[26+i] = new Point2D(x_rez, y_rez);
			}
			else
			{
				girdle2[26+i] = new Point2D (Math.sin(Start + i*del_ang), g * Math.cos(Start + i*del_ang));
			}
		}

		Start = Math.PI/2 - crown_angle;
		del_ang = ang_34_50 / 4.0;
		var g34 = Start;
		var g38 = Start + del_ang + DelAngGirdle_38;
		var g42 = Start + del_ang + del_ang + DelAngGirdle_42;
		var g46 = Start + del_ang + del_ang + del_ang + DelAngGirdle_46;
		var g50 = Start + ang_34_50;

		// Вершины рундиста лежащие на Ellipse_2
		var j = 49;
		angle_current = Math.acos(s / a);
		for ( i = 15; i > 0; i-- )
		{
			if (i < 4)
				delta = (g38 - g34) / 4;
			else if (i < 8)
				delta = (g42 - g38) / 4;
			else if (i < 12)
				delta = (g46 - g42) / 4;
			else
				delta = (g50 - g46) / 4;

			angle_current = angle_current - delta;
			girdle2[j] = new Point2D(a * Math.cos(angle_current) - s,
									 b * Math.sin(angle_current));
			j--;
		}
		// Остальные вершины
		girdle2[50] = new Point2D(0, -u);
	}

	// Определяем координаты трех специальных точек рундиста.
    // Сдвиг по Y для центрирования груши
	var pt = new Point2D(0, g);
    var CenterOffset = g - pt[1];

//   51 - образ центра груши
//   52 - крайняя правая точка (максимальное значение x)
//   53 - крайняя верхняя точка (максимальное значение y)

    girdle2[51] = new Point2D (0, -CenterOffset);
//	girdle2[52] = new Point2D (sin(Math.PI/2 - lambda), g * cos(Math.PI/2 - lambda));
	girdle2[52] = new Point2D (Math.cos(lambda), g * Math.sin(lambda));
//	girdle2[53] = new Point2D (sin(-lambda), g * cos(-lambda));
	girdle2[53] = new Point2D (-Math.sin(lambda), g * Math.cos(lambda));
	
	// Вершина pPoint[0] определяет точку, где наинизшее значение выреза
	var v0 = new Vector2D(girdle2[0][0] - girdle2[50][0], girdle2[0][1] - girdle2[50][1]);
	v0.Normer();
	// NX и NY новые векторы координатных осей, в которых будем отображать огранку на экране
	var NX = new Vector2D(v0[1], -v0[0]);
    var NY = new Vector2D(v0[0], v0[1]);

	// Вспомогательные векторы для нахождения смещения точек рундиста
    var vStart = new Vector2D(girdle2[50][0], girdle2[50][1]);
	var vec = new Vector2D(vStart[0] - girdle2[52][0], vStart[1] - girdle2[52][1]);
	var scalar = NY.Dot(vec);
	var vTarget = new Vector2D( vStart[0], scalar );

	// Значения величины смещения точек рундиста
	var displ_x = vTarget[0] - NX.Dot(vStart);
	var displ_y = vTarget[1] - NY.Dot(vStart);

    //  Проходим по всем точкам рундиста и определяем проекции 
    // координат x и у каждой точки рундиста на оси NX и NY.
    //  Таким образом находим координаты точек рундиста в повернутой
    // системе координат направление осей которой задается векторами NX и NY.
    for (i = 0; i < 54; i++)
    {
		girdle2[i] = new Point2D( NX.Dot(new Vector2D(girdle2[i][0], girdle2[i][1])) + displ_x,
							      NY.Dot(new Vector2D(girdle2[i][0], girdle2[i][1])) + displ_y );
    }

	//  В отличие от большинства других огранок ширина огранки сердце измеряется по оси OX,
	// а длина огранки измеряется вдоль оси OY.
	// При изменении Girdle Ratio ширина огранки остается постоянной.
	// Находим коэффициент нормировки ширины и высоты сердца в горизонтальной плоскости
	// Ширина сердца (по оси OX) дллжна быть равна величине 2 * 0.5
	// Исходя из расчета рундиста получили ширину сердца равным величине 2 * girdle2[52][0]
	// Поэтому коэффициент нормировки размеров сердца в горизонтальной плоскости равен:
	var kf = 0.5 / girdle2[52][0];

	girdle[0] = new Point3D(girdle2[0][0] * kf, girdle2[0][1] * kf, r/2);
	girdle[50] = new Point3D(girdle2[50][0] * kf, girdle2[50][1] * kf, r/2);
	girdle[100] = new Point3D(girdle2[0][0] * kf, girdle2[0][1] * kf, -r/2);
	girdle[150] = new Point3D(girdle2[50][0] * kf, girdle2[50][1] * kf, -r/2);

	for (i = 1; i < 50; i++)
	{
		girdle[i] = new Point3D(girdle2[i][0] * kf, girdle2[i][1] * kf, r/2);
		girdle[100-i] = new Point3D(- girdle2[i][0] * kf, girdle2[i][1] * kf, r/2);

		// 
		girdle[i+100] = new Point3D(girdle2[i][0] * kf, girdle2[i][1] * kf, - r/2);
		girdle[200-i] = new Point3D(- girdle2[i][0] * kf, girdle2[i][1] * kf, - r/2);
	}
	
	pt_Ymax[0] = kf * girdle2[53][0];	
	pt_Ymax[1] = kf * girdle2[53][1];

	return 1;
}

// Функция осуществляющая корректировку координаты z вершин рундиста со стороны короны.
function Correction_girdle_crown(n, gd1, gd2, cr)
{
	var i;
	var crownPlane = new Plane3D();
	crownPlane.CreatePlaneThreePoints(girdle[(gd1)],girdle[(gd2)],crown[(cr)]); 
	for(i = 1; i < n; i++) 
	{ 
		var vert_line = new Line3D(girdle[i+(gd1)], girdle[100+i+(gd1)]);
		girdle[i+gd1] = vert_line.IntersectionLinePlane(crownPlane);
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
		var vert_line = new Line3D(girdle[i+(gd1)], girdle[i+(gd1) - 100]);
		girdle[i+gd1] = vert_line.IntersectionLinePlane(pavPlane);
	}
}


// Все грани (полигоны) 3D модели огранки обходим против часовой стрелки
// если смотреть на модель находясь от нее снаружи.
var index_cut =
[
	// Площадка 
	0, 7, 6, 5, 4, 3, 2, 1, 0,
	0, 1, 8, 0,
	1, 2, 9, 1,
	2, 3, 10, 2,
	3, 4, 11, 3,
	4, 5, 12, 4,
	5, 6, 13, 5,
	6, 7, 14, 6,
	7, 0, 15, 7,
	0, 8, 21, 20, 19, 18, 17, 16, 0,
	1, 9, 33, 8, 1,	
	2, 10, 49, 9, 2,
	3, 11, 57, 10, 3,
	4, 12, 65, 11, 4,
	5, 13, 73, 12, 5,
	6, 14, 81, 13, 6,
	7, 15, 97, 14, 7,
	0, 114, 113, 112, 111, 110, 109, 15, 0,
	8, 27, 26, 25, 24, 23, 22, 21, 8,
	8, 33, 32, 31, 30, 29, 28, 27, 8,
	9, 41, 40, 39, 38, 37, 36, 35, 34, 33, 9,
	9, 49, 48, 47, 46, 45, 44, 43, 42, 41, 9,
	10, 53, 52, 51, 50, 49, 10,
	10, 57, 56, 55, 54, 53, 10,
	11, 61, 60, 59, 58, 57, 11,
	11, 65, 64, 63, 62, 61, 11,
	12, 69, 68, 67, 66, 65, 12,
	12, 73, 72, 71, 70, 69, 12,
	13, 77, 76, 75, 74, 73, 13,
	13, 81, 80, 79, 78, 77, 13,
	14, 89, 88, 87, 86, 85, 84, 83, 82, 81, 14,
	14, 97, 96, 95, 94, 93, 92, 91, 90, 89, 14,
	15, 103, 102, 101, 100, 99, 98, 97, 15,
	15, 109, 108, 107, 106, 105, 104, 103, 15,
	// Рундист
	0, 16, 116, 115, 0,
	16, 17, 117, 116, 16,
	17, 18, 118, 117, 17,
	18, 19, 119, 118, 18,
	19, 20, 120, 119, 19,
	20, 21, 121, 120, 20,
	21, 22, 122, 121, 21,
	22, 23, 123, 122, 22,
	23, 24, 124, 123, 23,
	24, 25, 125, 124, 24,
	25, 26, 126, 125, 25,
	26, 27, 127, 126, 26,
	27, 28, 128, 127, 27,
	28, 29, 129, 128, 28,
	29, 30, 130, 129, 29,
	30, 31, 131, 130, 30,
	31, 32, 132, 131, 31,
	32, 33, 133, 132, 32,
	33, 34, 134, 133, 33,
	34, 35, 135, 134, 34,
	35, 36, 136, 135, 35,
	36, 37, 137, 136, 36,
	37, 38, 138, 137, 37,
	38, 39, 139, 138, 38,
	39, 40, 140, 139, 39,
	40, 41, 141, 140, 40,
	41, 42, 142, 141, 41,
	42, 43, 143, 142, 42,
	43, 44, 144, 143, 43,
	44, 45, 145, 144, 44,
	45, 46, 146, 145, 45,
	46, 47, 147, 146, 46,
	47, 48, 148, 147, 47,
	48, 49, 149, 148, 48,
	49, 50, 150, 149, 49,
	50, 51, 151, 150, 50,
	51, 52, 152, 151, 51,
	52, 53, 153, 152, 52,
	53, 54, 154, 153, 53,
	54, 55, 155, 154, 54, 
	55, 56, 156, 155, 55,
	56, 57, 157, 156, 56,
	57, 58, 158, 157, 57,
	58, 59, 159, 158, 58,
	59, 60, 160, 159, 59,
	60, 61, 161, 160, 60,
	61, 62, 162, 161, 61,
	62, 63, 163, 162, 62,
	63, 64, 164, 163, 63,
	64, 65, 165, 164, 64,
	65, 66, 166, 165, 65,
	// Левая часть рундиста
	66, 67, 167, 166, 66,
	67, 68, 168, 167, 67,
	68, 69, 169, 168, 68,
	69, 70, 170, 169, 69,
	70, 71, 171, 170, 70,
	71, 72, 172, 171, 71,
	72, 73, 173, 172, 72,
	73, 74, 174, 173, 73,
	74, 75, 175, 174, 74,
	75, 76, 176, 175, 75,
	76, 77, 177, 176, 76,
	77, 78, 178, 177, 77,
	78, 79, 179, 178, 78,
	79, 80, 180, 179, 79,
	80, 81, 181, 180, 80,
	81, 82, 182, 181, 81,
	82, 83, 183, 182, 82,
	83, 84, 184, 183, 83,
	84, 85, 185, 184, 84,
	85, 86, 186, 185, 85,
	86, 87, 187, 186, 86,
	87, 88, 188, 187, 87,
	88, 89, 189, 188, 88,
	89, 90, 190, 189, 89,
	90, 91, 191, 190, 90,
	91, 92, 192, 191, 91,
	92, 93, 193, 192, 92,
	93, 94, 194, 193, 93,
	94, 95, 195, 194, 94,
	95, 96, 196, 195, 95,
	96, 97, 197, 196, 96,
	97, 98, 198, 197, 97,
	98, 99, 199, 198, 98,
	99, 100, 200, 199, 99,
	100, 101, 201, 200, 100,
	101, 102, 202, 201, 101,
	102, 103, 203, 202, 102,
	103, 104, 204, 203, 103,
	104, 105, 205, 204, 104,
	105, 106, 206, 205, 105,
	106, 107, 207, 206, 106,
	107, 108, 208, 207, 107,
	108, 109, 209, 208, 108,
	109, 110, 210, 209, 109,
	110, 111, 211, 210, 110,
	111, 112, 212, 211, 111,
	112, 113, 213, 212, 112,
	113, 114, 214, 213, 113,
	114, 0, 115, 214, 114,
	// Павильон
	215, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 215,
	216, 127, 128, 129, 130, 131, 132, 133, 216,
	216, 133, 134, 135, 136, 137, 138, 139, 140, 141, 216,
	217, 141, 142, 143, 144, 145, 146, 147, 148, 149, 217,
	217, 149, 150, 151, 152, 153, 217,
	218, 153, 154, 155, 156, 157, 218,
	218, 157, 158, 159, 160, 161, 218,
	219, 161, 162, 163, 164, 165, 219,
	219, 165, 166, 167, 168, 169, 219,
	220, 169, 170, 171, 172, 173, 220,
	220, 173, 174, 175, 176, 177, 220,
	221, 177, 178, 179, 180, 181, 221,
	221, 181, 182, 183, 184, 185, 186, 187, 188, 189, 221,
	222, 189, 190, 191, 192, 193, 194, 195, 196, 197, 222,
	222, 197, 198, 199, 200, 201, 202, 203, 222,
	215, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 115, 215,
	223, 215, 127, 216, 224, 223,
	224, 216, 141, 217, 225, 224,
	225, 217, 153, 218, 226, 225,
	226, 218, 161, 219, 227, 226,
	227, 219, 169, 220, 228, 227,
	228, 220, 177, 221, 229, 228,
	229, 221, 189, 222, 230, 229,
	230, 222, 203, 215, 223, 230,
	223, 224, 225, 226, 227, 228, 229, 230, 223,

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
	for (i = 0; i < 9; i++)
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
	for (i = 0; i < 50; i++)
	{
		colors[ind] = "rgb(100, 100, 100)";
		ind++;
		colors[ind] = "rgb(150, 150, 150)";
		ind++;
		
	}
	
	// upper pavilion facets
	for (i = 0; i < 8; i++)
	{
		colors[ind] = "rgb(170, 170, 250)";
		ind++;
		colors[ind] = "rgb(200, 200, 250)";		
		ind++;
	}

	// lower pavilion facets
	for (i = 0; i < 4; i++)
	{
		colors[ind] = "rgb(100, 100, 250)";
		ind++;
		
		colors[ind] = "rgb(120, 120, 250)";
		ind++;
	}	
	
	// table
	colors[ind] = "rgb(170, 170, 170)";
};

// Проверка выпуклости модели
function isCorrect_Heart()
{	
	if (correct == false)
	{
		return 1;
	}
		
	var i, j;
	// Проходим по всем граням модели 
	for (i = 0; i < 34; i++)
	{
		// Первые три точки каждого многоугольника используются для создания двух 3D-векторов.
		var pt0 = new Point3D(plgs[i].vertexes[0][0], plgs[i].vertexes[0][1], plgs[i].vertexes[0][2]);
		var pt1 = new Point3D(plgs[i].vertexes[1][0], plgs[i].vertexes[1][1], plgs[i].vertexes[1][2]);
		var pt2 = new Point3D(plgs[i].vertexes[2][0], plgs[i].vertexes[2][1], plgs[i].vertexes[2][2]);		

		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(pt0, pt1, pt2);
		
		// Проходим по всем вершинам модели 
		for (j = 0; j < points.length; j++)
		{
			var pt_test = new Point3D(points[j][0], points[j][1], points[j][2]);
			var dist = plane.DistancePoint(pt_test);
			//alert (dist);
			if (dist > 0.00001)
			{
				// not convex
				return -1;
			}
		}
	}
	
	for (i = 134; i < plgs.length; i++)
	{
		// Первые три точки каждого многоугольника используются для создания двух 3D-векторов.
		var pt0 = new Point3D(plgs[i].vertexes[0][0], plgs[i].vertexes[0][1], plgs[i].vertexes[0][2]);
		var pt1 = new Point3D(plgs[i].vertexes[1][0], plgs[i].vertexes[1][1], plgs[i].vertexes[1][2]);
		var pt2 = new Point3D(plgs[i].vertexes[2][0], plgs[i].vertexes[2][1], plgs[i].vertexes[2][2]);		

		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(pt0, pt1, pt2);
		
		// Проходим по всем вершинам модели 
		for (j = 0; j < points.length; j++)
		{
			var pt_test = new Point3D(points[j][0], points[j][1], points[j][2]);
			var dist = plane.DistancePoint(pt_test);
			//alert (dist);
			if (dist > 0.00001)
			{
				// not convex
				return -1;
			}
		}
	}
}
