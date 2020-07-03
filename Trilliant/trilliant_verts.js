var DEGREE = 0.01745329251994; // значение одного углового градуса
var M_PI = 3.14159265358979323846;
var M_PI_2 = 1.57079632679489661923;
var PERCENT = 0.01;
var SQRT2 = 1.41421356237309504880
var EPSILON = 0.000001;

// СДМ - структура данных модели
var lw = 1.0;      			// отношение длины огранки к ее ширине
// Рундист
var r = 0.06;       		// толщина рундиста
var rs = 0.2;
var angle = 60*DEGREE;

// Корона
var beta = 35*DEGREE;//0.67831821947314540;//   34.5*DEGREE;    	// угол короны
var t = 0.6;				// размер площадки
var dSquare = 0.0001; 

// Павильон
var angle_pav = 50*DEGREE;   // угол павильона
var hPavFacet = 0.75; 		// глубина нижних вершин фасет павильона
// Калетта
var culetX = 0.00001;
var culetY = 0.00001;

var girdle2 = [];
var girdle = [];
var crown = [];
var pavil = [];	

var vertices = [];

var star_facets = 0.5;

// Расчет координат вершин огранки (модели).
function VerticesCalculation()
{

	InitGirdle();
	
	for(i = 0; i < 48; i++)
	{
		girdle[i] = new Point3D();
		girdle[i][0] = girdle2[i][0];
		girdle[i][1] = girdle2[i][1];
		girdle[i][2] = r/2;

		girdle[i+48] = new Point3D();
		girdle[i+48][0] = girdle2[i][0];
		girdle[i+48][1] = girdle2[i][1];
		girdle[i+48][2] = -r/2;
	}
	
	Z1 = new Vector3D(0,0,1);
	
    // Вспомогательные переменные и объекты
	var Z0 = new Vector3D(0,0,1);	// Единичный вертикально расположенный ветор.
	var norm2d = new Vector2D;
	var normPlaneVector = new Vector3D();
	var i;

	// Конструируем корону
	var r_tan_beta = 0.5 * Math.tan(beta); // beta - угол наклона граней короны
    var H1 = r/2;	// уровень верхней части рундиста
    var H2 = -r/2;	// уровень нижней части рундиста
	
	// точки короны пропорциональны точкам рундиста относительно upPoint (это следует
	// из предположения, что все грани пересекаются в одной точке)
	var upPoint = new Point3D(0.0, 0.0, H1 + r_tan_beta);

    for ( i = 0; i < 6; i++ )
    {
        var dir = new Vector3D(	girdle[i*8+4][0] - upPoint[0], 
								girdle[i*8+4][1] - upPoint[1], 
								girdle[i*8+4][2] - upPoint[2]);
		// Вектор dir нельзя нормировать !
		crown[i] = new Point3D(upPoint[0] + t * dir[0], 
								upPoint[1] + t * dir[1], 
								upPoint[2] + t * dir[2]);
    }

	//  Находим точки пересечения основных граней  
	// короны между собой на уровне рундиста.
	
	// Сначала создание шести прямых касательных к рундисту
	var lines = [];
	for ( i = 0; i < 6; i++ ) 
	{
		var dir = new Vector2D(girdle2[4+i*8+1][0] - girdle2[4+i*8-1][0], 
							   girdle2[4+i*8+1][1] - girdle2[4+i*8-1][1]);
		dir.Normer();
		var ln = new Line2D();
		ln.CreateLineVectorPoint(dir, new Point2D(girdle2[4+i*8][0], 
												girdle2[4+i*8][1]));
		lines[i] = ln;
	}
	
	// Точки пересечения касательных к рундисту прямых между собой
	var g2 = [];
    for ( i = 0; i < 5; i++ )
	{
		g2[i+1] = lines[i].IntersectionTwoLines(lines[i+1]);
	}
	g2[0] = lines[0].IntersectionTwoLines(lines[5]);
	
    // Точки звезды (вершины короны) пропорциональны  точкам g2 относительно upPoint
	// Коэффициент пропорциональности m находим по следующей формуле
    var m = (1 + SQRT2) / 2 * t;
    if ( dSquare <= 0 ) 
		m = m + dSquare * (m - 1 + t);
    else 
		m = m + dSquare * (1 - m);
    // Координаты вершин звезды
    for ( i = 0; i < 6; i++ )
    {
		var dir = new Vector3D( g2[i][0] - upPoint[0], g2[i][1] - upPoint[1], H1 - upPoint[2] );
		var pt = new Point3D( upPoint[0] + m * dir[0], upPoint[1] + m * dir[1], upPoint[2] + m * dir[2] );
		crown[i+6] = pt;
    }

	// corr_gd_crown(12, 16, 9);

	corr_gd_crown(0, 4, 6);
	corr_gd_crown(4, 8, 7);
	corr_gd_crown(8, 12, 7);
	corr_gd_crown(12, 16, 8);
	
	corr_gd_crown(16, 20, 8);
	corr_gd_crown(20, 24, 9);
	corr_gd_crown(24, 28, 9);
	corr_gd_crown(28, 32, 10);
	
	corr_gd_crown(32, 36, 10);
	corr_gd_crown(36, 40, 11);
	corr_gd_crown(40, 44, 11);
	corr_gd_crown(44, 0, 6);
	

	/////////////////////////////////////////////////
	//            Конструируем павильон            //
	/////////////////////////////////////////////////
	pavil[6] = new Point3D(); 
	pavil[6][0] = culetX;
	pavil[6][1] = culetY;
	pavil[6][2] = - 0.5 * Math.tan(angle_pav)- r/2;

	//  Находим точки пересечения основных граней  
	// павильона между собой на уровне рундиста.
	// На самом деле это те же самые точки из массива g2,
	// которые мы определили при построении короны.
	// Поэтому при построении короны воспользуемся значениями 
	// из этого массива.
	
    for (i = 0; i < 6; i++)
    {
        var dir = new Vector3D(pavil[6][0] - g2[i][0], pavil[6][1] - g2[i][1], pavil[6][2] + r/2);
//		dir.normer();
		pavil[i] = new Point3D(); 
		pavil[i][0] = pavil[6][0] - (1 - hPavFacet) * dir[0];
		pavil[i][1] = pavil[6][1] - (1 - hPavFacet) * dir[1];
		pavil[i][2] = pavil[6][2] - (1 - hPavFacet) * dir[2];
	}
	
	corr_gd_pav(48, 52, 0);
	corr_gd_pav(52, 56, 1);
	corr_gd_pav(56, 60, 1);
	corr_gd_pav(60, 64, 2);
	
	corr_gd_pav(64, 68, 2);
	corr_gd_pav(68, 72, 3);
	corr_gd_pav(72, 76, 3);
	corr_gd_pav(76, 80, 4);
	
	corr_gd_pav(80, 84, 4);
	corr_gd_pav(84, 88, 5);
	corr_gd_pav(88, 92, 5);
	corr_gd_pav(92, 48, 0);
	
	// В массиве vertices хранятся координаты (x, y, z) всех вершин огранки подряд.
	for(i = 0; i < 96; i++)
	{
		vertices.push(girdle[i][0]);
		vertices.push(girdle[i][1]);
		vertices.push(girdle[i][2]);
	}

	for(i = 0; i < 12; i++)
	{
		vertices.push(crown[i][0]);
		vertices.push(crown[i][1]);
		vertices.push(crown[i][2]);
	}
	

	
	for(i = 0; i < 7; i++)
	{
		vertices.push(pavil[i][0]);
		vertices.push(pavil[i][1]);
		vertices.push(pavil[i][2]);
	}	

}

