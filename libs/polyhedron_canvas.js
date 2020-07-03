// polyhedron.js

// Каждая грань (фасета) трехмерной
// модели представлена нижеприведенной структурой Polygon.
// Структура представляет собой часть плоскости,
// ограниченной многоугольником (полигоном).
// Каждый многоугольник определяется набором 
// индексов вершин принадлежащих модели.
// Например, если грань ограничена многоугольником, 
// который можно обойти путем прохода через вершины 8, 16, 23 и 15,
// то эта грань должна быть записана в файле index.js
// в виде 8, 16, 23, 15, 8. Повторение вершины 8 говорит
// о том, что обход данной грани закончен.
// Все грани (полигоны) 3D модели обходим против часовой стрелки.
// По умолчанию в OpenGL, который является прототипом для WebGL, та сторона полигона, 
// для которой порядок перечисления вершин совпадает с обходом против часовой стрелки, 
// считается лицевой. На модель при этом, конечно, смотрим снаружи. 
// Чтобы все стало более понятным следует запустить программы Pyramid.html и Pyramid_text.html
// в которых приведена подробная нумерация вершин модели "пирамида".

/////////////////////////////////////////////////////////////////////////////
//     Для справки
// vertices - массив в котором подряд записаны координаты 
//            всех вершин модели в виде x, y, z, x, y, z .......... x, y, z

// vertexes - массив, состоящий из элементов Point3D, координат вершин одной конкретной грани

// points - массив, состоящий из элементов Point3D, координат всех вершин всех граней 
//////////////////////////////////////////////////////////////////////////////

function Polygon()
{
	this.IndexFacet = []; // индексы вершин одной конкретной грани 
	                      // с дублированной первой вершиной грани
	this.vertexes = []; // массив координат вершин одной конкретной грани
}

var plgs = [];  // Массив граней из которых состоит модель.

// Создаем массив граней модели - заполняем массивы plgs и faces.
function CreatePolyhedron()
{	
	// В результате работы функции VerticesCalculation()
	// получаем массив vertices в котором подряд записаны
	// координаты всех вершин модели в виде:
	//  [ x0, y0, z0,
	//    x1, y1, z1,
	//    x2, y2, z2,
	//    ...........
	//    ...........
	//    xn, yn, zn ]
	// Требуется преобразовать этот массив к массиву points
	// который будет иметь следующий вид:
	//  [(x0, y0, z0), (x1, y1, z1), ... (xn, yn, zn)]
	// Массив points в дальнейшем также потребуется в функции isCorrect()
	
	var i, j, k;
	k = 0; // k - номер в массиве вершин vertices
		   // массив vertices объявлен в том файле,
		   // где находится функция VerticesCalculation()
	for (i = 0; i < vertices.length/3; i++)
	{
		var pt = new Point3D();
		for (j = 0; j < 3; j++)
		{
			pt[0] = vertices[k];
			pt[1] = vertices[k + 1];
			pt[2] = vertices[k + 2];
		}
		points.push(pt); // фактически все vertex'ы подряд
		k = k + 3;
	}
	
	var index;
	var index_begin;
	var i_index = 0; // Номер индекса, проходит по всем вершинам огранки

	var iPolyg = 0;
	i = 0;
	
	for (;;) // Цикл по всем полигонам
	{
		// Полигон 
		var plg = new Polygon();  

		index = index_cut[i_index];
		i_index++; // Сразу делаем инкремент - вдруг нарвемся на "break" !!!
		if (index == -100)
			break;	// Прошли по всем полигонам

		index_begin = index; // index_begin - индекс начала новой грани
		plg.IndexFacet.push(index);
		for (;;)
		{
			// В текущем полигоне заполняем массив индексов его вершин
			index = index_cut[i_index];
			plg.IndexFacet.push(index);
			i_index++; // Берем следующую вершину текущей грани
			
			if (index == index_begin) 
			{
				// Нашли признак конца вершин для текущей грани
				k = 0;
				for (k = 0; k < plg.IndexFacet.length; k++)
				{
					var x = points[plg.IndexFacet[k]][0];
					var y = points[plg.IndexFacet[k]][1];
					var z = points[plg.IndexFacet[k]][2];
					var pt = new Point3D(x, y, z);
					plg.vertexes.push(pt);
				}
				break; // все вершины текущей грани прошли
			}
		}

		// Полностью заполненную очередную структуру Polygon кладем в массив plgs
		plgs.push(plg);
		iPolyg++;
	}
}

// Проверка выпуклости модели
function isCorrect()
{	
	if (correct == false)
	{
		return 1;
	}
	
	var i, j;
	// Проходим по всем граням модели 
	for (i = 0; i < plgs.length; i++)
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

function PointInPolygon(point, index)
{
	var i, j;
	var angle = 0;
	var n = plgs[index].vertexes.length - 1;
	for (i = 0; i < plgs[index].vertexes.length - 1; i++)
	{
		var pt1 = plgs[index].vertexes[i];
		var pt2 = plgs[index].vertexes[i+1];
		var line1 = new Line2D(point, pt1); // pt1 pt2 хотя имеют тип Point3D но допустимо 
		var line2 = new Line2D(point, pt2); // т.к. при создании Line2D используются 
											// только pt1[0], pt1[1], pt2[0], pt2[1].
		var angle_12 = line1.Angle(line2);
		angle = angle + angle_12;
	}
	if ((angle > 2*Math.PI - 0.00001) && (angle < 2*Math.PI + 0.00001 ))
	{
		var point1 = new Point3D(point[0], point[1], 0.0);
		var point2 = new Point3D(point[0], point[1], 1.0);
		var line = new Line3D(point1, point2);
		
		// Первые три точки каждого многоугольника используются для создания двух 3D-векторов.
		var pt0 = new Point3D(plgs[index].vertexes[0][0], plgs[index].vertexes[0][1], plgs[index].vertexes[0][2]);
		var pt1 = new Point3D(plgs[index].vertexes[1][0], plgs[index].vertexes[1][1], plgs[index].vertexes[1][2]);
		var pt2 = new Point3D(plgs[index].vertexes[2][0], plgs[index].vertexes[2][1], plgs[index].vertexes[2][2]);		
		var plane = new Plane3D();
		plane.CreatePlaneThreePoints(pt0, pt1, pt2);
		var point_intersect = line.IntersectionLinePlane(plane);
		// Расчет поворотов модели
		var matX = new Matrix3D(); 
		matX.RotX(-angleX); 
		
		var matY = new Matrix3D(); 
		matY.RotY(-angleY);
		
		var matZ = new Matrix3D(); 
		matZ.RotZ(-angleZ);
		
		point_intersect = point_intersect.Rotate(matZ);
		point_intersect = point_intersect.Rotate(matY);
		point_intersect = point_intersect.Rotate(matX);
		
		x_intersect_facet = point_intersect[0];
		y_intersect_facet = point_intersect[1];
		z_intersect_facet = point_intersect[2];
		
		return true;	
	}
	else 
	{
		return false;
	}
}