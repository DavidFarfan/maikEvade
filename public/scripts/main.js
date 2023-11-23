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

// Teclas direccionales
const UP = 'KeyU';
const DOWN = 'KeyN';
const RIGHT = 'KeyK';
const LEFT = 'KeyH';

// Teclas presionadas
var pressedPool = {};

// Se corre una instancia de Worker (hilo) con el código animador
const animator = new Worker("/scripts/animador.js");

// El canvas puede transferir al Worker el control de su contexto.
// para eso, se lo tiene que enviar a través de un mensaje con un objeto Offscreen conteniéndolo.
const canvas = document.getElementById('draw');

// Posicion del mouse
var mousePos = {
	x: .5 * canvas.width,
	y: .5 * canvas.height
};

// Capturar presión de tecla
window.addEventListener('keydown', (evt) => {
	pressed_pool(evt.code, true);
}, false);

// Capturar alivio de tecla
window.addEventListener('keyup', (evt) => {
	pressed_pool(evt.code, false);
}, false);

// Capturar posición del mouse
canvas.addEventListener('mousemove', (evt) => {
	mousePos = getMousePos(canvas, evt);
}, false);

// Reiniciar el juego con un click
canvas.addEventListener('click', () => {
	location.reload();
}, false);

const main_offscreen = canvas.transferControlToOffscreen();

// Enviar al animador el contexto
animator.postMessage({ type: 'context', canvas: main_offscreen }, [main_offscreen]);

// Leer palanca
const joystick = new Image();
joystick.crossOrigin = 'anonymous';
joystick.src = 'assets/palanca.png';
joystick.onload = function() {
	
	// Convertir sprite a formato transferible
	const aux_canvas = new OffscreenCanvas(
		joystick.width, 
		joystick.height
	)
	aux_canvas.getContext('2d').drawImage(joystick, 0, 0);
	createImageBitmap(aux_canvas).then(resolve => {
		
		// Enviar el sheet de la palanca al animador
		animator.postMessage({ type: 'palanca', bitmap: resolve }, [resolve]);
	});
};

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
	request.push(['debug', enemy_counter, canvas.width - 50, canvas.height - 30]);
	
	// Debug: teclas
	request.push([
			'debug',
			pressed_direction(),
			canvas.width - 50,
			canvas.height - 40
		]);
	let keys = Object.keys(pressedPool);
	for(var i=0; i<keys.length; i++){
		request.push([
			'debug',
			keys[i] + ': ' + pressedPool[keys[i]],
			canvas.width - 50,
			canvas.height - 50 - (i * 10)
		]);
	};
	
	// Game Over
	if(!Maik.playable){
		request.push(['over']);
	
	// Win
	}else if(Maik.win){
		request.push(['win']);
	}
	
	// Joystick
	request.push(['joystick', pressed_direction()]);
	
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
	
	// Calcular hold de las teclas
	pressed_hold();
	
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
function getMousePos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
	var root = document.documentElement;
	
	// Posición relativa del mouse
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
      x: mouseX,
      y: mouseY
    };
};

// CALCULAR TECLA DOMINANTE DE UNA DICOTOMÍA
function pressed_k1_over_k2(k1, k2){
	
	// Presencia en la lista actual de teclas presionadas
	let p1 = pressedPool[k1];
	let p2 = pressedPool[k2];
	
	// No hay respuesta si ninguna tecla está siendo presionada
	if(p1 == undefined && p2 == undefined){
		return null;
		
	// Casos triviales
	}else if(p1 != undefined && p2 == undefined){
		return true;
	}else if(p1 == undefined && p2 != undefined){
		return false;
	
	// Comparar el orden de inclusión en la lista en caso de que estén en disputa
	}else{
		let o1 = p1[0];
		let o2 = p2[0];
		if(o1 > o2){
			return true;
		}else{
			return false;
		};
	};
};

// CALCULAR DIRECCIÓN PRESIONADA
function pressed_direction(){
	
	// Dicotomías
	let x = pressed_k1_over_k2(RIGHT, LEFT);
	let y = pressed_k1_over_k2(UP, DOWN);
	
	// Decisión entre las 9 direcciones
	if(x == null){
		if(y == null){
			return 5;
		}else if(y){
			return 8;
		}else{
			return 2;
		};
	}else if(x){
		if(y == null){
			return 6;
		}else if(y){
			return 9;
		}else{
			return 3;
		};
	}else{
		if(y == null){
			return 4;
		}else if(y){
			return 7;
		}else{
			return 1;
		};
	};
};

// HOLD DE LAS TECLAS PRESIONADAS
function pressed_hold(){
	
	// Lista actual de teclas presionadas
	let keys = Object.keys(pressedPool);
	
	// Aumentar hold del grupo
	for(var i=0; i<keys.length; i++){
				
		// tecla i-ésima
		let i_code = keys[i];
		
		// Aumentar hold i-ésimo
		pressedPool[i_code][1]++;
	};
};

// CALCULAR TECLAS PRESIONADAS
function pressed_pool(code, add){
	
	// Lista previa de teclas presionadas
	let keys = Object.keys(pressedPool);
	
	// Tecla presionada
	if(add){
		
		// Si la tecla no está en la lista previa, agregarla de último con hold 0
		if(pressedPool[code] == undefined){
			pressedPool[code] = [keys.length, 0];
		};
		
	// Tecla aliviada
	}else{
		
		// Lista actual de teclas presionadas
		let currentPressedPool = {};
		
		// Orden de la tecla aliviada
		let orderOut = pressedPool[code][0];
		
		// Recorrer la lista previa para crear la actual
		for(var i=0; i<keys.length; i++){
			
			// tecla i-ésima
			let i_code = keys[i];
			
			// Si la tecla i-ésima no es la que se alivió, agregarla a la lista actual 
			if(i_code != code){
				let i_pressed = pressedPool[i_code];
				
				// Checar orden y hold de la tecla i-ésima
				let i_order = i_pressed[0];
				let i_hold = i_pressed[1];
				
				// Si la tecla i-ésima es de orden superior a la tecla aliviada, bajarla
				if(i_order > orderOut){
					currentPressedPool[i_code] = [i_order - 1, i_hold];
					
				// Copiar la tecla i-ésima si su orden es inferior a la tecla aliviada
				}else{
					currentPressedPool[i_code] = i_pressed;
				};
			};
		};
		
		// Actualizar lista
		pressedPool = currentPressedPool;
	};
};