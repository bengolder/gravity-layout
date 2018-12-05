
var bodies = [];

function listenForSpaceBar(){ 
  document.addEventListener("keypress", function(event) {
      if (event.keyCode == 32) {
        bodyData = bodies.filter(function(b){return b.customProperties;}).map(function(body){
          return {
            id: body.customProperties.id,
            scale_factor: body.customProperties.scale_factor,
            angle: body.angle,
            position: body.position
          }
        })
        console.log(JSON.stringify(bodyData));
      }
  })
}

function withJson(url, callback){
  var request = new XMLHttpRequest();
  request.open('GET', "data.json");
  request.responseType = 'json';
  request.send();
  request.onload = function(){
    callback(request.response);
  }
}

function parseBody(jsonBodyObject, options){
  var options = options || {};
  var vertices = Matter.Vertices.fromPath(jsonBodyObject.vertices)
  var center = Matter.Vertices.centre(vertices)
  var body = Matter.Bodies.fromVertices(center.x, center.y, vertices, options);
  body.customProperties = jsonBodyObject.props;
  body.startingPosition = center;
  return body;
}

function makeStuff(response){
  console.log("AJAX RESPONSE:");
  console.log(response);
  var area = response.area;
  // create an engine
  var engine = Matter.Engine.create();

  // create a renderer
  var render = Matter.Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: area.width,
        height: area.height
      }
  });

  var mouse = Matter.Mouse.create(render.canvas),
    mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });


  Matter.World.add(engine.world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  response.bodies.forEach(function(bodyObj){
    bodies.push(parseBody(bodyObj))
  })
  response.staticBodies.forEach(function(bodyObj){
    bodies.push(parseBody(bodyObj, {isStatic: true}))
  })

  // add all of the bodies to the world
  Matter.World.add(engine.world, bodies);

  // run the engine
  Matter.Engine.run(engine);

  // run the renderer
  Matter.Render.run(render);

  listenForSpaceBar();
}

withJson("data.json", makeStuff);


