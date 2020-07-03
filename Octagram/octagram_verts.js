var DEGREE = 0.01745329251994;
var M_PI =   3.14159265358979;
var SQRT2 =  1.41421356237309;

var lw = 1.1;      // Отношение длины огранки к ширине
// Рундист
var r = 0.05;     // Толщина рундиста
var rounnd_cir1 = 0.094;	// "Roundness front"
var rounnd_cir2 = 0.094;	// "Roundness flank"
var R3 = 0.210;          // "Radius corner"
// Параметры определяющие расстановку вершин на рундисте со стороны короны
var dr = 0.02; // dr
var ratio = 0.65; // ratio
// Параметры определяющие расстановку вершин на рундисте со стороны павильона
var del_ang_gd_front = 10*DEGREE;
var del_ang_gd_flank = 10*DEGREE;
// Корона
var beta = 32*DEGREE;  // Угол короны
var t = 0.60;     // Размер площадки
// Павильон
var hp1 = 0.32; //"Ht.pav.level 1"
var hp2 = 0.16; //"Ht.pav.level 2"
var del_hp = 0.013; // "Del.ht.level 1"
var pav_ang_a = 62*DEGREE;	// Угол грани a павильона
var pav_ang_b = 53*DEGREE;	// Угол грани c павильона
var pav_ang_c = 41*DEGREE;	// Угол грани b павильона
var hA0 = 0.13;	// Высота центральных вершины на гранях a и b 
var hA1 = 0.107;	// Высота боковых вершины на гранях a, b и c	
var ang_rot_a2 = 12*DEGREE;
var ang_rot_b2 = 8*DEGREE;

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
	
	// Производим вычисления для остальных квадрантов рундиста
	var i;
	for(i = 0; i < 20; i++)
	{
		girdle[40-i] = new Point3D();
		girdle[40-i][0] = girdle[i][0];
		girdle[40-i][1] = -girdle[i][1];
		girdle[40-i][2] = girdle[i][2];
	}

	for(i = 1; i < 40; i++)
	{
		girdle[80-i] = new Point3D();
		girdle[80-i][0] = -girdle[i][0];
		girdle[80-i][1] = girdle[i][1];
		girdle[80-i][2] = girdle[i][2];
	}

	for(i = 0; i < 80; i++)
	{
		girdle[80+i] = new Point3D();
		girdle[80+i][0] = girdle[i][0];
		girdle[80+i][1] = girdle[i][1];
		girdle[80+i][2] = -r/2;
	}

	/////////////////////////////////////////////////
	//            Конструируем павильон            //
	/////////////////////////////////////////////////

	var kollet = new Point3D();
	kollet[0] = 0;
	kollet[1] = 0;
	kollet[2] = -r/2 - hp1 - hp2;

	pavil[20] = new Point3D(kollet[0], kollet[1], kollet[2]);

	var OYZ = new Plane3D();
	OYZ.CreatePlaneThreePoints(new Point3D(0,0,0), new Point3D(0,0,1), new Point3D(0,1,0));
	var OXZ = new Plane3D();
	OXZ.CreatePlaneThreePoints(new Point3D(0,0,0), new Point3D(0,0,1), new Point3D(1,0,0));
	var XY = new Plane3D();
	XY.CreatePlaneThreePoints(girdle[10], girdle[90], new Point3D(0,0,0));

	// Находим уравнение плоскостей фасет a, b, c
	var a = Facet(-pav_ang_a, girdle[80], girdle[84], girdle[84]);
	var b = Facet(- pav_ang_b, girdle[96], girdle[100], girdle[96]);
	var c = Facet(- pav_ang_c, crown[8], crown[9], girdle[90]);
