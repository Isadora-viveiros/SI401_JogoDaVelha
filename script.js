'use strict';

// Todas as combinações de casas que formam uma linha vencedora
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
  [0, 4, 8], [2, 4, 6]             // diagonais
];

const MARK_SVG = {
  X: '<svg class="mark-x" viewBox="0 0 40 40" aria-hidden="true"><path d="M9 9 L31 31 M31 9 L9 31"/></svg>',
  O: '<svg class="mark-o" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="12" pathLength="100"/></svg>'
};

// Elementos da página
const boardEl   = document.getElementById('board');
const cells     = Array.from(boardEl.querySelectorAll('.cell'));
const setupForm = document.getElementById('setup');
const gameEl    = document.getElementById('game');
const statusEl  = document.getElementById('status');
const againBtn  = document.getElementById('again');
const changeBtn = document.getElementById('change');

const nameEls  = { X: document.getElementById('name-x'), O: document.getElementById('name-o') };
const scoreEls = {
  X: document.getElementById('score-x'),
  O: document.getElementById('score-o'),
  draw: document.getElementById('score-draw')
};

// Estado do jogo
const state = {
  players: { X: '', O: '' },
  board: Array(9).fill(null),
  turn: 'X',
  starter: 'X',
  over: true,
  score: { X: 0, O: 0, draw: 0 }
};

/* ---------- utilidades de interface ---------- */

function nameNode(mark) {
  const el = document.createElement('strong');
  el.className = mark.toLowerCase();
  el.textContent = state.players[mark];
  return el;
}

function setStatus(...parts) {
  statusEl.replaceChildren(...parts);
}

function showTurn() {
  setStatus('Vez de ', nameNode(state.turn), ` (${state.turn})`);
}

function updateScore() {
  scoreEls.X.textContent = state.score.X;
  scoreEls.O.textContent = state.score.O;
  scoreEls.draw.textContent = state.score.draw;
}

function clearBoard(enabled) {
  state.board.fill(null);
  boardEl.classList.remove('finished', 'draw');
  cells.forEach((cell, i) => {
    cell.innerHTML = '';
    cell.classList.remove('win');
    cell.disabled = !enabled;
    cell.setAttribute('aria-label', `Casa ${i + 1}, vazia`);
  });
}

/* ---------- fluxo do jogo ---------- */

function startMatch(nameX, nameO) {
  state.players.X = nameX;
  state.players.O = nameO;
  state.score = { X: 0, O: 0, draw: 0 };
  state.starter = 'O'; // newRound() alterna, então a primeira partida começa com X

  nameEls.X.textContent = nameX;
  nameEls.O.textContent = nameO;
  nameEls.X.title = nameX;
  nameEls.O.title = nameO;
  updateScore();

  setupForm.hidden = true;
  gameEl.hidden = false;
  newRound();
}

function newRound() {
  // quem começa alterna a cada partida
  state.starter = state.starter === 'X' ? 'O' : 'X';
  state.turn = state.starter;
  state.over = false;
  clearBoard(true);
  showTurn();
}

function findWinningLine() {
  const b = state.board;
  return WIN_LINES.find(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]) || null;
}

function play(index) {
  if (state.over || state.board[index]) return;

  const mark = state.turn;
  const cell = cells[index];

  state.board[index] = mark;
  cell.innerHTML = MARK_SVG[mark];
  cell.disabled = true;
  cell.setAttribute('aria-label', `Casa ${index + 1}, ${mark}`);

  const line = findWinningLine();

  if (line) {
    finish(line);
  } else if (state.board.every(Boolean)) {
    finish(null);
  } else {
    state.turn = mark === 'X' ? 'O' : 'X';
    showTurn();
  }
}

function finish(line) {
  state.over = true;
  cells.forEach(cell => { cell.disabled = true; });
  boardEl.classList.add('finished');

  if (line) {
    line.forEach(i => cells[i].classList.add('win'));
    state.score[state.turn]++;
    setStatus(nameNode(state.turn), ' venceu!');
  } else {
    boardEl.classList.add('draw');
    state.score.draw++;
    setStatus('Deu velha! A partida terminou empatada.');
  }

  updateScore();
  againBtn.focus();
}

function changePlayers() {
  state.over = true;
  clearBoard(false);

  setupForm.p1.value = state.players.X;
  setupForm.p2.value = state.players.O;

  gameEl.hidden = true;
  setupForm.hidden = false;
  setupForm.p1.focus();
  setupForm.p1.select();
}

/* ---------- eventos ---------- */

setupForm.addEventListener('submit', event => {
  event.preventDefault();
  const nameX = setupForm.p1.value.trim() || 'Jogador 1';
  const nameO = setupForm.p2.value.trim() || 'Jogador 2';
  startMatch(nameX, nameO);
});

boardEl.addEventListener('click', event => {
  const cell = event.target.closest('.cell');
  if (cell) play(Number(cell.dataset.index));
});

againBtn.addEventListener('click', newRound);
changeBtn.addEventListener('click', changePlayers);
