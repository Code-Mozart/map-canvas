/*

MAP CANVAS - v0.1.0

author: Codemozart

*/


// CONSTANTS

const BASE_URL = "https://localhost"

const DEFAULT_FONT_FAMILY = "Georgia"
const DEFAULT_FONT_SIZE = "12px"
const DEFAULT_TEXT_COL = getComputedStyle(document.documentElement).getPropertyValue('--default-fg-color')


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

function getTextHeight(text) {
    const metrics = canvas.measureText(text)
    return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
}

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
	},

    drawText: function(text, screen, color = DEFAULT_TEXT_COL, size = DEFAULT_FONT_SIZE) {
        canvas.save()
        
        canvas.font = size + " " + DEFAULT_FONT_FAMILY
        canvas.fillStyle = color

        lines = text.split("\n")
        lineHeights = lines.map(line => getTextHeight(line))
        totalTextHeight = lineHeights.reduce((acc, lineHeight) => acc + lineHeight, 0)
        let y = canvasElement.height / 2 - (totalTextHeight / 2)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (screen == "centered") {
                canvas.textAlign = "center"
                canvas.fillText(line, canvasElement.width / 2, y);
            }
            else {
                canvas.fillText(line, screen.x, screen.y);
            }
            y += lineHeights[i]
        }
        
    	canvas.restore()
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


// MODELS

class Map {
    constructor(width, height) {
        this.width = width
        this.height = height
    }

    draw() {
        ScreenDraw.drawText("New map created", "centered", DEFAULT_TEXT_COL, "20pt")
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

const NoMap = {
    draw: function() {
        ScreenDraw.drawText(
            "No map displayed\n" + "Either load an existing map or create a new one",
            "centered", "rgb(231, 125, 121)", "20pt"
        )
    }
}

let map = NoMap


// HTML CALLBACKS

function onNewMap() {
    map = new Map(100, 100)
}


// RUN

function update(deltaTime) {
}

function draw() {
	// clear
    ScreenDraw.fillRect({ x: 0, y: 0 }, canvasElement.width, canvasElement.height, canvasElement.color)
    
    map.draw();
}

function loop() {
    requestAnimationFrame(loop)
    update(0)
    draw()
}

loop()