function InitGirdle()
{
	var i;
	
	var cir1s, cir2s, cir3s;
	var O, O1, O2, O3;

	var f, g, h;
	var t, u, v;
			
	var Rs1 = rs;
	var Rs2 = rs;
	var Rs3 = rs;
	
	var R1 = 1.0 - Rs1;
	var R2 = 1.0 - Rs2;
	var R3 = 1.0 - Rs3;	
	
	O1 = new Point2D(-(R1 - Rs1)/2, 0.0);
	O2 = new Point2D( (R1 - Rs2)/2, 0.0);
	O3 = new Point2D( 0.0, (R1 - Rs3) * Math.sin(60*DEGREE));	
	
	var cir1 = new Circle2D(O1, R1);
	var cir2 = new Circle2D(O2, R2);
	var cir3 = new Circle2D(O3, R3);
	
	cir1s = new Circle2D(O1, Rs1 + EPSILON);
	cir2s = new Circle2D(O2, Rs2 + EPSILON);
	cir3s = new Circle2D(O3, Rs3 + EPSILON);
	
	var ln1 = new Line2D(O3, new Point2D(0, 1));
	var ln2 = new Line2D(O2, new Point2D(O2[0] + Math.cos(-30*DEGREE), O2[1] + Math.sin(-30*DEGREE)));

	var points = cir3s.Intersection_LineCircle(ln1);
	if (points == null)
	{
		return null;
	}
	if (points[0][1] > points[1][1])
	{
		girdle2[0] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle2[0] = new Point2D(points[1][0], points[1][1]);		
	}	
	
	points = cir2s.Intersection_LineCircle(ln2);
	if (points == null)
	{
		return null;
	}
	if (points[0][0] > points[1][0])
	{
		girdle2[16] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle2[16] = new Point2D(points[1][0], points[1][1]);		
	}

	// Точки пересечения окружностей cir1 и cir2 с сопрягающей окружностью cir3
	points = cir1.Intersection_TwoCircles(cir3s);
	if (points == null)
	{
		return null;
	}
	F = new Point2D(points[0][0], points[0][1]); 
	
	points = cir1.Intersection_TwoCircles(cir2s);
	if (points == null)
	{
		return null;
	}
	G = new Point2D(points[0][0], points[0][1]); 
	
	points = cir3.Intersection_TwoCircles(cir2s);
	if (points == null)
	{
		return null;
	}
	H = new Point2D(points[0][0], points[0][1]); 
	
	var O3_f = new Line2D(O3, F);
	var O2_g = new Line2D(O2, G);
	
	// Точки на радиусах сопрягающей окружности cir3
	t = new Point2D(O3[0] + Math.cos(M_PI_2 - angle),     O3[1] + Math.sin(M_PI_2 - angle));
	u = new Point2D(O2[0] + Math.cos(-30*DEGREE + angle), O2[1] + Math.sin(-30*DEGREE + angle));
	v = new Point2D(O2[0] + Math.cos(-30*DEGREE - angle), O2[1] + Math.sin(-30*DEGREE - angle));
	

	// Прямые используемые для нахождения границ сегментов рундиста.
	//      ln_O3_t, ln_O2_u, ln_O2_v;
	var ln_O3_t = new Line2D(O3, t);
	var ln_O2_u = new Line2D(O2, u);
	var ln_O2_v = new Line2D(O2, v);	
	
	// girdle2[4]
	points = cir1.Intersection_LineCircle(ln_O3_t);
	if (points == null)
	{
		return null;
	}	
	if (points[0][0] > points[1][0])
	{
		girdle2[4] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle2[4] = new Point2D(points[1][0], points[1][1]);		
	}

	// girdle2[12]
	points = cir1.Intersection_LineCircle(ln_O2_u);
	if (points == null)
	{
		return null;
	}		
	if (points[0][0] > points[1][0])
	{
		girdle2[12] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle2[12] = new Point2D(points[1][0], points[1][1]);		
	}

	// girdle2[20]
	points = cir3.Intersection_LineCircle(ln_O2_v);
	if (points == null)
	{
		return null;
	}
	if (points[0][1] < points[1][1])
	{
		girdle2[20] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle2[20] = new Point2D(points[1][0], points[1][1]);		
	}
	
	// Вершина gd8 (girdle2[8]) - расположена на окружности cir1 (с центром в точке O1)
	// Угол gd8 - O1 - O2  составляет 30 угловых градусов 
	ln1 = new Line2D(O1, new Point2D(O1[0] + Math.cos(30*DEGREE), 
									 O1[1] + Math.sin(30*DEGREE)));
									 
	points = cir1.Intersection_LineCircle(ln1);
	if (points == null)
	{
		return null;
	}
	if (points[0][0] > points[1][0])
	{
		girdle2[8] = new Point2D(points[0][0], points[0][1]);
	}
	else
	{
		girdle2[8] = new Point2D(points[1][0], points[1][1]);		
	}

	girdle2[24] = new Point2D(0, girdle2[0][1] - R1 - Rs1);

	// Остальной рундист
	var x,y;
	var Fi1 = Math.atan2((girdle2[0][1] - O1[1]), (girdle2[0][0] - O1[0]));
	var Fi2 = Math.atan2((girdle2[4][1] - O1[1]), (girdle2[4][0] - O1[0]));
	var ang = Fi2;
	var dAng = (Fi1 - Fi2) / 4; // Угловой шаг

	var gr1 = Fi1 * 180 / M_PI;
	var gr2 = Fi2 * 180 / M_PI;
	var gr12 = dAng * 180 / M_PI;

	// seg1
	for(i = 3; i > 0; i--)
	{
		ang = ang + dAng;
		x = Math.cos(ang)*R1 + O1[0];
		if(x < F[0]) // Левее точки пересечения окружностей cir1 и cir3s
		{
			// Пересечение прямой с сопрягающей окружностью cir3s
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir3s.Intersection_LineCircle(line1);
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
			y = Math.sin(ang)*R1 + O1[1];
		}
		girdle2[i] = new Point2D(x, y);
	}

	
	Fi1 = Math.atan2((girdle2[4][1] - O1[1]), (girdle2[4][0] - O1[0]));
	Fi2 = Math.atan2((girdle2[8][1] - O1[1]), (girdle2[8][0] - O1[0]));
	ang = Fi2;
	dAng = (Fi1 - Fi2)/4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;	
	
	for(i = 7; i > 4; i--)
	{
		ang = ang + dAng;
		x = Math.cos(ang)*R1 + O1[0];
		if(x < F[0]) // Левее точки пересечения окружностей cir1 и cir3s
		{
			// Пересечение прямой с сопрягающей окружностью cir3s
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir3s.Intersection_LineCircle(line1);
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
			y = Math.sin(ang)*R1 + O1[1];
		}
		girdle2[i] = new Point2D(x, y);
	}
	
	Fi1 = Math.atan2((girdle2[8][1] - O1[1]), (girdle2[8][0] - O1[0]));
	Fi2 = Math.atan2((girdle2[12][1] - O1[1]), (girdle2[12][0] - O1[0]));
	ang = Fi1;
	dAng = (Fi1 - Fi2)/4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;	
	
	for(i = 9; i < 12; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R1 + O1[1];
		if(y < G[1]) // Ниже точки пересечения окружностей cir1 и cir2s
		{
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir2s.Intersection_LineCircle(line1);
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
			x = Math.cos(ang)*R1 + O1[0];
		}
		girdle2[i] = new Point2D(x, y);
	}
	
	Fi1 = Math.atan2((girdle2[12][1] - O1[1]), (girdle2[12][0] - O1[0]));
	Fi2 = Math.atan2((girdle2[16][1] - O1[1]), (girdle2[16][0] - O1[0]));
	ang = Fi1;
	dAng = (Fi1 - Fi2)/4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;	

	for(i = 13; i < 16; i++)
	{
		ang = ang - dAng;
		y = Math.sin(ang)*R1 + O1[1];
		if(y < G[1]) // Ниже точки пересечения окружностей cir1 и cir2s
		{
			// Пересечение прямой с сопрягающей окружностью cir2s
			var line1 = new Line2D();
			var vector1 = new Vector2D(Math.cos(ang), Math.sin(ang));
			line1.CreateLineVectorPoint(vector1, O1);
			points = cir2s.Intersection_LineCircle(line1);
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
			x = Math.cos(ang)*R1 + O1[0];
		}
		girdle2[i] = new Point2D(x, y);
	}
	
	Fi1 = Math.atan2((girdle2[16][0] - O3[0]), (O3[1] - girdle2[16][1]));
	Fi2 = Math.atan2((girdle2[20][0] - O3[0]), (O3[1] - girdle2[20][1]));

	ang = Fi2;
	dAng = (Fi1 - Fi2)/4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;

	for(i = 19; i > 16; i--)
	{
		ang = ang + dAng;
		x = Math.sin(ang)*R3 + O3[0];
		if(x > H[0]) // Правее точки пересечения окружностей cir3 и cir2s
		{
			// Пересечение прямой с сопрягающей окружностью cir2s
			gr1 = ang * 180 / M_PI;	
			var line1 = new Line2D();
			var vector1 = new Vector2D(-Math.sin(ang), Math.cos(ang));
			line1.CreateLineVectorPoint(vector1, O3);
			points = cir2s.Intersection_LineCircle(line1);
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
			y = - Math.cos(ang)*R3 + O3[1];
		}
		girdle2[i] = new Point2D(x, y);
	}

	Fi1 = Math.atan2((girdle2[20][0] - O3[0]), (O3[1] - girdle2[20][1]));
	Fi2 = Math.atan2((girdle2[24][0] - O3[0]), (O3[1] - girdle2[24][1]));

	ang = Fi2;
	dAng = (Fi1 - Fi2) / 4; // Угловой шаг

	gr1 = Fi1 * 180 / M_PI;
	gr2 = Fi2 * 180 / M_PI;
	gr12 = dAng * 180 / M_PI;

	for(i = 23; i > 20; i--)
	{
		ang = ang + dAng;
		x = Math.sin(ang)*R3 + O3[0];
		if(x > H[0]) // Правее точки пересечения окружностей cir3 и cir2s
		{
			// Пересечение прямой с сопрягающей окружностью cir2s
			gr1 = ang * 180 / M_PI;
			var line1 = new Line2D();
			var vector1 = new Vector2D(-Math.sin(ang), Math.cos(ang));
			line1.CreateLineVectorPoint(vector1, O3);
			points = cir2s.Intersection_LineCircle(line1);
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
			y = - Math.cos(ang)*R3 + O3[1];
		}
		girdle2[i] = new Point2D(x, y);
	}

	for (i = 1; i < 24; i++)
	{
		girdle2[48-i] = new Point2D(-girdle2[i][0], girdle2[i][1]);
	}

	var del = O2[0] * Math.tan(30*DEGREE);

	for(i = 0; i < 48; i++)
	{
		girdle2[i][1] = (girdle2[i][1] - del) * lw;
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
		var vert_line = new Line3D(girdle[gd1 + i], girdle[gd1 + i + 48]);
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
		var vert_line = new Line3D(girdle[gd1 + i], girdle[gd1 + i - 48]);
		var pt = vert_line.IntersectionLinePlane(planeT);
		girdle[gd1 + i][2] = pt[2];
	}	
}


