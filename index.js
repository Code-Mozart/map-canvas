/*

MAP CANVAS - v0.1.0

author: Codemozart

*/


// CONSTANTS

const BASE_URL = "https://localhost"

const DEFAULT_FONT_FAMILY = "Georgia"
const DEFAULT_FONT_SIZE = "12px"
const DEFAULT_TEXT_COL = getComputedStyle(document.documentElement).getPropertyValue('--default-fg-color')

const ZOOM_STRENGTH = 0.2
const MIN_ZOOM = 2.0
const MAX_ZOOM = 50.0


// HTML ELEMENTS

const canvasElement = document.querySelector("canvas")
const controlsAreaElement = document.querySelector("div")

const newMapDialogElement = document.getElementById("new-map-dialog")


// INITIALIZATION

canvasElement.width = canvasElement.clientWidth
canvasElement.height = canvasElement.clientHeight
const canvas = canvasElement.getContext("2d")

const defaultBorderColor = getComputedStyle(canvasElement).borderColor
const defaultBorderWidth = getComputedStyle(canvasElement).borderWidth


// HELPERS

function assert(condition) {
	if (!condition) {
		alert("Assertion failed!")
	}
}


// MATHS

class Vec3 {
	constructor(x, y, z = 0.0) {
		this.x = x
		this.y = y
		this.z = z
	}

	magnitudeSqr() {
		return (this.x * this.x) + (this.y * this.y) + (this.z * this.z)
	}
	
	magnitude() {
		return Math.sqrt(this.magnitudeSqr())
	}

