// ------------------------------------------------------------
// Usar la configuración centralizada de utils.js
// ------------------------------------------------------------
const apiBase = utils ? utils.API_BASE : 'http://localhost:5000/api';

document.getElementById('btnRegister').addEventListener('click', async ()=>{
  const nombre = document.getElementById('reg_nombre').value;
  const email = document.getElementById('reg_email').value;
  const password = document.getElementById('reg_pass').value;
  const res = await fetch(apiBase + '/auth/register', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({nombre,email,password})
  });
  const data = await res.json();
  alert(JSON.stringify(data));
});

document.getElementById('btnLogin').addEventListener('click', async ()=>{
  const email = document.getElementById('log_email').value;
  const password = document.getElementById('log_pass').value;
  const res = await fetch(apiBase + '/auth/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email,password})
  });
  const data = await res.json();
  if(data.token){
    localStorage.setItem('token', data.token);
    alert('Login ok');
    document.getElementById('editorSection').style.display = 'block';
  } else {
    alert(JSON.stringify(data));
  }
});

function buildGrid(r, c) {
  const wrap = document.getElementById('gridWrap');
  wrap.innerHTML = '';
  const grid = document.createElement('div');
  grid.style.display='grid';
  grid.style.gridTemplateColumns = `repeat(${c}, 48px)`;
  grid.style.gap='6px';
  for(let i=0;i<r;i++){
    for(let j=0;j<c;j++){
      const cell = document.createElement('div');
      cell.className='cell inactive';
      cell.style.width='48px';
      cell.style.height='48px';
      cell.style.border='1px solid #666';
      cell.style.display='flex';
      cell.style.alignItems='center';
      cell.style.justifyContent='center';
      cell.dataset.index = i*c+j;
      cell.addEventListener('click', ()=> {
        cell.classList.toggle('inactive');
        cell.style.background = cell.classList.contains('inactive') ? '#fff' : '#fffdcc';
      });
      grid.appendChild(cell);
    }
  }
  wrap.appendChild(grid);
}

document.getElementById('btnCreateGrid').addEventListener('click', ()=>{
  const r = parseInt(document.getElementById('rows').value||5);
  const c = parseInt(document.getElementById('cols').value||5);
  buildGrid(r,c);
});

document.getElementById('btnCreateLot').addEventListener('click', async ()=>{
  const token = localStorage.getItem('token');
  if(!token) { alert('Logueate'); return; }
  // gather active cell indexes
  const cells = Array.from(document.querySelectorAll('#gridWrap .cell'));
  const active = cells.filter(c => !c.classList.contains('inactive')).map(c=>parseInt(c.dataset.index));
  if(active.length===0) { alert('Activa al menos 1 celda'); return; }
  const body = {
    plantilla_id: null,
    juego_id: 1,
    cantidad_tablas: 2,
    filas: parseInt(document.getElementById('rows').value || 5),
    columnas: parseInt(document.getElementById('cols').value || 5),
    tablasPorPagina: 4,
    poolMin: 1,
    poolMax: 90,
    gridActiveOrder: active
  };
  const res = await fetch(apiBase + '/lots', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  alert(JSON.stringify(data));
});
