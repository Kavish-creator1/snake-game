const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const box = 20;

let snake, food, dir, score, best, loop;
let speed=120, size=640, wrap=true, grid=true, wallsOn=false, ai=false, paused=true;
let walls=[];

const skins={
  green:{h:"#2e7d32",b:"#66bb6a",f:"#e53935"},
  blue:{h:"#1565c0",b:"#64b5f6",f:"#ff7043"},
  yellow:{h:"#f9a825",b:"#fff176",f:"#d84315"},
  purple:{h:"#6a1b9a",b:"#ba68c8",f:"#ef5350"}
};
let skin=localStorage.getItem("skin")||"green";

best=localStorage.getItem("best")||0;
document.getElementById("best").textContent=best;

function restart(){
  clearInterval(loop);
  canvas.width=canvas.height=size;
  snake=[{x:10*box,y:10*box}];
  dir="RIGHT";
  score=0;
  food=rand();
  buildWalls();
  updateBoard();
  paused=true;
  showOverlay("Tap to Start");
  loop=setInterval(step,speed);
}

function rand(){
  return{
    x:Math.floor(Math.random()*canvas.width/box)*box,
    y:Math.floor(Math.random()*canvas.height/box)*box
  };
}

function buildWalls(){
  walls=[];
  if(!wallsOn)return;
  for(let i=6;i<14;i++){
    walls.push({x:i*box,y:8*box});
    walls.push({x:i*box,y:16*box});
  }
}

function drawGrid(){
  if(!grid)return;
  for(let y=0;y<canvas.height;y+=box)
    for(let x=0;x<canvas.width;x+=box){
      ctx.fillStyle=((x+y)/box)%2?"rgba(0,0,0,.04)":"rgba(255,255,255,.08)";
      ctx.fillRect(x,y,box,box);
    }
}

function aiMove(){
  const h=snake[0];
  if(food.x>h.x&&dir!=="LEFT")dir="RIGHT";
  else if(food.x<h.x&&dir!=="RIGHT")dir="LEFT";
  else if(food.y>h.y&&dir!=="UP")dir="DOWN";
  else if(food.y<h.y&&dir!=="DOWN")dir="UP";
}

function step(){
  if(paused)return;
  if(ai)aiMove();

  ctx.fillStyle="#aad751";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawGrid();

  // food
  ctx.fillStyle=skins[skin].f;
  ctx.beginPath();
  ctx.arc(food.x+10,food.y+10,9,0,Math.PI*2);
  ctx.fill();

  // snake
  snake.forEach((s,i)=>{
    ctx.fillStyle=i?skins[skin].b:skins[skin].h;
    ctx.fillRect(s.x+1,s.y+1,box-2,box-2);
  });

  // walls
  ctx.fillStyle="#9e9e9e";
  walls.forEach(w=>ctx.fillRect(w.x,w.y,box,box));

  let h={...snake[0]};
  if(dir==="LEFT")h.x-=box;
  if(dir==="RIGHT")h.x+=box;
  if(dir==="UP")h.y-=box;
  if(dir==="DOWN")h.y+=box;

  if(wrap){
    h.x=(h.x+canvas.width)%canvas.width;
    h.y=(h.y+canvas.height)%canvas.height;
  }else if(h.x<0||h.y<0||h.x>=canvas.width||h.y>=canvas.height)
    return gameOver();

  if(snake.some(s=>s.x===h.x&&s.y===h.y)||walls.some(w=>w.x===h.x&&w.y===h.y))
    return gameOver();

  if(h.x===food.x&&h.y===food.y){
    document.getElementById("eatSound").play();
    score++;
    food=rand();
  }else snake.pop();

  snake.unshift(h);
  updateBoard();
}

function updateBoard(){
  document.getElementById("score").textContent=score;
}

function gameOver(){
  clearInterval(loop);
  document.getElementById("gameOverSound").play();
  if(score>best){
    best=score;
    localStorage.setItem("best",best);
  }
  updateLeaderboard(score);
  showOverlay("Game Over");
}

function updateLeaderboard(s){
  let b=JSON.parse(localStorage.getItem("lb")||"[]");
  b.push(s);b.sort((a,b)=>b-a);b=b.slice(0,5);
  localStorage.setItem("lb",JSON.stringify(b));
  const l=document.getElementById("leaderList");
  l.innerHTML="";
  b.forEach(x=>{let li=document.createElement("li");li.textContent=x;l.appendChild(li);});
}

function togglePause(){paused=!paused;paused?showOverlay("Paused"):hideOverlay();}
function openSettings(){settings.classList.remove("hidden");}
function closeSettings(){settings.classList.add("hidden");}
function applySettings(){
  speed=+speedSel.value;
  size=+sizeSel.value;
  wrap=wrapBox.checked;
  wallsOn=wallsBox.checked;
  grid=gridBox.checked;
  ai=aiBox.checked;
  skin=skinSel.value;
  localStorage.setItem("skin",skin);
  closeSettings();
  restart();
}

document.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft"&&dir!=="RIGHT")dir="LEFT";
  if(e.key==="ArrowRight"&&dir!=="LEFT")dir="RIGHT";
  if(e.key==="ArrowUp"&&dir!=="DOWN")dir="UP";
  if(e.key==="ArrowDown"&&dir!=="UP")dir="DOWN";
  if(e.key===" ")togglePause();
});

const overlay=document.getElementById("overlay");
const overlayText=document.getElementById("overlayText");
function showOverlay(t){overlayText.textContent=t;overlay.classList.remove("hidden");}
function hideOverlay(){overlay.classList.add("hidden");paused=false;}
canvas.onclick=hideOverlay;

const speedSel=speed;
const sizeSel=size;
const wrapBox=wrap;
const wallsBox=walls;
const gridBox=grid;
const aiBox=ai;
const skinSel=skin;

restart();

/* PWA */
if("serviceWorker"in navigator)
  navigator.serviceWorker.register("service-worker.js");
