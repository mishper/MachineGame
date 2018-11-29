var zoom = 32; //number of tiles in a row
var grid = 25; //width of each tile in pixels
var world;
var hud;

function init() {
	world = new World();
	hud = new HUD();
	world.update(); //call update to display initialized game state
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
		this.player.update();
		hud.update();
	}
}
class HUD {
	constructor(){
		this.fuelGauge = document.getElementById("amount");
		this.infoCont = document.getElementById("infoCont");	
	}
	update(){
		this.fuelGauge.style.height = String(world.player.fuel/world.player.tankSize*100)+"%";
		var tile = world.tiles[world.player.x+world.player.y*zoom];
		if(tile.content.length > 0){
			this.infoCont.innerHTML = "<div class='tileItem'><div class='tileItemName'>Fuel</div><div onClick='world.player.addItem(0)' class='tileItemAdd'>+</div></div>";
		}else{
			this.infoCont.innerHTML = "<p>Looks like nothings here<p>";
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
		this.content = [];
		if(Math.random() > .9){
			var fuelSpot = new TileContent();
			this.content.push(fuelSpot);
			this.elem.appendChild(fuelSpot.elem);
		}
	}
	update(){
		if(this.isVisible){
			this.elem.style.opacity = 1;
			this.wasVisible = true;
		}else if(this.wasVisible){
			this.elem.style.opacity = .25;
		}
	}
	updateContent(){
		if(this.content.length > 0){
		
		}else{
			this.elem.innerHTML = "";
		}
	}
}
class TileContent {
	constructor(){
		this.fuel = 30;
		this.elem = document.createElement("div");
		this.elem.className = "fuelSpot";	
	}
}
class Player {
	constructor(x,y) {
		this.x = x;
		this.y = y;
		this.elem = document.getElementById("player");
		this.elem.style.top = this.y*grid+"px";
		this.elem.style.left = this.x*grid+"px";
		this.tankSize = 150;
		this.fuel = 100;
		this.moveCost = 10;
	}
	update(){}
	addItem(i){
		var tile = world.tiles[this.x+this.y*zoom];
		this.fuel += tile.content[i].fuel;
		tile.content.splice(i,1);
		tile.updateContent();
		hud.update();
	}
	move(dir){
		if(this.fuel > this.moveCost){
			this.fuel -= this.moveCost;
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