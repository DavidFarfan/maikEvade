/**
  Copyright 2018

Licensed under the Apache License, Version 2.0(the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

  Author: Ewa Gasperowicz(@devnook)
*/
console.log('> Definición de los dibujantes.');

class Animation {
  constructor(ctx) {
    this.ctx = ctx;
    this.x = ctx.canvas.width / 2;
    this.y = ctx.canvas.height / 2;
    this.rMax = Math.min(this.x - 20, this.y - 20, 60);
    this.r = 40;
    this.grow = true;
    this.run = true;

	// Función bound para referenciar el objeto al llamar por callback
    this.boundAnimate = this.animate.bind(this);
  }

  // El método funciona igual en toda instancia, también podría funcionar ThemedAnimation por herencia.
  static fibonacci(num) {
    return (num <= 1) ? 1 : Animation.fibonacci(num - 1) + Animation.fibonacci(num - 2);
  }

  // Funciona distinto en cada instancia, según su posición y radio.
  drawCircle() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    this.ctx.fill();
  };

  // Dibujo de un frame, esto es sobreescrito.
  animate() {
	 
	// Notificar si el frame se calculó con el método de la clase padre
	console.log('Dibujo de un frame desde el prototipo Animation');
	
    if (!this.run) {
      return;
    }
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    if (this.r === this.rMax || this.r === 0) {
      this.grow = !this.grow;
    };
    this.r = this.grow ? this.r + 1 : this.r - 1;
    this.drawCircle();
    requestAnimationFrame(this.boundAnimate);
  }

  // Parar/reanudar dibujo sobre el contexto proporcionado
  stop() {
    this.run = false;
  }

  start() {
    this.run = true;
    this.animate();
  }
}

// Clase que hereda
class ThemedAnimation extends Animation {
  constructor(ctx) {
    super(ctx);
    this.counter = 1;
    this.themeColors = ['red', 'gold'];
    this.theme = this.themeColors;
  }

  // Este es el cálculo del rango de colores de un tema
  set theme(colors) {
	
    //	Este es el cálculo que hace costosa la operación con fines ilustrativos (prescindible)
    Animation.fibonacci(40);
	
	// Se crea un canvas invisible y se obtiene su contexto para hacer operaciones
    const ctx = new OffscreenCanvas(100, 1).getContext('2d');
	
	// En este contexto, se hace un gradiente horizontal con los colores del tema
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[0]);
    ctx.fillStyle = gradient;
	
	// Se pinta una linea de 1px de grosor con los colores generados
    ctx.fillRect(0, 0, ctx.canvas.width, 1);
	
	// Se obtiene la información pixel a pixel de la imagen generada (en un objeto ImageData)
    // (Es un arreglo de pixeles, que son 4 números (r,g,b,a) Uint8bits)
    const imgd = ctx.getImageData(0, 0, ctx.canvas.width, 1);
    const theme = [].slice.call(imgd.data);
    
	// Del canvas invisible, solo se rescata lo almacenado en ImageData
	this.theme_ = theme;
	//console.log(this.theme_);
  }

  // Este es el arreglo calculado que hay que partir para obtener el color intermedio
  get theme() {
    return this.theme_;
  }

  // Este método no es tan costoso, solo toma una parte de un arreglo que ya se calculó.
  changeColor(counter) {
	
	// Recorrer el gradiente modularmente (La longitud del gradiente/Offscreen es 100)
    let colorCounter = counter % 100;
    let pixArr = this.theme.slice(colorCounter * 4, colorCounter * 4 + 4);
	
	// Obtener color del pixel seleccionado para llenar el círculo
    let color = `rgba(${pixArr[0]}, ${pixArr[1]}, ${pixArr[2]}, ${pixArr[3]} )`;
    this.ctx.fillStyle = color;
  }

  // Por solapamiento, este es el método animador que termina ejecutándose.
  animate() {
	
	// Está arriba de la comprobación de bandera para que el canvas quede vacío antes de cambiar de hilo.
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	
	// Decidir si animar, porque el mismo código se ejecutará en paralelo. (Main y Worker)
	// Gracias a esto, main no calcula Fibonacci, permitiéndole al botón funcionar fluidamente.
    if (!this.run) {
      return;
    }
	
	// Ajustar velocidad del radio
    if (this.r === this.rMax || this.r === 0) {
      this.grow = !this.grow;
    };
	
	// Cuando la animación ya vaya a acabar, se avisa que el hilo estará ocupado con los rangos
    if (this.r === 1 && this.grow === false) {
      this.ctx.fillText('Preparing theme... Thread busy', this.x - 60, this.ctx.canvas.height - 10);
	} else {
      this.ctx.fillText('UI interactive', this.x - 30, this.ctx.canvas.height - 10);
    }
	
	// Los dos temas se intercalan, una animación de rojo-oro, y otra de azul-verde
    if (this.r === 0 && this.grow) {
      this.themeColors = (this.themeColors[0] === 'red') ? ['blue', 'green'] : ['red', 'gold'];
      
	  // Se repite el cálculo del rango de cada tema con cada aparición (ESTO ES LO COSTOSO)
	  this.theme = this.themeColors;
    };
	
	// Preparar un color intermedio del rango calculado (una parte de theme_)
    this.changeColor(this.counter);
	
	// Pasar al siguiente de la paleta
    this.counter++;

	// Ajustar el radio
    this.r = this.grow ? this.r + 1 : this.r - 1;

	// Pintar el Círculo en el contexto provisto
    this.drawCircle();
	
	// No es como setInterval porque solicita una sola actualización. Por eso no tiene ese parámetro.
	// Es más parecido a una llamada recursiva, pero es propia de un hilo (un objeto Window).
	// "Se ajusta a 60FPS aprox." la bandera run salta en el momento justo para dejar vacío el canvas.
    requestAnimationFrame(this.boundAnimate);
  }
}