// Все грани (полигоны) 3D модели огранки обходим против часовой стрелки
// если смотреть на модель находясь от нее снаружи.
var index_cut = 
[
	// Корона
	96, 101, 100, 99, 98, 97, 96,
	
	96, 102, 101, 96,
	97, 98, 104, 97,
	99, 100, 106, 99,

	96, 97, 103, 96,
	98, 99, 105, 98,
	100, 101, 107, 100,

	96, 103, 4, 102, 96,
	97, 104, 12, 103, 97,
	98, 105, 20, 104, 98,
	99, 106, 28, 105, 99,
	100, 107, 36, 106, 100,
	101, 102, 44, 107, 101,

	102, 0, 47, 46, 45, 44, 102,
	102, 4, 3, 2, 1, 0, 102,

	103, 8, 7, 6, 5, 4, 103,
	103, 12, 11, 10, 9, 8, 103,

	104, 16, 15, 14, 13, 12, 104,
	104, 20, 19, 18, 17, 16, 104,

	105, 24, 23, 22, 21, 20, 105,
	105, 28, 27, 26, 25, 24, 105,

	106, 32, 31, 30, 29, 28, 106,
	106, 36, 35, 34, 33, 32, 106,

	107, 40, 39, 38, 37, 36, 107,
	107, 44, 43, 42, 41, 40, 107,

	// Рундист с 48 * 2 количеством вершин

	0, 1, 49, 48, 0,
	1, 2, 50, 49, 1,
	2, 3, 51, 50, 2,
	3, 4, 52, 51, 3,
	
	4, 5, 53, 52, 4,
	5, 6, 54, 53, 5,
	6, 7, 55, 54, 6,
	7, 8, 56, 55, 7,

	8, 9, 57, 56, 8,
	9, 10, 58, 57, 9,
	10, 11, 59, 58, 10,
	11, 12, 60, 59, 11,

	12, 13, 61, 60, 12,
	13, 14, 62, 61, 13,
	14, 15, 63, 62, 14,
	15, 16, 64, 63, 15,

	16, 17, 65, 64, 16,
	17, 18, 66, 65, 17,
	18, 19, 67, 66, 18,
	19, 20, 68, 67, 19,

	20, 21, 69, 68, 20,
	21, 22, 70, 69, 21,
	22, 23, 71, 70, 22,
	23, 24, 72, 71, 23,

	24, 25, 73, 72, 24,
	25, 26, 74, 73, 25,
	26, 27, 75, 74, 26,
	27, 28, 76, 75, 27,

	28, 29, 77, 76, 28,
	29, 30, 78, 77, 29,
	30, 31, 79, 78, 30,
	31, 32, 80, 79, 31,

	32, 33, 81, 80, 32,
	33, 34, 82, 81, 33,
	34, 35, 83, 82, 34,
	35, 36, 84, 83, 35,

	36, 37, 85, 84, 36,
	37, 38, 86, 85, 37,
	38, 39, 87, 86, 38,
	39, 40, 88, 87, 39,

	40, 41, 89, 88, 40,
	41, 42, 90, 89, 41,
	42, 43, 91, 90, 42,
	43, 44, 92, 91, 43,

	44, 45, 93, 92, 44,
	45, 46, 94, 93, 45,
	46, 47, 95, 94, 46,
	47, 0, 48, 95, 47,

	// Павильон
	108, 92, 93, 94, 95, 48, 108,
	108, 48, 49, 50, 51, 52, 108,

	109, 52, 53, 54, 55, 56, 109,
	109, 56, 57, 58, 59, 60, 109,

	110, 60, 61, 62, 63, 64, 110,
	110, 64, 65, 66, 67, 68, 110,

	111, 68, 69, 70, 71, 72, 111,
	111, 72, 73, 74, 75, 76, 111,

	112, 76, 77, 78, 79, 80, 112,
	112, 80, 81, 82, 83, 84, 112,
	
	113, 84, 85, 86, 87, 88, 113,
	113, 88, 89, 90, 91, 92, 113,

	114, 108, 52, 109, 114,
	114, 109, 60, 110, 114,
	114, 110, 68, 111, 114,
	114, 111, 76, 112, 114,
	114, 112, 84, 113, 114,
	114, 113, 92, 108, 114,

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
	for (i = 0; i < 6; i++)
	{
		colors[ind] = "rgb(150, 150, 250)";
		ind++;
	}	
	
	// crown facets
	for (i = 0; i < 6; i++)
	{
		colors[ind] = "rgb(100, 100, 250)";
		ind++;
	}

	// bottom crown facets
	for (i = 0; i < 6; i++)
	{
		colors[ind] = "rgb(170, 170, 250)"; ind++;
		colors[ind] = "rgb(200, 200, 250)"; ind++;
	}	
	
	//  GIRDLE
	for (i = 0; i < 24; i++)
	{
		colors[ind] = "rgb(100, 100, 100)";
		ind++;
		colors[ind] = "rgb(150, 150, 150)";
		ind++;
	}
	
	// pavilion upper facets
	for (i = 0; i < 6; i++)
	{
		colors[ind] = "rgb(170, 170, 250)";
		ind++;
		colors[ind] = "rgb(200, 200, 250)";		
		ind++;
	}

	// pavilion facets
	for (i = 0; i < 3; i++)
	{
		colors[ind] = "rgb(100, 100, 250)";
		ind++;
		colors[ind] = "rgb(120, 120, 250)";
		ind++;
	}	
	
	// culet
	colors[ind] = "rgb(180, 180, 180)";
};