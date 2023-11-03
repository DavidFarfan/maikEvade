//-------CLASE MAIK--------------------------
class Maik {
	
	static playable = false;
	static win = false;
	
	constructor(player, pos){
		
		// Vivo
		this.alive = true;
		
		// Jugador o Enemigo
		this.player = player;
		
		// Existe un jugador
		if(this.player){
			Maik.playable = true;
		}
		
		// Posición
		if(pos == null){
			this.pos = {
				x: .5 * canvas.width,
				y: .5 * canvas.height
			};
		}else{
			this.pos = pos;
		}
		
		// Velocidad
		this.vel = { x:0, y:0 };
		
		// Hacia donde mira el sprite
		this.orientation = 0;
		
		// Área de dibujo
		this.drawCage = {x:0, y:0, w:0, h:0};
		
		// Hitbox
		this.hitbox = null;
	}
	
	// Acción del Maik
	act(){
		
		// Actuar si se está vivo
		if(!this.alive){
			return;
		}
		
		// Muerte de los enemigos
		if(!this.player && (enemy_counter >= 100 || Maik.win)){
			
			// Dejar partículas residuales
			for(var i=0; i<8; i++){
				const angle_ded_parts = (2 * Math.PI) * (i / 8);
				const vel_ded_parts = {
					x: Math.cos(angle_ded_parts),
					y: Math.sin(angle_ded_parts)
				};
				add_particle([
					this.pos.x,
					this.pos.y,
					10,
					50 * vel_ded_parts.x,
					50 * vel_ded_parts.y
				]);
			}
			
			// Detener la persecusíon
			this.alive = false;
			enemy_counter--;
			Maik.win = true;
		}
		
		// Calcular posición actual
		var curr_pos;
		if(this.player){
			curr_pos = {
				x: mousePos.x,
				y: mousePos.y
			};
		}else{
			curr_pos = {
				x: this.pos.x + this.vel.x,
				y: this.pos.y + this.vel.y
			};
		}
		
		// Cálculo de la velocidad
		var curr_vel;
		if(this.player){
			
			// Calcular la velocidad previa del jugador, hacer retrospectiva.
			this.vel = {
				x: curr_pos.x - this.pos.x,
				y: curr_pos.y - this.pos.y
			};
			
			// Anular velocidad actual del jugador, es desconocida.
			curr_vel = {
				x: 0,
				y: 0
			};
		
		// Calcular la velocidad actual para la PC
		}else{
			
			// Magnitud
			const vel_mag = 1;
			
			// Dirección
			var vel_dir = normalize_vec({
				x: mousePos.x - curr_pos.x,
				y: mousePos.y - curr_pos.y
			});
			
			// Vector
			curr_vel = {
				x: vel_mag * vel_dir.x,
				y: vel_mag * vel_dir.y
			}
		}
		
		// Calcular la orientación actual (en radianes)
		var curr_orientation;
		var angle = angle_vec(this.vel);
		if(angle == null){
			curr_orientation = this.orientation;
		}else{
			curr_orientation = angle;
		}
		
		// Realizar los próximos cálculos con base en la imagen que corresponde
		var sprite_to_draw;
		if(this.player){
			sprite_to_draw = base;
		}else{
			sprite_to_draw = nega;
		}
		
		// Calcular la drawCage según el caso
		this.drawCage.x = curr_pos.x - 0.5 * sprite_to_draw.width;
		this.drawCage.y = curr_pos.y - 0.5 * sprite_to_draw.height;
		this.drawCage.w = sprite_to_draw.width;
		this.drawCage.h = sprite_to_draw.height;
					 
		// Calcular la hitBox
		this.hitbox = hitbox(
			this.drawCage.x, 
			this.drawCage.y, 
			this.drawCage.w, 
			this.drawCage.h,
			this.hitbox,
			this.vel
		);
		
		// Pintar las partículas, si hubo movimiento
		if(this.vel.x != 0 || this.vel.y != 0){
			
			// Vector ortonormal a la velocidad previa (centrado en el origen)
			var ort = vec_ort(this.vel);
			
			// Calcular desfase y posición de las partículas
			var vec_aux = normalize_vec(this.vel);
			var des_pos = {
				x: this.pos.x - vec_aux.x * sprite_to_draw.width * 0.5,
				y: this.pos.y - vec_aux.y * sprite_to_draw.height * 0.5
			}
			
			// Calcular tamaño de las partículas
			var size = norm_vec(this.vel);
			
			// Regular el tamaño
			var adj_size = 2 * Math.sqrt(size);
			
			// Calcular velocidad de las partículas
			var prop = 0.2;
			var part_vel = {
				
				// Magnitud proporcional al tamaño de partícula. Dirección paralela al vec. orto.
				x: ort.x * adj_size * prop,
				y: ort.y * adj_size * prop,
			}
			
			// Pedir particulas al animador, hay un límite de partículas en pantalla
			if(particles.length < 256 || this.player){
				add_particle([
					des_pos.x,
					des_pos.y,
					adj_size,
					part_vel.x,
					part_vel.y
				]);
				add_particle([
					des_pos.x,
					des_pos.y,
					adj_size,
					-part_vel.x,
					-part_vel.y
				]);
			};
		}
		
		// Acción de Nega al final del juego
		if(!Maik.playable){
			curr_vel = this.separe();
		}
		
		// Pasar los parámetros al paso futuro
		this.pos = curr_pos;
		this.vel = curr_vel;
		this.orientation = curr_orientation;
	}
	