/*	
	// Другой способ расчета уравнений плоскостей фасет a, b, c
	var a = new Plane3D();
	a.CreateInclinePlane(-pav_ang_a, girdle[80], girdle[84], girdle[84]);
	var b = new Plane3D();
	b.CreateInclinePlane(-pav_ang_b, girdle[96], girdle[100], girdle[96]);
	var c = new Plane3D();
	c.CreateInclinePlane(-pav_ang_c, crown[8], crown[9], girdle[90]);	
*/
	// Проводим горизонтальные плоскости на уровне точки hA0, hA1
	var planeHorA0 = new Plane3D();
	planeHorA0.CreatePlaneNormalVectorPoint(Z1, new Point3D(0, 0, -hA0 - r/2));
	var planeHorA1 = new Plane3D();
	planeHorA1.CreatePlaneNormalVectorPoint(Z1, new Point3D(0, 0, -hA1 - r/2));

	pavil[0] = planeHorA0.IntersectionThreePlanes(a, OYZ);
	pavil[3] = planeHorA0.IntersectionThreePlanes(b, OXZ);

	// Горизонтальная плоскость на уровне фасет павильона
	var pl_hp1 = new Plane3D();
	pl_hp1.CreatePlaneNormalVectorPoint(Z1, new Point3D(0, 0, - hp1 - r/2));
	pavil[13] = pl_hp1.IntersectionThreePlanes(c, XY);

	pavil[1] = planeHorA1.IntersectionThreePlanes(a, c);
	pavil[2] = planeHorA1.IntersectionThreePlanes(b, c);

	var az_c = Math.atan2(c.Normal()[0], c.Normal()[1]);

	var vec_a2 = new Vector3D(Math.tan(Math.PI/2 + az_c - ang_rot_a2), 1.0, 0);
	var a2 = new Plane3D();
	a2.CreatePlaneVectorTwoPoints(vec_a2, pavil[1], pavil[13]);

	var vec_b2 = new Vector3D(Math.tan(Math.PI/2 + az_c + ang_rot_b2), 1.0, 0);
	var b2 = new Plane3D();
	b2.CreatePlaneVectorTwoPoints(vec_b2, pavil[2], pavil[13]);
	
	// pavil[12], pavil[14]
	var pl_del_hp = new Plane3D();
	pl_del_hp.CreatePlaneNormalVectorPoint(Z1, new Point3D(0, 0, - hp1 - del_hp - r/2));
	pavil[12] = pl_del_hp.IntersectionThreePlanes(a2, OYZ);
	pavil[14] = pl_del_hp.IntersectionThreePlanes(b2, OXZ);

	// Вершины павильона в других квадрантах

	pavil[4] = new Point3D();
	pavil[4][0] = pavil[2][0];
	pavil[4][1] = - pavil[2][1];
	pavil[4][2] = pavil[2][2];

	pavil[5] = new Point3D();
	pavil[5][0] = pavil[1][0];
	pavil[5][1] = - pavil[1][1];
	pavil[5][2] = pavil[1][2];

	pavil[6] = new Point3D();
	pavil[6][0] = pavil[0][0];
	pavil[6][1] = - pavil[0][1];
	pavil[6][2] = pavil[0][2];

	pavil[7] = new Point3D();
	pavil[7][0] = - pavil[5][0];
	pavil[7][1] = pavil[5][1];
	pavil[7][2] = pavil[5][2];

	pavil[8] = new Point3D();
	pavil[8][0] = - pavil[4][0];
	pavil[8][1] = pavil[4][1];
	pavil[8][2] = pavil[4][2];

	pavil[9] = new Point3D();
	pavil[9][0] = - pavil[3][0];
	pavil[9][1] = pavil[3][1];
	pavil[9][2] = pavil[3][2];

	pavil[10] = new Point3D();
	pavil[10][0] = - pavil[2][0];
	pavil[10][1] = pavil[2][1];
	pavil[10][2] = pavil[2][2];

	pavil[11] = new Point3D();
	pavil[11][0] = - pavil[1][0];
	pavil[11][1] = pavil[1][1];
	pavil[11][2] = pavil[1][2];

	pavil[15] = new Point3D();
	pavil[15][0] = pavil[13][0];
	pavil[15][1] = - pavil[13][1];
	pavil[15][2] = pavil[13][2];

	pavil[16] = new Point3D();
	pavil[16][0] = pavil[12][0];
	pavil[16][1] = - pavil[12][1];
	pavil[16][2] = pavil[12][2];

	pavil[17] = new Point3D();
	pavil[17][0] = - pavil[15][0];
	pavil[17][1] = pavil[15][1];
	pavil[17][2] = pavil[15][2];

	pavil[18] = new Point3D();
	pavil[18][0] = - pavil[14][0];
	pavil[18][1] = pavil[14][1];
	pavil[18][2] = pavil[14][2];

	pavil[19] = new Point3D();
	pavil[19][0] = - pavil[13][0];
	pavil[19][1] = pavil[13][1];
	pavil[19][2] = pavil[13][2];
	
	// Коррекция вершин рундиста со стороны павильона по оси OZ.
	Correction_girdle_pavilion(4, 80, 84, 1);
	Correction_girdle_pavilion(6, 84, 90, 1);
	Correction_girdle_pavilion(6, 90, 96, 2);
	Correction_girdle_pavilion(4, 96, 100, 2);
	
	for (i = 1; i < 20; i++)
	{
		girdle[120-i][2] = girdle[i+80][2];
	}

	for (i = 1; i < 40; i++)
	{
		girdle[160-i][2] = girdle[80+i][2];
	}
	
	// Заполнение массива vertices
	for(i = 0; i < 16; i++)
	{
		vertices.push(crown[i][0]);
		vertices.push(crown[i][1]);
		vertices.push(crown[i][2]);
	}
	
	for(i = 0; i < 160; i++)
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

