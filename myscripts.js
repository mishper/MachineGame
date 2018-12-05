let zoom = 32; //number of tiles in a row
let grid = 25; //width of each tile in pixels
let world;
let hud;

function init() {
	world = new World();
	hud = new HUD();
	world.update(); //call update to display initialized game state
}
function advance(dir) { //this is essentially the main game loop
	world.player.work(dir);
	world.update();
}
class World {
	constructor() {
		this.tiles = [];
		this.ground = document.getElementById("ground");
		for(let y = 0; y < zoom*.72; y++){
			for(let x = 0; x < zoom; x++){
				let viewTile = document.createElement("div");
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
		for(let i = 0; i < this.tiles.length; i++){
			this.tiles[i].update();
		}
		this.player.update();
		hud.update();
	}
}
class HUD {
	constructor(){
		this.fuelGauge = document.getElementById("famt");
		this.biomGauge = document.getElementById("bamt");
		this.infoCont = document.getElementById("infoCont");
		this.hood = document.getElementById("hood");
		this.hoodPopped = false;
	}
	update(){
		this.fuelGauge.style.height = String(world.player.fuel/world.player.fuelTankSize*100)+"%";
		this.biomGauge.style.height = String(world.player.biom/world.player.biomTankSize*100)+"%";
		let tile = world.tiles[world.player.x+world.player.y*zoom];
		this.infoCont.innerHTML = tile.info();
	}
	updateHood(){
		document.getElementById("vesselStats").innerHTML = world.player.info();
		let output = "";
		output +="<div class='hudLabel'>Chassis</div>";
		output += world.player.chassis.info();
		output +="<div class='hudLabel'>Trunks</div>";
		for(let i = 0; i < world.player.trunks.length; i++){
			output += world.player.trunks[i].info();
		}
		output +="<div class='hudLabel'>Tanks</div>";
		for(let i = 0; i < world.player.tanks.length; i++){
			output += world.player.tanks[i].info();
		}
		output +="<div class='hudLabel'>Engines</div>";
		for(let i = 0; i < world.player.engines.length; i++){
			output += world.player.engines[i].info();
		}
		output +="<div class='hudLabel'>Digesters</div>";
		for(let i = 0; i < world.player.digesters.length; i++){
			output += world.player.digesters[i].info();
		}
		document.getElementById("vesselContents").innerHTML = output;
	}
	popHood(){
		this.updateHood();
		if(this.hoodPopped){
			this.hoodPopped = false;
			hood.style.height = "18px";
		}else{
			this.hoodPopped = true;
			hood.style.height = "570px";
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
		if(Math.random() > .5){
			let biomSpot = new BiomSpot();
			this.content.push(biomSpot);
			this.elem.appendChild(biomSpot.elem);
		}else if(Math.random() > .9){
			let fuelSpot = new FuelSpot();
			this.content.push(fuelSpot);
			this.elem.appendChild(fuelSpot.elem);
		}
	}
	info(){
		if(this.content.length > 0){
			let output = "";
			for(let i = 0; i < this.content.length; i++){
				output += this.content[0].info(i);
			}
			return output;
		}else{
			return "<div class='tileItem'><div class='tileItemName'>Looks like nothing is here...</div></div>";
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
		for(let i = 0; i < this.content.length; i++){
			if(this.content[0].empty){this.content.splice(i,1);}
		}
		if(this.content.length > 0){
			
		}else{
			this.elem.innerHTML = "";
		}
	}
}
class TileContent {
	constructor(type){
		this.type = "";
		this.elem = "";	
		this.empty = false;
	}
	info(i){
		return "";
	}
	addToPlayer(){}
}
class BiomSpot extends TileContent{
	constructor(){
		super("biom");
		this.biom = parseInt(Math.random()*30);
		this.elem = document.createElement("div");
		this.elem.className = "biomSpot";
		this.update();
	}
	update(){
		this.elem.style.width = String(this.biom/2)+"px";
		this.elem.style.height = String(this.biom/2)+"px";
		this.elem.style.borderRadius = String(this.biom/4)+"px";
	}
	info(i){
		return "<div class='tileItem'><div class='tileItemName'>Biomass ("+this.biom+")</div><div onClick='world.player.addItem("+i+")' class='tileItemAdd'>+</div></div>";
	}
	addToPlayer(){
		if(world.player.biom != world.player.biomTankSize){
			if(world.player.biom+this.biom >= world.player.biomTankSize){
				let amt = world.player.biomTankSize-world.player.biom;
				world.player.addToTanks("biom",amt);
				this.biom -= amt;
				this.update();
			}else{
				world.player.addToTanks("biom",this.biom);
				this.empty = true;
			}
		}
	}
}
class FuelSpot extends TileContent{
	constructor(){
		super("fuel");
		this.fuel = 30;
		this.elem = document.createElement("div");
		this.elem.className = "fuelSpot";	
	}
	info(i){
		return "<div class='tileItem'><div class='tileItemName'>Fuel ("+this.fuel+")</div><div onClick='world.player.addItem("+i+")' class='tileItemAdd'>+</div></div>";
	}
	addToPlayer(){
		if(world.player.fuel != world.player.fuelTankSize){
			if(world.player.fuel+this.fuel >= world.player.fuelTankSize){
				let amt = world.player.fuelTankSize-world.player.fuel;
				world.player.addToTanks("fuel",amt);
				this.fuel -= amt;	
			}else{
				world.player.addToTanks("fuel",this.fuel);
				this.empty = true;
			}
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
		this.chassis = new Chassis(10, 10, 10);
		this.trunks = [new Trunk(10, 10, 10, 100)];
		this.tanks = [new Tank(10, 10, 10, 100, "fuel", 50),new Tank(10, 10, 10, 100, "biom", 50)];
		this.engines = [new Engine(10, 10, 10, 10)];
		this.digesters = [new Digester(10, 10, 10, 10)];
		this.weight = 0;
		this.moveCost = 0;
		this.fuelTankSize = 0;
		this.biomTankSize = 0;
		this.fuel = 0;
		this.biom = 0;
		this.update();
	}
	update(){
		let calcW = 0; //temp for weight
		let calcFa = 0; //temp for fuel amount
		let calcBa = 0; //temp for biomass amount
		let calcF = 0; //temp for fuel tank capacity
		let calcB = 0; //temp for biomass tank capacity
		calcW += this.chassis.weight;
		for(let i = 0; i < this.trunks.length; i++){
			let comp = this.trunks[i];
			calcW += comp.weight;
		}
		for(let i = 0; i < this.tanks.length; i++){
			let comp = this.tanks[i];
			calcW += comp.weight;
			switch(comp.content){
				case "fuel":
					calcF += comp.size;
					calcFa += comp.amount;
					break;
				case "biom":
					calcB += comp.size;
					calcBa += comp.amount;
					break;
			}
		}
		for(let i = 0; i < this.engines.length; i++){
			let comp = this.engines[i];
			calcW += comp.weight;
		}
		for(let i = 0; i < this.digesters.length; i++){
			let comp = this.digesters[i];
			calcW += comp.weight;
		}
		this.weight = calcW;
		this.moveCost = 10;
		this.fuelTankSize = calcF;
		this.biomTankSize = calcB;
		this.fuel = calcFa;
		this.biom = calcBa;
	}
	burn(amount){
		for(let i = 0; i < this.tanks.length; i++){
			let comp = this.tanks[i];
			if(comp.content == "fuel"){
				if(comp.amount > amount){ //if there is enough fuel in this tank
					comp.amount -= amount; //just use this tank and break
					break;
				}else{ //if this tank does not have enough, others should
					amount -= comp.amount; //subtract what is left
					comp.amount = 0; //empty tank
				}
			}
		}
	}
	addItem(i){
		let tile = world.tiles[this.x+this.y*zoom];
		tile.content[i].addToPlayer();
		this.update();
		tile.updateContent();
		hud.update();
	}
	addToTanks(content, amount){
		for(let i = 0; i < this.tanks.length; i++){
			let comp = this.tanks[i];
			if(comp.content == content){
				if(comp.size > comp.amount+amount){ //if there is enough space in this tank
					comp.amount += amount; //just use this tank and break
					break;
				}else{ //if this tank does not have enough space, others might
					amount -= comp.size-comp.amount; //subtract the amount that can be added
					comp.amount = comp.size; //fill tank
				}
				comp.amount += amount;
			}
		}
	}
	work(dir){
		for(let i = 0; i < this.engines.length; i++){
			this.engines[i].doWork(dir);
		}
		for(let i = 0; i < this.digesters.length; i++){
			this.digesters[i].doWork();
		}
	}
	look(){
		//set all tiles to not visible so that only the currently visible tiles carry that property
		for(let i = 0; i < world.tiles.length; i++){ 
			world.tiles[i].isVisible = false;
		}
		for(let y = this.y-1; y < this.y+2; y++){
			for(let x = this.x-1; x < this.x+2; x++){
				world.tiles[x+y*zoom].isVisible = true;
			}
		}
	}
	info(){
		let output = "";
		output += "<div class='vesselContent'><div>Total Weight: "+this.weight+"</div></div>";
		output += "<div class='vesselContent'><div>Move Cost: "+this.moveCost+"</div></div>";
		output += "<div class='vesselContent'><div>Total Fuel Capacity: "+this.fuelTankSize+"</div></div>";
		output += "<div class='vesselContent'><div>Total Fuel: "+this.fuel+"</div></div>";
		output += "<div class='vesselContent'><div>Total Biomass Capacity: "+this.biomTankSize+"</div></div>";
		output += "<div class='vesselContent'><div>Total Biomass: "+this.biom+"</div></div>";
		return output;
	}
}
class Component{
	constructor(type, qual, cond, weight){
		this.type = type;
		this.quality = qual;
		this.condition = cond;
		this.weight = weight;
		this.working = true;
	}
	doWork(){}
	info(){return "";}
}
class Chassis extends Component{
	constructor(qual, cond, weight){
		super("chassis", qual, cond, weight);
	}
	doWork(){}
	info(){
		return "<div class='vesselContent'><div>Regular Chasis "+this.quality+" "+this.condition+" "+this.weight+"</div></div>";
	}
}
class Trunk extends Component{
	constructor(qual, cond, weight, size){
		super("trunk", qual, cond, weight);
	}
	doWork(){}
	info(){
		return "<div class='vesselContent'><div>Regular Trunk "+this.quality+" "+this.condition+" "+this.weight+"</div></div>";
	}
}
class Tank extends Component{
	constructor(qual, cond, weight, size, content, amount){
		super("tank", qual, cond, weight);
		this.size = size;
		this.content = content;
		this.amount = amount;
	}
	doWork(){}
	info(){
		return "<div class='vesselContent'><div>Regular Tank "+this.quality+" "+this.condition+" "+this.weight+"</div></div>";
	}
}
class Engine extends Component{
	constructor(qual, cond, weight, efficiency){
		super("engine", qual, cond, weight);
		this.efficiency = efficiency;
	}
	doWork(dir){
		if(dir != "stay"){
			if(world.player.fuel > world.player.moveCost){
				world.player.burn(world.player.moveCost);
				switch(dir){
					case "up":
						world.player.y--;
						break;
					case "left":
						world.player.x--;
						break;
					case "right":
						world.player.x++;
						break;
					case "down":
						world.player.y++;
						break;
				}
			}
		}
	}
	info(){
		return "<div class='vesselContent'><div>Regular Engine "+this.quality+" "+this.condition+" "+this.weight+"</div></div>";
	}
}
class Digester extends Component{
	constructor(qual, cond, weight, efficiency){
		super("digester", qual, cond, weight);
		this.efficiency = efficiency;
		this.activfe = true;
	}
	doWork(){
		let cost = 10;
		if(world.player.fuel > 1 && world.player.biom > cost){
			world.player.burn(1);
			for(let i = 0; i < world.player.tanks.length; i++){
				let comp = world.player.tanks[i];
				if(comp.content == "biom"){
					if(comp.amount > cost){ //if there is enough fuel in this tank
						comp.amount -= cost; //just use this tank and break
						break;
					}else{ //if this tank does not have enough, others should
						cost -= comp.amount; //subtract what is left
						comp.amount = 0; //empty tank
					}
				}
			}
			world.player.addToTanks("fuel",8);
		}
	}
	info(){
		return "<div class='vesselContent'><div>Regular Digester "+this.quality+" "+this.condition+" "+this.weight+"</div></div>";
	}
}