	// Interacción
	interaction(primary){
		
		// Separarse (sólo lo hace uno de los dos)
		if(primary){
			this.vel = this.separe();
		}
		
		// Muerte del jugador
		if(this.player){
			
			// Dejar partículas residuales
			for(var i=0; i<8; i++){
				const angle_ded_parts = (2 * Math.PI) * (i / 8);
				const vel_ded_parts = {
					x: Math.cos(angle_ded_parts),
					y: Math.sin(angle_ded_parts)
				};
				add_particle([
					this.pos.x,
					this.pos.y,
					10,
					50 * vel_ded_parts.x,
					50 * vel_ded_parts.y
				]);
			}
			
			// Detener la persecusíon
			this.alive = false;
			Maik.playable = false;
		}
	}
	
	// Heurística para separarse
	separe(){
		
		// Velocidad aleatoria
		const rotation = Math.floor(Math.random() * 2 * Math.PI);
		return rot_vec(this.vel, rotation);
	}
}

//--------- HILO PRINCIPAL ------------

// Se corre una instancia de Worker (hilo) con el código animador
const animator = new Worker("/scripts/animador.js");

// El canvas puede transferir al Worker el control de su contexto.
// para eso, se lo tiene que enviar a través de un mensaje con un objeto Offscreen conteniéndolo.
const canvas = document.getElementById('draw');
const main_offscreen = canvas.transferControlToOffscreen();

// Posicion del mouse
var mousePos = {
	x: .5 * canvas.width,
	y: .5 * canvas.height
};

// Capturar posición del mouse ante cualquier movimiento
canvas.addEventListener('mousemove', evt => {
	mousePos = getMousePos(canvas, evt);
}, false);

// Reiniciar el juego con un click
canvas.addEventListener('click', () => {
	location.reload();
}, false);

// Enviar al animador el contexto
animator.postMessage({ type: 'context', canvas: main_offscreen }, [main_offscreen]);
//console.log('> Contexto enviado al animador.');

// Leer sprite de Maik
const base = new Image();
base.crossOrigin = 'anonymous';
base.src = 'assets/MaikBall.png';
base.onload = function() {
	
	// Convertir sprite a formato transferible
	const aux_canvas = new OffscreenCanvas(
		base.width, 
		base.height
	)
	aux_canvas.getContext('2d').drawImage(base, 0, 0);
	createImageBitmap(aux_canvas).then(resolve => {
		
		// Enviar la imagen base al animador
		animator.postMessage({ type: 'imagen_base', bitmap: resolve }, [resolve]);
	});
	//console.log('> Imagen base enviada al animador.');
};

// Leer sprite de Nega-Maik
const nega = new Image();
nega.crossOrigin = 'anonymous';
nega.src = 'assets/NegaMaikBall.png';
nega.onload = function() {
    
	// Convertir sprite a formato transferible
	const aux_canvas = new OffscreenCanvas(
		nega.width, 
		nega.height
	)
	aux_canvas.getContext('2d').drawImage(nega, 0, 0);
	createImageBitmap(aux_canvas).then(resolve => {
		
		// Enviar la imagen nega al animador
		animator.postMessage({ type: 'imagen_nega', bitmap: resolve }, [resolve]);
	});
	//console.log('> Imagen nega enviada al animador.');
};

