// main.js - Entry point for Retro Football Simulator
import * as PIXI from 'pixi.js';
import { SimulationEngine } from './core/SimulationEngine.js';
import { FieldRenderer } from './core/FieldRenderer.js';

// Application configuration
const CONFIG = {
    width: 900,
    height: 500,
    backgroundColor: 0x0a5f0a,
    antialias: true,
    resolution: window.devicePixelRatio || 1
};

// Initialize PIXI Application
const app = new PIXI.Application({
    width: CONFIG.width,
    height: CONFIG.height,
    backgroundColor: CONFIG.backgroundColor,
    antialias: CONFIG.antialias,
    resolution: CONFIG.resolution
});

// Add canvas to DOM
const canvasWrapper = document.getElementById('canvas-wrapper');
canvasWrapper.appendChild(app.view);

// Initialize core components
let fieldRenderer = null;
let simulationEngine = null;

// Initialize the application
async function init() {
    console.log('🏈 Retro Football Simulator Starting...');
    
    // Create field renderer
    fieldRenderer = new FieldRenderer(app);
    await fieldRenderer.initialize();
    
    // Create simulation engine
    simulationEngine = new SimulationEngine(app, fieldRenderer);
    await simulationEngine.initialize();
    
    // Set up control panel
    setupControls();
    
    console.log('✅ Initialization complete!');
    
    // Start with a demo play for testing
    runDemoPlay();
}

// Set up control panel interactions
function setupControls() {
    const playPauseBtn = document.getElementById('play-pause');
    const speedBtn = document.getElementById('speed-control');
    const resetBtn = document.getElementById('reset');
    
    playPauseBtn.addEventListener('click', () => {
        if (simulationEngine.isPlaying) {
            simulationEngine.pause();
            playPauseBtn.textContent = '▶ Play';
        } else {
            simulationEngine.play();
            playPauseBtn.textContent = '⏸ Pause';
        }
    });
    
    let currentSpeed = 1;
    const speeds = [1, 2, 4];
    speedBtn.addEventListener('click', () => {
        currentSpeed = speeds[(speeds.indexOf(currentSpeed) + 1) % speeds.length];
        speedBtn.textContent = `${currentSpeed}x Speed`;
        simulationEngine.setSpeed(currentSpeed);
    });
    
    resetBtn.addEventListener('click', () => {
        simulationEngine.reset();
        playPauseBtn.textContent = '▶ Play';
    });
}

// Run a demo play for testing
function runDemoPlay() {
    // Demo play data - simple run play
    const demoPlay = {
        id: 'demo_001',
        type: 'run',
        duration: 3000, // 3 seconds
        movements: [
            {
                playerId: 1,
                startPos: { x: 450, y: 250 },
                endPos: { x: 550, y: 250 },
                duration: 2000
            },
            {
                playerId: 2,
                startPos: { x: 430, y: 230 },
                endPos: { x: 530, y: 240 },
                duration: 2500
            }
        ]
    };
    
    console.log('🎮 Running demo play...');
    simulationEngine.executePlay(demoPlay);
}

// Handle window resize
window.addEventListener('resize', () => {
    // Keep aspect ratio
    const parent = canvasWrapper;
    const aspectRatio = CONFIG.width / CONFIG.height;
    const availableWidth = parent.clientWidth;
    const availableHeight = parent.clientHeight;
    
    let newWidth = availableWidth;
    let newHeight = availableWidth / aspectRatio;
    
    if (newHeight > availableHeight) {
        newHeight = availableHeight;
        newWidth = availableHeight * aspectRatio;
    }
    
    app.renderer.resize(newWidth, newHeight);
    app.stage.scale.set(newWidth / CONFIG.width, newHeight / CONFIG.height);
});

// Start the application
init().catch(console.error);