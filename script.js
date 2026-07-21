// --- 1. CONFIGURACIÓN INICIAL DE LA ESCENA 3D ---
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.set(0, 15, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Controles para rotar y hacer zoom con el mouse/touch
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 60;
controls.minDistance = 5;

// --- 2. CREACIÓN DE LA GALAXIA DE PARTÍCULAS ---
const parameters = {
  count: 40000,      // Cantidad de estrellas/puntos
  size: 0.015,       // Tamaño de las partículas
  radius: 20,        // Radio de la galaxia
  branches: 3,       // Brazos de la espiral
  spin: 1,           // Giros de los brazos
  randomness: 0.5,   // Dispersión de las estrellas
  insideColor: '#ff69b4', // Color del centro (Rosa)
  outsideColor: '#7b1fa2' // Color exterior (Morado)
};

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(parameters.count * 3);
const colors = new Float32Array(parameters.count * 3);

const colorInside = new THREE.Color(parameters.insideColor);
const colorOutside = new THREE.Color(parameters.outsideColor);

for (let i = 0; i < parameters.count; i++) {
  // Posición
  const i3 = i * 3;
  const radius = Math.random() * parameters.radius;
  const spinAngle = radius * parameters.spin;
  const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

  const randomX = (Math.random() - 0.5) * parameters.randomness * radius;
  const randomY = (Math.random() - 0.5) * parameters.randomness * radius;
  const randomZ = (Math.random() - 0.5) * parameters.randomness * radius;

  positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
  positions[i3 + 1] = randomY;
  positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

  // Color degradado desde el centro hacia afuera
  const mixedColor = colorInside.clone();
  mixedColor.lerp(colorOutside, radius / parameters.radius);

  colors[i3] = mixedColor.r;
  colors[i3 + 1] = mixedColor.g;
  colors[i3 + 2] = mixedColor.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Material de las partículas
const material = new THREE.PointsMaterial({
  size: parameters.size,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true
});

const galaxy = new THREE.Points(geometry, material);
scene.add(galaxy);

// --- 3. LÓGICA DE LA CARTA MODAL (INTERACCIÓN) ---
const modal = document.getElementById('modal-carta');
const btnCerrar = document.getElementById('btn-cerrar');

// Función para abrir la carta
function abrirCarta() {
  modal.classList.remove('modal-oculto');
}

// Función para cerrar la carta
btnCerrar.addEventListener('click', () => {
  modal.classList.add('modal-oculto');
});

// Detectar clic en la pantalla para abrir la carta
window.addEventListener('dblclick', () => {
  abrirCarta();
});

// --- 4. BUCLE DE ANIMACIÓN Y RENDERIZADO ---
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  // Rotar lentamente la galaxia en su propio eje
  galaxy.rotation.y = elapsedTime * 0.05;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// Ajustar la cámara si se cambia el tamaño de la ventana
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
// --- LÓGICA DE MÚSICA DE FONDO ---
const musica = document.getElementById('musica-fondo');
const btnMusica = document.getElementById('btn-musica');
let musicaIniciada = false;

// Reproducir automáticamente al primer clic o toque en cualquier parte
function iniciarMusicaConInteraccion() {
  if (!musicaIniciada) {
    musica.play().then(() => {
      musicaIniciada = true;
      btnMusica.textContent = '🔊';
    }).catch(error => console.log("El navegador bloqueó el auto-play inicialmente:", error));
  }
}

// Escuchar el primer clic/tap en la pantalla
window.addEventListener('click', iniciarMusicaConInteraccion, { once: true });
window.addEventListener('touchstart', iniciarMusicaConInteraccion, { once: true });

// Controlar pausar/reproducir con el botón
btnMusica.addEventListener('click', (e) => {
  e.stopPropagation(); // Evita conflictos con la pantalla
  if (musica.paused) {
    musica.play();
    btnMusica.textContent = '🔊';
  } else {
    musica.pause();
    btnMusica.textContent = '🔇';
  }
});