// Argumentos para el spawneo
var enemy_counter = 0;
var time;
var pre = '0';
var second;

// Entidades
var entities = [];

// Jugador
const player1 = new Maik(true);
entities.push(player1);

// Argumentos para las interacciones
var hitboxes = [];

// Peticiones de partículas
var particles = [];

// Comenzar loop del Juego
setInterval(gameLoop, 16.6);

//--------- LOOP DE JUEGO ------------
function gameLoop(){
	
	// Poner en marcha individuos
	entities.forEach(function(value, index, array){
		value.act();
		
		// Borrar de la lista las entidades muertas
		if(!value.alive){
			entities.splice(index, 1);
		}
	});
	
	// Poner en marcha interacciones
	hitboxes = [];
	entities.forEach(function(value, index, array){
		
		// Comparar con la lista actual de hitBoxes
		for(var i=0; i<hitboxes.length; i++){
			
			// Si la caja colisiona con otra, poner en marcha la interacción
			if(box_collide(value.hitbox, hitboxes[i])){
				value.interaction(true);
				entities[i].interaction();
				break;
			}
		}
		
		// Poner caja en la lista al terminar
		hitboxes.push(value.hitbox);
	});
	
	// Construir pedido para el animador
	var request = [];
	
	// Agregar items de partículas
	particles.forEach(function(value, index, array){
		request.push(value.req);
	});
	
	// Agregar items de entidades
	entities.forEach(function(value, index, array){
		
		/*
		// Trazar la velocidad previa
		const mult = 20;
		request.push([
			'line', 
			value.pos.x,
			value.pos.y,
			value.pos.x + value.vel.x * mult,
			value.pos.y + value.vel.y * mult
		]);
		*/
		// Dibujar drawcages
		//request.push(['drawcage', value.drawCage.x, value.drawCage.y, value.drawCage.w, value.drawCage.h]);
		
		// Dibujar sprites rotados
		if(value.player){
			request.push(['maik', value.orientation, value.pos.x, value.pos.y, value.drawCage]);
			
			/*
			// Debug drawCage del jugador
			request.push([
				'debug', 
				value.drawCage.x.toString() + " " + 
					value.drawCage.y.toString() + " " +
					value.drawCage.w.toString() + " " +
					value.drawCage.h.toString(),
				100, 
				90
			]);
			
			// Debug hitbox del jugador
			request.push([
				'debug', 
				value.hitbox.x.toString() + " " + 
					value.hitbox.y.toString() + " " +
					value.hitbox.w.toString() + " " +
					value.hitbox.h.toString(),
				100, 
				100
			]);
			*/
			
		}else{
			request.push(['nega', value.orientation, value.pos.x, value.pos.y, value.drawCage]);
		}
		
		// Dibujar hitboxes
		//request.push(['hitbox', value.hitbox.x, value.hitbox.y, value.hitbox.w, value.hitbox.h]);
	});
	
	// Escribir número de Negas
	request.push(['debug', enemy_counter, canvas.width - 30, canvas.height - 30]);
	
	// Game Over
	if(!Maik.playable){
		request.push(['over']);
	
	// Win
	}else if(Maik.win){
		request.push(['win']);
	}
	
	// Enviar petición al animador
	animator.postMessage({ type: 'request', req: request});
	
	// Reemplazar items de partículas
	const particles_aux = particles.slice();
	particles = [];
	particles_aux.forEach(function(value, index, array){
		
		// Recalcular movimiento
		value = move_particle(value);
		
		// Agregar item de petición si la partícula no se ha diluido
		add_particle(value, true);
	});
	
	// Spawnear un nega por segundo
	time = Date.now().toString();
	second = time.substr(-4).charAt(0);
	if(second != pre && Maik.playable){
		spawn();
		pre = second;
	}
	
	/*
	// Imprimir llamadas por segundo
	time = Date.now().toString();
	sec_time = time.substr(-4);
	second = sec_time.charAt(0);
	if(second == pre){
		sum += 1;
	}else{
		console.log('second: ' + time + ' CPS: ' + sum.toString());
		sum = 1;
		pre = second;
	}
	
	// Enviar pedido de prueba al animador
	animator.postMessage({ type: 'request', req: [
		['circle', 
			.5 * canvas.width, 
			.5 * canvas.height, 
			.5 * distance(mousePos.x, mousePos.y, mousePos.y, mousePos.x)
		],
		['cage', mousePos.x, mousePos.y, base.width, base.height],
		['maik', Math.PI, mousePos.x, mousePos.y],
		['nega', 0, mousePos.y, mousePos.x],
		['line', mousePos.x, mousePos.y, mousePos.y, mousePos.x],
		['debug', 
			'[' + mousePos.x.toString() + ', ' + mousePos.y.toString() + ']', 
			400, 
			400
		]
	]});
	*/
}

