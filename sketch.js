function removeFromArray(array, element) {
	for (let i = array.length - 1; i >= 0; i--) {
		if (array[i] == element) {
			array.splice(i, 1)
		}
	}
}

function heuristic(a, b) {
	let d = dist(a.i, a.j, b.i, b.j)
	return d
}

const rows = 50
const cols = 80
const WALL_PERCENTAGE = 0.3

let grid = new Array(cols)

let openSet = [];
let closedSet = [];
let startSquare;
let endSquare;
let w, h;
let path = []

searching = false;

function Spot(i, j) {
	this.i = i
	this.j = j
	this.f = 0
	this.g = 0
	this.h = 0
	this.neighbors = [];
	this.previous = undefined
	this.wall = random(1) < WALL_PERCENTAGE

	this.show = function (col) {
		fill(col);
		noStroke();
		if (this.wall) {
			fill(50)
		}
		rect(this.i * w, this.j * h, w - 1, h - 1)
	}

	this.addNeighbors = function (grid) {
		let i = this.i
		let j = this.j
		for (let k = -1; k <= 1; k++) {
			for (let l = -1; l <= 1; l++) {
				if (0 <= i + k && i + k < cols && 0 <= j + l && j + l < rows && !(k == 0 && l == 0)) {
					this.neighbors.push(grid[i + k][j + l])
				}
			}
		}

	}
}

function setup() {
	createCanvas(1000, 600);

	w = width / cols;
	h = height / rows;

	for (let i = 0; i < cols; i++) {
		grid[i] = new Array(rows)
	}

	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j] = new Spot(i, j)
		}
	}

	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j].addNeighbors(grid)
		}
	}

	randomizeButton = createButton('Randomize Walls');
	randomizeButton.mousePressed(randomize);

	clearButton = createButton('Clear Walls');
	clearButton.mousePressed(clearWalls);

	// resetButton = createButton('Reset Search');
	// resetButton.mousePressed(reset);

	startButton = createButton('Start Search');
	startButton.mousePressed(start);

	reset();
}

function clearWalls() {
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j].wall = false
		}
	}
	reset()
}

function randomize() {
	reset()
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j].wall = random(1) < WALL_PERCENTAGE
		}
	}
	startSquare.wall = false
	endSquare.wall = false
}

function start() {
	reset()
	searching = true
}

function reset() {
	console.log("resetting")
	openSet = []
	closedSet = []
	path = []

	startSquare = grid[0][0]
	endSquare = grid[cols - 1][rows - 1]
	startSquare.wall = false
	endSquare.wall = false
	searching = false

	openSet.push(startSquare)

	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j].previous = undefined;
		}
	}
}

function draw() {

	if (mouseIsPressed) {
		if(mouseY < height){
			reset()
		}

		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				let leftBoundary = grid[i][j].j*h
				let rightBoundary = grid[i][j].j*h+h
				let topBoundary = grid[i][j].i*w
				let botBoundary = grid[i][j].i*w+w

				if(leftBoundary - 3 < mouseY && mouseY < rightBoundary + 3 && topBoundary - 3 < mouseX && mouseX < botBoundary + 3){
					grid[i][j].wall = true
				}
			}
		}
	}

	let current
	if (openSet.length > 0 && searching) {
		let lowestIndex = 0
		for (let i = 0; i < openSet.length; i++) {
			if (openSet[i].f < openSet[lowestIndex].f) {
				lowestIndex = i;
			}
		}
		current = openSet[lowestIndex]

		if (current === endSquare) {
			searching = false;
			console.log("Done")
		}


		removeFromArray(openSet, current)
		closedSet.push(current)

		let neighbors = current.neighbors
		for (let i = 0; i < neighbors.length; i++) {
			let neighbor = neighbors[i]

			if (!closedSet.includes(neighbor) && !neighbor.wall) {
				let tempG = current.g + 1

				let newPath = false
				if (openSet.includes(neighbor)) {
					if (tempG < neighbor.g) {
						neighbor.g = tempG
						newPath = true
					}
				} else {
					neighbor.g = tempG
					newPath = true
					openSet.push(neighbor)
				}

				if (newPath) {
					neighbor.h = heuristic(neighbor, endSquare)
					neighbor.f = neighbor.g + neighbor.h
					neighbor.previous = current
					showPath(current)
				}
			}
		}

	} else {
		searching = false;
		//no solutions
	}

	background(0)
	//everything is white first
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j].show(color(255));
		}
	}

	//color closed set red
	for (let i = 0; i < closedSet.length; i++) {
		closedSet[i].show(color(199, 18, 5))
	}

	//color open set green
	for (let i = 0; i < openSet.length; i++) {
		openSet[i].show(color(120, 198, 3))
	}

	//startSquare and endSquare are blue
	startSquare.show(color(47, 165, 203))
	endSquare.show(color(47, 165, 203))

	if (searching) {
		showPath(current)
	}

	for (let i = 0; i < path.length; i++) {
		path[i].show(color(47, 165, 203))
	}
}

function showPath(current) {
	path = [];
	let temp = current
	path.push(temp)
	while (temp.previous != undefined) {
		path.push(temp.previous)
		temp = temp.previous
	}
}