/*

MAP CANVAS - v0.1.0

author: Codemozart

*/


// CONSTANTS

const BASE_URL = "https://localhost"


// HTML ELEMENTS

const canvasElement = document.querySelector("canvas")
const controlsAreaElement = document.querySelector("div")


// INITIALIZATION

canvasElement.width = canvasElement.clientWidth
canvasElement.height = canvasElement.clientHeight
const canvas = canvasElement.getContext("2d")


// WORLD

class Camera {
	constructor() {
		this.world = { x: 0, y: 0 }
		this.zoom = 1.0

		this.wMousePosStartDrag = { x: 0, y: 0 }
	}

	toScreen(world) {
		return {
			x: Math.floor( (world.x - this.world.x) * this.zoom + (canvasElement.width / 2.0) ),
			y: Math.floor( (world.y - this.world.y) * this.zoom + (canvasElement.height / 2.0) )
		}
	}

	lenToScreen(wLen) {
		return wLen * this.zoom
	}

	toWorld(screen) {
		return {
			x: (screen.x - (canvasElement.width / 2.0)) / this.zoom + this.world.x,
			y: (screen.y - (canvasElement.height / 2.0)) / this.zoom + this.world.y
		}
	}

	onMouse(sMousePos) {
		let wMousePos = this.toWorld(sMousePos)
		if (mouse.lmb) {
			this.world.x += this.wMousePosStartDrag.x - wMousePos.x
			this.world.y += this.wMousePosStartDrag.y - wMousePos.y
		}
		this.wMousePosStartDrag = this.toWorld(sMousePos)
	}
}


// EVENT HANDLERS

canvasElement.addEventListener('contextmenu', e => e.preventDefault());

canvasElement.addEventListener("mousemove", (e) => {
	mouse.x = e.pageX
	mouse.y = e.pageY
	cam.onMouse({x: mouse.x, y: mouse.y})
	const wMouse = cam.toWorld(mouse)
	mouse.tx = Math.floor(wMouse.x)
	mouse.ty = Math.floor(wMouse.y)
})

canvasElement.addEventListener("mousedown", (e) => {
	mouse.lmb = true
})

canvasElement.addEventListener("mouseup", (e) => {
	mouse.lmb = false
})


// DRAW HELPERS

const ScreenDraw = {
	drawLine: function(start, end, color, width = 1.0) {
		canvas.save()
	
		canvas.beginPath()
		canvas.moveTo(Math.ceil(start.x), Math.ceil(start.y))
		canvas.lineTo(Math.ceil(end.x), Math.ceil(end.y))
		canvas.lineWidth = width;
		canvas.strokeStyle = color
		canvas.stroke()
	
		canvas.restore()
	},

	drawDashedLine: function(start, end, color, pattern = [5, 5], width = 1.0) {
		canvas.save()
	
		canvas.beginPath()
		canvas.setLineDash(pattern)
		canvas.moveTo(Math.ceil(start.x), Math.ceil(start.y))
		canvas.lineTo(Math.ceil(end.x), Math.ceil(end.y))
		canvas.lineWidth = width;
		canvas.strokeStyle = color
		canvas.stroke()
	
		canvas.restore()
	},

	drawRect: function(screen, width, height, color, thickness = 1.0) {
		canvas.save()
	
		canvas.beginPath()
		canvas.rect(Math.ceil(screen.x), Math.ceil(screen.y), width, height)
		canvas.lineWidth = thickness;
		canvas.strokeStyle = color
		canvas.stroke()
	
		canvas.restore()
	},

	fillRect: function(screen, width, height, color) {
		canvas.save()
	
		canvas.beginPath()
		canvas.rect(Math.ceil(screen.x), Math.ceil(screen.y), width, height)
		canvas.fillStyle = color
		canvas.fill()
	
		canvas.restore()
	},

	drawCircle: function(screen, radius, color, width = 1.0) {
		canvas.save()
	
		canvas.beginPath()
		canvas.arc(screen.x, screen.y, radius, 0.0, Math.PI * 2, false)
		canvas.lineWidth = width;
		canvas.strokeStyle = color
		canvas.stroke()
	
		canvas.restore()
	},

	fillCircle: function(screen, radius, color) {
	canvas.save()

	canvas.beginPath()
	canvas.arc(screen.x, screen.y, radius, 0.0, Math.PI * 2, false)
	canvas.fillStyle = color
	canvas.fill()

	canvas.restore()
	},

	drawImg: function(img, screen = { x: 0, y: 0 }, width = img.width, height = img.height) {
		canvas.drawImage(img, screen.x, screen.y, width, height)
	}
}

const WorldDraw = {
	drawRect: function(world, width, height, color, thickness = null) {
		ScreenDraw.drawRect(cam.toScreen(world), cam.lenToScreen(width), cam.lenToScreen(height), color,
			thickness == null ? 1.0 : cam.lenToScreen(thickness))
	},
	fillRect: function(world, width, height, color) {
		ScreenDraw.fillRect(cam.toScreen(world), cam.lenToScreen(width), cam.lenToScreen(height), color)
	},
	drawCircle: function(world, radius, color, width = 1.0) {
		ScreenDraw.drawCircle(cam.toScreen(world), cam.lenToScreen(radius), color, width)
	},
	fillCircle: function(world, radius, color) {
		ScreenDraw.fillCircle(cam.toScreen(world), cam.lenToScreen(radius), color)
	}
}


// OBJECTS

const mouse = {
	x: 0, y: 0,
	tx: 0, ty: 0,
	lmb: false
}

let cam = new Camera()
cam.zoom = 1.0


// RUN

function update(deltaTime) {
}

function draw() {
	// clear
    ScreenDraw.fillRect({ x: 0, y: 0 }, canvasElement.width, canvasElement.height, canvasElement.color)
    
    // draw sample
    WorldDraw.fillCircle({x: 0, y: 0}, 3, "rgb(200, 200, 200)")
}

function loop() {
    requestAnimationFrame(loop)
    update(0)
    draw()
}

loop()
