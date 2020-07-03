Creating 3d polyhedra. Lessons on the site (online) https://vlad0007.github.io/CanvasGeometry

  This site can be considered a continuation (or addition) of my other site "Three.js and geometry". 
On the "Three.js and geometry" considered the creation of sixteen models of diamond cuts. 
The three.js library was used as a tool for displaying diamond cuts on the screen. 
The new site, which I called "Canvas and geometry", uses HTML5 Canvas for this purpose 
without any webgl-based libraries (such as three.js or babylon.js). 
However, everything that was done on the site "Three.js and geometry" in terms of drawing the model, 
numbering vertexes, setting parameter values, selecting faces of polyhedra I was able to save it 
on the new site. 

 In addition, several new features have been added. For example, an imitation of model lighting is made.
When creating online programs located on the site, the simplest JavaScript constructs were used. 
But understanding how these programs work requires some experience in using mouse event handlers 
that occur when the mouse moves across the canvas and when its keys are pressed.

 All programs are made as interactive as possible. 
For example, you can use the mouse not only to select any face, 
but also to view the coordinates of the model at any point. 
If desired, you can disable or enable checking the correctness of model construction, 
change the lighting color and brightness, and perform other manipulations with 3D models of polyhedra.

 To draw models and apply their sizes to the canvas, the "canvas2D" library was created, 
which is actually a small wrapper around the HTML5 Canvas functions. At the same time, 
the functions included in the "canvas2D" library are designed in such a way that they 
are most convenient to use together with the functions included in the "WebGeometry" library, 
intended for geometric calculations on the plane and in space.