function InitGirdle()
{
	var i;
	
	// Радиус большей окружности
	var R1 = rounnd_cir1/2.0 + (lw * lw)/(8.0*rounnd_cir1);
	RR1 = R1;

	// Радиус меньшей окружности
	var R2 = rounnd_cir2/2.0 + 1/(8.0*rounnd_cir2);
	RR2 = R2;

	// Центр меньшей окружности - лежит на оси OX
	var O2 = new Point2D(lw/2 - R2, 0);
	OO2 = O2;

	// Центр большей окружности - лежит на оси OY
	var O1 = new Point2D(0, 0.5 - R1);
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
	// Точка пересечения окружностей cir2 и cir3
	var G = new Point2D(points[0][0], points[0][1]); 
	
	points = cir1.Intersection_TwoCircles(cir3);
	if (points == null)
	{
		return null;
	}
	// Точка пересечения окружностей cir1 и cir3
	var F = new Point2D(points[0][0], points[0][1]); 

	// Находим координаты точки O4 находящейся на дуге сопряжения
	// Эта точка будет использоваться в качестве 
	// центра окружности cir4
	
	//Point2D   O4(gd_segments * lw, gd_segments);
	var O4 = new Point2D();
	O4[0] = O3[0] + Math.cos(Math.PI/4) * R3;
	O4[1] = O3[1] + Math.sin(Math.PI/4) * R3;	
	
	// Точка с координатами P3 определяет верхний
	// правый угол прямоугольника в который вписана 
	// площадка table
	var P3 = new Point2D();
	P3[0] = (lw - (1-t))/2;
	P3[1] = t/2;	
	
	// Находим расстояние между точками O4 и P3
	var dist = O4.Distance(P3);	
	
	// К найденному расстоянию прибавляем значение параметра
	// data.dr и используем полученное значение в качестве 
	// радиуса окружности R4
	// Чем больше значение data.dr, тем больше угловые сегменты рундиста 
	var R4 = dist + dr; 
	var cir4 = new Circle2D(O4, R4);	
	
	// Проводим линию параллельную оси OX через точку pt3
	var line1 = new Line2D(P3, new Point2D(P3[0] + 1.0, P3[1]));
	
	// Проводим линию параллельную оси OY через точку P3	
	var line2 = new Line2D(P3, new Point2D(P3[0], P3[1] + 1.0));
	
	// Определяем первую ключевую точку P1
	points = cir4.Intersection_LineCircle(line1);
	if (points == null)
	{
		return null;
	}
	var P1 = new Point2D();
	if (points[0][0] < points[1][0])
	{
		P1[0] = points[0][0]; P1[1] = points[1][1];
	}
	else
	{
		P1[0] = points[1][0]; P1[1] = points[1][1];			
	}

	// Определяем вторую ключевую точку P2
	points = cir4.Intersection_LineCircle(line2);
	if (points == null)
	{
		return null;
	}
	var P2 = new Point2D();
	if (points[0][1] < points[1][1])
	{
		P2[0] = points[0][0]; P2[1] = points[0][1];
	}
	else
	{
		P2[0] = points[1][0]; P2[1] = points[1][1];			
	}

	// Точка P0 лежит посередине между точками P1 и P2
	var P0 = new Point2D();
	P0[0] = (P1[0] + P2[0])/2;
	P0[1] = (P1[1] + P2[1])/2;
	
	// Высота короны огранки
	var h_crown = Math.tan(beta)*(1 - t)/2;

	// Вершины площадки 
	crown[0] = new Point3D();
	crown[0][0] = 0;
	crown[0][1] = t/2;
	crown[0][2] = h_crown + r/2;

	crown[4] = new Point3D();
	crown[4][0] = crown[0][0];
	crown[4][1] = -crown[0][1];		
	crown[4][2] = crown[0][2];

	crown[2] = new Point3D();
	crown[2][0] = (lw - (1 - t))/2;
	crown[2][1] = 0;
	crown[2][2] = crown[0][2];

	crown[6] = new Point3D();
	crown[6][0] = -crown[2][0];
	crown[6][1] = crown[2][1];
	crown[6][2] = crown[2][2];

	crown[1] = new Point3D();
	crown[1][0] = P0[0];
	crown[1][1] = P0[1];
	crown[1][2] = crown[0][2];

	crown[3] = new Point3D();
	crown[3][0] = crown[1][0];
	crown[3][1] = -crown[1][1];
	crown[3][2] = crown[1][2];

	crown[5] = new Point3D();
	crown[5][0] = -crown[1][0];
	crown[5][1] = -crown[1][1];
	crown[5][2] = crown[1][2];

	crown[7] = new Point3D();
	crown[7][0] = -crown[1][0];
	crown[7][1] = crown[1][1];
	crown[7][2] = crown[1][2];
	
	// Главные четырехугольные грани короны
	// Конструируем planeA
	var planeA = new Plane3D();
	planeA.CreatePlaneThreePoints(crown[0],
							new Point3D(0, 0.5, r/2),
							new Point3D(P1[0], P1[1], h_crown + r/2));

	// Конструируем planeB
	var planeB = new Plane3D();
	planeB.CreatePlaneThreePoints(crown[2],
							new Point3D(lw/2, 0.0, r/2),
							new Point3D(P2[0], P2[1], h_crown + r/2));

	// Конструируем planeC
	var planeC = new Plane3D();
	planeC.CreatePlaneThreePoints(new Point3D(P1[0], P1[1], h_crown + r/2),
							new Point3D(P2[0], P2[1], h_crown + r/2),
							new Point3D(O4[0], O4[1], r/2));	
	
	// Конструируем линию пересечения плоскостей planeA и planeC
	var vector = planeA.VectorIntersectionTwoPlanes(planeC);
	var vector_AC = new Vector2D(vector[0], vector[1]);
	vector_AC.Normer();	
	var line_AC = new Line2D();
	line_AC.CreateLineVectorPoint(vector_AC, P1);
	
	// Конструируем линию пересечения плоскостей planeB и planeC
	vector = planeB.VectorIntersectionTwoPlanes(planeC);
	var vector_BC = new Vector2D(vector[0], vector[1]);
	vector_BC.Normer();
	var line_BC = new Line2D();
	line_BC.CreateLineVectorPoint(vector_BC, P2);	
	
	// Точка P4 может двигаться по прямой между точками pt0 и O4
	var P4 = new Point2D();
	P4[0] = P0[0] * ratio + (1 - ratio) * O4[0];
	P4[1] = P0[1] * ratio + (1 - ratio) * O4[1];
	var line_P4 = new Line2D();
	line_P4.CreateLineVectorPoint(new Vector2D(P1[0] - P2[0], P1[1] - P2[1]), P4);
	
	// Находим точки пересечения найденной линии line_ptVar с 
	// линиями пересечения плоскостей
	
	var A = line_AC.IntersectionTwoLines(line_P4); 
	var B = line_BC.IntersectionTwoLines(line_P4); 
	
	// Конструируем вершины звезды короны
	var Z1 = new Vector3D(0,0,1); // Вертикально направленный единичный вектор

	var lineVert_A = new Line3D(); // Вертикальная прямая проходящая через точку A
	lineVert_A.CreateLineVectorPoint(Z1, new Point3D(A[0], A[1], 0));
	crown[8] = lineVert_A.IntersectionLinePlane(planeA);

	var lineVert_B = new Line3D(); // Вертикальная прямая проходящая через точку B
	lineVert_B.CreateLineVectorPoint(Z1, new Point3D(B[0], B[1], 0));
	crown[9] = lineVert_B.IntersectionLinePlane(planeB);
	
	crown[11] = new Point3D();
	crown[11][0] = crown[8][0];
	crown[11][1] = -crown[8][1];
	crown[11][2] = crown[8][2];
	
	crown[12] = new Point3D();
	crown[12][0] = -crown[8][0];
	crown[12][1] = -crown[8][1];
	crown[12][2] = crown[8][2];
	
	crown[15] = new Point3D();
	crown[15][0] = -crown[8][0];
	crown[15][1] = crown[8][1];
	crown[15][2] = crown[8][2];	
	
	crown[10] = new Point3D();
	crown[10][0] = crown[9][0];
	crown[10][1] = -crown[9][1];
	crown[10][2] = crown[9][2];
	
	crown[13] = new Point3D();
	crown[13][0] = -crown[9][0];
	crown[13][1] = -crown[9][1];
	crown[13][2] = crown[9][2];
	
	crown[14] = new Point3D();
	crown[14][0] = -crown[9][0];
	crown[14][1] = crown[9][1];
	crown[14][2] = crown[9][2];
	
	// Вычисляем вершины рундиста со стороны короны
	// Прежде всего вычисляем координаты узловых вершин рундиста 
	girdle[0] = new Point3D();
	girdle[0][0] = 0;
	girdle[0][1] = 0.5;
	girdle[0][2] = r/2;
	
	// Точки s и v определяют границу сегментов рундиста
	// Точки лежащие на границе сегментов seg1 и seg2
	              // и также на границе сегментов seg3 и seg4

	// Уравнение прямой проходящей через центр большей окружности O1 и точку A
	var line_O1_A = new Line2D(O1, A);

	points = cir1.Intersection_LineCircle(line_O1_A);
	if (points == null)
	{
		return null;
	}
	var s = new Point2D()
	if (points[0][1] > points[1][1])
	{
		s[0] = points[0][0]; s[1] = points[0][1];
	}
	else
	{
		s[0] = points[1][0]; s[1] = points[1][1];			
	}	

	girdle[6] = new Point3D();
	girdle[6][0] = s[0];
	girdle[6][1] = s[1];
	girdle[6][2] = r/2;
	
	girdle[10] = new Point3D();
	girdle[10][0] = O4[0];
	girdle[10][1] = O4[1];
	girdle[10][2] = r/2;

	// Уравнение прямой проходящей через центр меньшей окружности O2 и точку B
	var line_O2_B = new Line2D(O2, B);

	points = cir2.Intersection_LineCircle(line_O2_B);
	if (points == null)
	{
		return null;
	}
	var v = new Point2D()
	if (points[0][0] > points[1][0])
	{
		v[0] = points[0][0]; v[1] = points[0][1];
	}
	else
	{
		v[0] = points[1][0]; v[1] = points[1][1];			
	}

	girdle[14] = new Point3D();
	girdle[14][0] = v[0];
	girdle[14][1] = v[1];
	girdle[14][2] = r/2;

	girdle[20] = new Point3D();
	girdle[20][0] = lw/2;
	girdle[20][1] = 0;
	girdle[20][2] = r/2;

	var u = new Point2D(O4[0], O4[1]);
	
	// Остальной рундист
	
	// seg2 - вершины рундиста 9, 8, 7
	var x, y;
	var Fi2 = Math.atan2((u[0] - O1[0]), (u[1] - O1[1]));
	var Fi1 = Math.atan2((s[0] - O1[0]), (s[1] - O1[1]));
	var ang = Fi2;
	var dAng = (Fi2 - Fi1)/4; // Угловой шаг
	
	for(i = 9; i > 6; i--)
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
		var lineVert = new Line3D();
		lineVert.CreateLineVectorPoint(Z1, new Point3D(x,y,0));
		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(girdle[6], girdle[10], crown[8]);
		girdle[i] = lineVert.IntersectionLinePlane(plane);
	}
	/////////////////////////////////////////////////////////////////
	
	// seg1 - вершина рундиста 5
	ang = Fi1;
	dAng = (Fi1 - del_ang_gd_front)/2;

	for(i = 5; i > 4; i--)
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
		var lineVert = new Line3D();
		lineVert.CreateLineVectorPoint(Z1, new Point3D(x,y,0));
		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(girdle[0], girdle[6], crown[8]);
		girdle[i] = lineVert.IntersectionLinePlane(plane);
	}

	// seg0 - вершины рундиста 4, 3, 2, 1
	ang = del_ang_gd_front;
	dAng = ang/4;

	for(i = 4; i > 0; i--)
	{
		x = Math.sin(ang)*R1 + O1[0];
		if(x > F[0]) // Правее точки пересечения окружностей cir1 и cir3
		{
			// Пересечение с сопрягающей окружностью cir3
			var line3 = new Line2D();
			var vector3 = new Vector2D(Math.sin(ang), Math.cos(ang));
			line3.CreateLineVectorPoint(vector3, O1);
			points = cir3.Intersection_LineCircle(line3);
			if (points == null)
			{
				return null;
			}
			if (points[0][1] > points[1][1])
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
			y = Math.cos(ang)*R1 + O1[1];
		}					
		var lineVert = new Line3D();
		lineVert.CreateLineVectorPoint(Z1, new Point3D(x,y,0));
		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(girdle[0], girdle[6], crown[8]);
		girdle[i] = lineVert.IntersectionLinePlane(plane);	

		ang = ang - dAng;
	}

	// seg3 - 11, 12, 13, 14
	var Fi3 = Math.atan2((u[1] - O2[1]), (u[0] - O2[0]));
	var Fi4 = Math.atan2((v[1] - O2[1]) ,(v[0] - O2[0]));
	ang = Fi3;
	dAng = (Fi3 - Fi4)/4;
	
	for(i = 11; i <= 14; i++)
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
		var lineVert = new Line3D();
		lineVert.CreateLineVectorPoint(Z1, new Point3D(x,y,0));
		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(girdle[10], girdle[14], crown[9]);
		girdle[i] = lineVert.IntersectionLinePlane(plane);
	}

	// seg4
	ang = Fi4;
	dAng = (Fi4 - del_ang_gd_flank) / 2;

	for(i = 15; i <= 16; i++)
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
		var lineVert = new Line3D();
		lineVert.CreateLineVectorPoint(Z1, new Point3D(x,y,0));
		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(girdle[14], girdle[20], crown[9]);
		girdle[i] = lineVert.IntersectionLinePlane(plane);
	}

	// seg5
	ang = del_ang_gd_flank;
	dAng = ang /4;	
	
	for(i = 17; i < 20; i++)
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
		var lineVert = new Line3D();
		lineVert.CreateLineVectorPoint(Z1, new Point3D(x,y,0));
		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(girdle[14], girdle[20], crown[9]);
		girdle[i] = lineVert.IntersectionLinePlane(plane);
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
var index_cut = 
[
    // Площадка
	0,7,6,5,4,3,2,1,0,

	// Корона
	0,1,8,0,
	1,2,9,1,
	2,3,10,2,
	3,4,11,3,
	4,5,12,4,
	5,6,13,5,
	6,7,14,6,
	7,0,15,7,

	0,8,16,15,0,
	1,9,26,8,1,
	2,10,36,9,2,
	3,11,46,10,3,
	4,12,56,11,4,
	5,13,66,12,5,
	6,14,76,13,6,
	7,15,86,14,7,

	8,22,21,20,19,18,17,16,8,
	8,26,25,24,23,22,8,
	9,30,29,28,27,26,9,
	9,36,35,34,33,32,31,30,9,
	10,42,41,40,39,38,37,36,10,
	10,46,45,44,43,42,10,
	11,50,49,48,47,46,11,
	11,56,55,54,53,52,51,50,11,
	12,62,61,60,59,58,57,56,12,
	12,66,65,64,63,62,12,
	13,70,69,68,67,66,13,
	13,76,75,74,73,72,71,70,13,
	14,82,81,80,79,78,77,76,14,
	14,86,85,84,83,82,14,
	15,90,89,88,87,86,15,
	15,16,95,94,93,92,91,90,15,
	
	// Рундист
	16,17,97,96,16,
	17,18,98,97,17,
	18,19,99,98,18,
	19,20,100,99,19,
	20,21,101,100,20,
	21,22,102,101,21,
	22,23,103,102,22,
	23,24,104,103,23,
	24,25,105,104,24,
	25,26,106,105,25,
	26,27,107,106,26,
	27,28,108,107,27,
	28,29,109,108,28,
	29,30,110,109,29,
	30,31,111,110,30,
	31,32,112,111,31,
	32,33,113,112,32,
	33,34,114,113,33,
	34,35,115,114,34,
	35,36,116,115,35,
	36,37,117,116,36,
	37,38,118,117,37,
	38,39,119,118,38,
	39,40,120,119,39,
	40,41,121,120,40,
	41,42,122,121,41,
	42,43,123,122,42,
	43,44,124,123,43,
	44,45,125,124,44,
	45,46,126,125,45,
	46,47,127,126,46,
	47,48,128,127,47,
	48,49,129,128,48,
	49,50,130,129,49,
	50,51,131,130,50,
	51,52,132,131,51,
	52,53,133,132,52,
	53,54,134,133,53,
	54,55,135,134,54,
	55,56,136,135,55,
	56,57,137,136,56,
	57,58,138,137,57,
	58,59,139,138,58,
	59,60,140,139,59,
	60,61,141,140,60,
	61,62,142,141,61,
	62,63,143,142,62,
	63,64,144,143,63,
	64,65,145,144,64,
	65,66,146,145,65,
	66,67,147,146,66,
	67,68,148,147,67,
	68,69,149,148,68,
	69,70,150,149,69,
	70,71,151,150,70,
	71,72,152,151,71,
	72,73,153,152,72,
	73,74,154,153,73,
	74,75,155,154,74,
	75,76,156,155,75,
	76,77,157,156,76,
	77,78,158,157,77,
	78,79,159,158,78,
	79,80,160,159,79,
	80,81,161,160,80,
	81,82,162,161,81,
	82,83,163,162,82,
	83,84,164,163,83,
	84,85,165,164,84,
	85,86,166,165,85,
	86,87,167,166,86,
	87,88,168,167,87,
	88,89,169,168,88,
	89,90,170,169,89,
	90,91,171,170,90,
	91,92,172,171,91,
	92,93,173,172,92,
	93,94,174,173,93,
	94,95,175,174,94,
	95,16,96,175,95,

	// Павильон

	176, 96, 97, 98, 99, 100, 177, 176,
	177, 100, 101, 102, 103, 104, 105, 106, 177,
	178, 106, 107, 108, 109, 110, 111, 112, 178,
	178, 112, 113, 114, 115, 116, 179, 178,

	179, 116, 117, 118, 119, 120, 180, 179,
	180, 120, 121, 122, 123, 124, 125, 126, 180,
	181, 126, 127, 128, 129, 130, 131, 132, 181,
	181, 132, 133, 134, 135, 136, 182, 181,

	182, 136, 137, 138, 139, 140, 183, 182,
	183, 140, 141, 142, 143, 144, 145, 146, 183,
	184, 146, 147, 148, 149, 150, 151, 152, 184,
	184, 152, 153, 154, 155, 156, 185, 184,

	185, 156, 157, 158, 159, 160, 186, 185,
	186, 160, 161, 162, 163, 164, 165, 166, 186,
	187, 166, 167, 168, 169, 170, 171, 172, 187,
	187, 172, 173, 174, 175, 96, 176, 187,

	189, 177, 106, 178, 189,
	191, 180, 126, 181, 191,
	193, 183, 146, 184, 193,
	195, 186, 166, 187, 195,

	188, 195, 187, 188,
	188, 187, 176, 188,
	188, 176, 177, 188,
	188, 177, 189, 188,

	190, 189, 178, 190,
	190, 178, 179, 190,
	190, 179, 180, 190,
	190, 180, 191, 190,

	192, 191, 181, 192,
	192, 181, 182, 192,
	192, 182, 183, 192,
	192, 183, 193, 192,

	194, 193, 184, 194,
	194, 184, 185, 194,
	194, 185, 186, 194,
	194, 186, 195, 194,

	196, 188, 189, 196,
	196, 189, 190, 196,
	196, 190, 191, 196,
	196, 191, 192, 196,
	196, 192, 193, 196,
	196, 193, 194, 196,
	196, 194, 195, 196,
	196, 195, 188, 196,

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
	for (i = 0; i < 40; i++)
	{
		colors[ind] = "rgb(100, 100, 100)";
		ind++;
		colors[ind] = "rgb(150, 150, 150)";		
		ind++;
	}
	
	for (i = 0; i < 4; i++)
	{
		colors[ind] = "rgb(170, 170, 250)";
		ind++;		
		colors[ind] = "rgb(200, 200, 250)";
		ind++;	
		colors[ind] = "rgb(200, 200, 250)";
		ind++;	
		colors[ind] = "rgb(170, 170, 250)";
		ind++;	
	}
	
	for (i = 0; i < 4; i++)
	{
		colors[ind] = "rgb(200, 250, 200)";
		ind++;		
	}
	
	colors[ind] = "rgb(150, 150, 160)"; // 133
	ind++;		
	colors[ind] = "rgb(200, 250, 250)"; // 134
	ind++;		
	colors[ind] = "rgb(200, 250, 170)"; // 135
	ind++;		
	colors[ind] = "rgb(150, 150, 160)"; // 136
	ind++;	
	colors[ind] = "rgb(170, 160, 180)"; // 137
	ind++;	
	colors[ind] = "rgb(200, 250, 250)"; // 138
	ind++;
	colors[ind] = "rgb(200, 250, 170)"; // 139
	ind++;		
	colors[ind] = "rgb(150, 150, 160)"; // 140
	ind++;	
	colors[ind] = "rgb(150, 150, 160)"; // 141
	ind++;		
	colors[ind] = "rgb(200, 250, 250)"; // 142
	ind++;		
	colors[ind] = "rgb(200, 250, 170)"; // 143
	ind++;	
	colors[ind] = "rgb(150, 150, 160)"; // 144
	ind++;		
	colors[ind] = "rgb(150, 150, 160)"; // 145
	ind++;	
	colors[ind] = "rgb(200, 250, 250)"; // 146
	ind++
	colors[ind] = "rgb(200, 250, 170)"; // 147
	ind++
	colors[ind] = "rgb(150, 150, 160)"; // 148
	ind++
	
	for (i = 0; i < 4; i++)
	{
		colors[ind] = "rgb(200, 200, 250)";
		ind++;
		colors[ind] = "rgb(200, 180, 250)";
		ind++;		
	}
};