	normalize() {
		const mag = this.magnitude()
		this.x /= mag
		this.y /= mag
		this.z /= mag
		return this
	}
}


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
		if (mouse.lmb && mode == Modes.Pan) {
			this.world.x += this.wMousePosStartDrag.x - wMousePos.x
			this.world.y += this.wMousePosStartDrag.y - wMousePos.y
		}
		this.wMousePosStartDrag = this.toWorld(sMousePos)
	}

	zoomIn() {
		if (map == NoMap) return
		this.zoom = Math.min(this.zoom * (1.0 + ZOOM_STRENGTH), MAX_ZOOM)
	}

	zoomOut() {
		if (map == NoMap) return
		this.zoom = Math.max(this.zoom * (1.0 - ZOOM_STRENGTH), MIN_ZOOM)
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

document.addEventListener("keypress", (e) => {
	switch (e.key) {
		case "+":	cam.zoomIn();	break;
		case "-":	cam.zoomOut();	break;
		case " ":	changeMode();	break;
	}
})

document.addEventListener("keydown", (e) => {
	switch (e.key) {
		case "Shift":	drawMethod = DrawMethods.Normal;	break;
	}
})

document.addEventListener("keyup", (e) => {
	switch (e.key) {
		case "Shift":	drawMethod = DrawMethods.Height;	break;
	}
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
		this.heightMap = new Int16Array(width * height)

		for (let i = 0; i < this.heightMap.length; i++) {
			this.heightMap[i] = 0.5 + ((Math.random() - 0.5) * (0xFFFF / 100))
		}
    }

	draw() {
		switch (drawMethod) {
			case DrawMethods.Normal:	this.drawWithMethod(this.drawNormal);	break;
			default:					this.drawWithMethod(this.drawHeight);	break;
		}
	}

    drawWithMethod(method = this.drawHeight) {
		const xBegin = Math.max(-(this.width / 2), cam.wTopLeft.x)
		const xEnd = Math.min(this.width / 2, cam.wBottomRight.x)
		const yBegin = Math.max(-(this.height / 2), cam.wTopLeft.y)
		const yEnd = Math.min(this.height / 2, cam.wBottomRight.y)

		for (let y = yBegin; y < yEnd; y++) {
			for (let x = xBegin; x < xEnd; x++) {
				method(this, x, y)
			}
		}
    }

	drawHeight(map, x, y) {
		const v = ((map.heightMap[map.toIndex(x, y)] + 0x8000) / 0xFFFF) * 255
		WorldDraw.fillRect({x, y}, 1, 1, `rgb(${v}, ${v}, ${v})`)
	}

	drawNormal(map, x, y) {
		const px = Math.floor(x + (map.width / 2))
		const py = Math.floor(y + (map.height / 2))

		const cc = map.heightMap[map.toIndex(x, y)]
		const tl = ((px - 1) >= 0 && (py - 1) >= 0)? map.heightMap[map.toIndex(x - 1, y - 1)] : cc
		const tc = ((py - 1) >= 0)? map.heightMap[map.toIndex(x, y - 1)] : cc
		const tr = ((px + 1) < map.width && (py - 1) >= 0)? map.heightMap[map.toIndex(x + 1, y - 1)] : cc
		const cl = ((px - 1) >= 0)? map.heightMap[map.toIndex(x - 1, y)] : cc
		const cr = ((px + 1) < map.width)? map.heightMap[map.toIndex(x + 1, y)] : cc
		const bl = ((px - 1) >= 0 && (py + 1) < map.height)? map.heightMap[map.toIndex(x - 1, y + 1)] : cc
		const bc = ((py + 1) < map.height)? map.heightMap[map.toIndex(x, y + 1)] : cc
		const br = ((px + 1) < map.width && (py + 1) < map.height)? map.heightMap[map.toIndex(x + 1, y + 1)] : cc

		const scale = 0.0001
		const n = new Vec3(
			scale * -((br - bl) + (2 * (cr - cl)) + (tr - tl)),
			scale * -((tl - bl) + (2 * (tc - bc)) + (tr - br)),
			1.0
		)
		n.normalize()
		
		WorldDraw.fillRect({x, y}, 1, 1,
			`rgb(${n.x * 255}, ${n.y * 255}, ${n.z * 255})`)
	}

	toIndex(x, y) {
		return Math.floor(y + (this.height / 2)) * this.width + Math.floor(x + (this.width / 2))
	}
}


// CONTROLLERS

const MapCanvas = {
	circular(pos, radius, strength) {
		assert(map != NoMap)

		const radiusSqr = radius * radius
		const xBegin = Math.max(pos.x - radius, -(map.width / 2))
		const xEnd = Math.min(pos.x + radius, map.width / 2)
		const yBegin = Math.max(pos.y - radius, -(map.height / 2))
		const yEnd = Math.min(pos.y + radius, map.height / 2)
		for (let y = yBegin; y <= yEnd; y++) {
			for (let x = xBegin; x <= xEnd; x++) {
				const dx = pos.x - x
				const dy = pos.y - y
				const distSqr = (dx * dx) + (dy * dy)

				if (distSqr <= radiusSqr) {
					map.heightMap[map.toIndex(x, y)] += (radiusSqr - distSqr) * strength
				}
			}
		}
	}
}


// OBJECTS

const mouse = {
	x: 0, y: 0,
	tx: 0, ty: 0,
	lmb: false
}

let cam = new Camera()
cam.zoom = 5.0

const NoMap = {
    draw: function() {
        ScreenDraw.drawText(
            "No map to display\n" + "Either load an existing map or create a new one",
            "centered", "rgb(231, 125, 121)", "16pt"
        )
    }
}
let map = NoMap

const Modes = {
	Pan: "pan",
	Draw: "draw"
}
let mode = Modes.Pan

const DrawMethods = {
	Height: "height",
	Normal: "normal"
}
let drawMethod = DrawMethods.Height


// HTML CALLBACKS

function onNewMap() {
	newMapDialogElement.showModal()
}

function createNewMap() {
	newMapDialogElement.close()
    map = new Map(
		newMapDialogElement.querySelector("#map-width-number-field").valueAsNumber,		
		newMapDialogElement.querySelector("#map-height-number-field").valueAsNumber
	)
	cam.world = {x: 0, y: 0}
}


// LOGIC

function changeMode() {
	switch (mode) {
		case Modes.Pan:		mode = Modes.Draw;	break;
		case Modes.Draw:	mode = Modes.Pan;	break;
	}
	
	switch (mode) {
		case Modes.Pan:
			canvasElement.style.borderColor = defaultBorderColor
			canvasElement.style.borderWidth = defaultBorderWidth
			break;
		case Modes.Draw:
			canvasElement.style.borderColor = "rgb(54, 233, 135)"
			canvasElement.style.borderWidth = "5px"
			break;
	}
}


// RUN

function update(deltaTime) {
	cam.wTopLeft = cam.toWorld({x: 0, y: 0})
	cam.wBottomRight = cam.toWorld({x: canvasElement.width - 1, y: canvasElement.height - 1})
	
	if (mouse.lmb && mode == Modes.Draw) {
		MapCanvas.circular({x: mouse.tx, y: mouse.ty}, 5.0, 10.0)
	}
}

function draw() {
	// clear
    ScreenDraw.fillRect({ x: 0, y: 0 }, canvasElement.width, canvasElement.height, canvasElement.color)
    
    map.draw();

	if (mode == Modes.Draw) {
		const col = (mouse.lmb)? "rgb(54, 233, 135)" : defaultBorderColor
		WorldDraw.drawCircle({x: mouse.tx, y: mouse.ty}, 5.0, col)
	}
}

function loop() {
    requestAnimationFrame(loop)
    update(0)
    draw()
}

loop()
