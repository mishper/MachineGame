var zoom = 32; //number of tiles in a row
var grid = 25; //width of each tile in pixels
var world;

function init() {
	world = new World();
	world.update(); //call update to show visible tiles at the start
}
function move(dir) { //this is essentially the main game loop
	world.player.move(dir);
	world.update();
}
class World {
	constructor() {
		this.tiles = [];
		this.ground = document.getElementById("ground");
		for(var y = 0; y < zoom*.72; y++){
			for(var x = 0; x < zoom; x++){
				var viewTile = document.createElement("div");
				this.ground.appendChild(viewTile);
				this.tiles[x+y*zoom] = new Tile(x,y,viewTile);
			}
		}
		this.player = new Player(zoom/2,parseInt(zoom*.72/2)); //add new player at the center
	}
	update() {
		//move player div
		this.player.elem.style.top = this.player.y*grid+"px";
		this.player.elem.style.left = this.player.x*grid+"px";
		//update which tiles are visible
		this.player.look();
		for(var i = 0; i < this.tiles.length; i++){
			this.tiles[i].update();
		}
	}
}
class Tile {
	constructor(x,y,elem) {
		this.x = x;
		this.y = y;
		this.elem = elem;
		this.c = "#dd"+String(Math.floor(Math.random()*10)); //random color
		this.isVisible = false;
		this.wasVisible = false;
		this.elem.style.backgroundColor = this.c;
	}
	update(){
		if(this.isVisible){
			console.log("vis");
			this.elem.style.opacity = 1;
			this.wasVisible = true;
		}else if(this.wasVisible){
			this.elem.style.opacity = .25;
		}
	}
}
class Player {
	constructor(x,y) {
		this.x = x;
		this.y = y;
		this.elem = document.getElementById("player");
		this.elem.style.top = this.y*grid+"px";
		this.elem.style.left = this.x*grid+"px";
	}
	move(dir){
		switch(dir){
			case "up":
				this.y--;
				break;
			case "left":
				this.x--;
				break;
			case "right":
				this.x++;
				break;
			case "down":
				this.y++;
				break;
		}
	}
	look(){
		//set all tiles to not visible so that only the currently visible tiles carry that property
		for(var i = 0; i < world.tiles.length; i++){ 
			world.tiles[i].isVisible = false;
		}
		for(var y = this.y-1; y < this.y+2; y++){
			for(var x = this.x-1; x < this.x+2; x++){
				world.tiles[x+y*zoom].isVisible = true;
			}
		}
	}
}