// SPAWN DE UN ENEMIGO
function spawn(){
	const angle_spawn = Math.random() * 2 * Math.PI;
	
	// Hacerlo aparecer en una posición aleatoria a un radio fijo
	entities.push(new Maik(false, {
		x: Math.floor( .5 * canvas.width + canvas.width * Math.cos(angle_spawn) ), 
		y: Math.floor( .5 * canvas.height + canvas.height * Math.sin(angle_spawn) ) 
	}));
	enemy_counter ++;
	return;
}

// VERIFICAR COLISIÓN
function box_collide(b1, b2){
	if(b1.x + b1.w < b2.x){
		return false;
	}else if(b2.x + b2.w < b1.x){
		return false;
	}else if(b1.y + b1.h < b2.y){
		return false;
	}else if(b2.y + b2.h < b1.y){
		return false;
	}else{
		return true;
	}
}

// COLISIÓN (El rectángulo de área máxima inscrito en la elipse inscrita en la drawcage)
function hitbox(cx, cy, w, h, hitbox, vel){
		
		// No calcular hitbox si la drawCage que llega tiene área cero
		if(w * h == 0){
			return;
		}
		
		// Calcular la hitbox cuando no está creada
		if(hitbox == null){
			
			// Centro y radio de la elipse
			const ell_cx = Math.abs(.5 * w);
			const ell_cy = Math.abs(.5 * h);
			
			// Vértice del rectángulo inscrito de área máxima
			const rx = ell_cx / Math.sqrt(2);
			const ry = Math.sqrt(
				( Math.pow(w * h/ 2, 2) - Math.pow(h, 2) * Math.pow(rx, 2)) / Math.pow(w, 2)
			);
			
			// Ancho y alto del rectángulo inscrito de área máxima
			const rw = w / Math.sqrt(2);
			const rh = 2 * ry;
			
			// Devolver rectángulo según el centro recibido
			return {
				x: cx + ell_cx - rx,
				y: cy + ell_cy - ry,
				w: rw,
				h: rh
			};
		
		// Desplazar hitbox cuando ya existe
		}else{
			return {
				x: hitbox.x + vel.x,
				y: hitbox.y + vel.y,
				w: hitbox.w,
				h: hitbox.h
			};
		}
}

// AGREGAR PARTÍCULA
function add_particle(part, created){
	
	// Si la solicitud es de una partícula no creada aún, se acepta
	if(!created){
		add_particle({
			req: ['circle', part[0], part[1], part[2]],
			v_x: part[3],
			v_y: part[4],
		}, true);
		return;
	}
	
	// La solicitud de una partícula vieja se acepta, siempre que no se haya diluido
	if(part == null){
		return;
	}else{
		particles.push(part);
	}
}

// CALCULAR MOVIMIENTO DE UNA PARTÍCULA
function move_particle(part){
	
	// Valores a recalcular
	var x = part.req[1];
	var y = part.req[2];
	var vx = part.v_x;
	var vy = part.v_y;
	var r = part.req[3];
	var o = part.op;
	
	// Terminar recursión al agotar opacidad
	if(o < 0){
		return null;
	}
	
	// Empezar con opacidad 100%
	if(o == null){
		o = 1;
	}
	
	// Pedir una particula con nuevo centro y opacidad
	return {
		req: ['circle', x + vx, y + vy, r],
		v_x: vx,
		v_y: vy,
		op: o - .34
	};
}

// CAPTURA DE POSICIÓN DEL MOUSE
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(),root = document.documentElement;
	
	// return relative mouse position
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
	
    return {
      x: mouseX,
      y: mouseY
    };
}
