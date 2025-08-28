// SimulationEngine.js - Core simulation and animation engine
import * as PIXI from 'pixi.js';
import { PlayerSprite } from '../sprites/PlayerSprite.js';

export class SimulationEngine {
    constructor(app, fieldRenderer) {
        this.app = app;
        this.fieldRenderer = fieldRenderer;
        
        // Engine state
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlay = null;
        this.playbackSpeed = 1;
        
        // Sprite management
        this.playerSprites = new Map(); // Map of playerId -> PlayerSprite
        this.spriteContainer = new PIXI.Container();
        this.ballSprite = null;
        
        // Animation timing
        this.animationStartTime = 0;
        this.animationElapsed = 0;
        this.lastFrameTime = 0;
        
        // Teams data
        this.teams = {
            home: {
                name: 'HOME',
                color: 0x0066cc,
                score: 0,
                players: []
            },
            away: {
                name: 'AWAY', 
                color: 0xcc0000,
                score: 0,
                players: []
            }
        };
        
        // Game state
        this.gameState = {
            quarter: 1,
            timeRemaining: '15:00',
            down: 1,
            yardsToGo: 10,
            ballPosition: 25,
            possession: 'home'
        };
        
        // Animation queue for complex plays
        this.animationQueue = [];
        this.currentAnimation = null;
        
        // Ticker for game loop
        this.ticker = null;
    }
    
    async initialize() {
        console.log('Initializing simulation engine...');
        
        // Add sprite container on top of field
        this.fieldRenderer.getFieldContainer().addChild(this.spriteContainer);
        
        // Create initial player sprites
        await this.createTeamSprites();
        
        // Initialize ball sprite
        await this.createBallSprite();
        
        // Set up game loop
        this.setupGameLoop();
        
        // Position players in formation
        this.setFormation('kickoff');
        
        return Promise.resolve();
    }
    
    async createTeamSprites() {
        // Create 11 players for each team
        const homePositions = this.getFormationPositions('offense');
        const awayPositions = this.getFormationPositions('defense');
        
        // Home team (offense initially)
        for (let i = 0; i < 11; i++) {
            const sprite = new PlayerSprite(
                i + 1,
                this.teams.home.color,
                'home',
                homePositions[i]
            );
            await sprite.initialize();
            this.playerSprites.set(`home_${i + 1}`, sprite);
            this.spriteContainer.addChild(sprite.getSprite());
            this.teams.home.players.push(sprite);
        }
        
        // Away team (defense initially)
        for (let i = 0; i < 11; i++) {
            const sprite = new PlayerSprite(
                i + 12,
                this.teams.away.color,
                'away',
                awayPositions[i]
            );
            await sprite.initialize();
            this.playerSprites.set(`away_${i + 1}`, sprite);
            this.spriteContainer.addChild(sprite.getSprite());
            this.teams.away.players.push(sprite);
        }
    }
    
    async createBallSprite() {
        // Create football sprite
        const ballGraphics = new PIXI.Graphics();
        ballGraphics.beginFill(0x8b4513);
        ballGraphics.drawEllipse(0, 0, 8, 5);
        ballGraphics.endFill();
        
        // Add laces
        ballGraphics.lineStyle(1, 0xffffff);
        ballGraphics.moveTo(-3, 0);
        ballGraphics.lineTo(3, 0);
        
        this.ballSprite = new PIXI.Container();
        this.ballSprite.addChild(ballGraphics);
        this.ballSprite.visible = false;
        this.spriteContainer.addChild(this.ballSprite);
    }
    
    getFormationPositions(type) {
        const centerX = this.fieldRenderer.yardToPixel(this.gameState.ballPosition);
        const positions = [];
        
        if (type === 'offense') {
            // Offensive formation (I-Formation)
            // Offensive line
            for (let i = 0; i < 5; i++) {
                positions.push({
                    x: centerX,
                    y: 200 + (i * 25)
                });
            }
            // Quarterback
            positions.push({ x: centerX - 10, y: 250 });
            // Running backs
            positions.push({ x: centerX - 20, y: 250 });
            positions.push({ x: centerX - 30, y: 250 });
            // Wide receivers
            positions.push({ x: centerX, y: 100 });
            positions.push({ x: centerX, y: 400 });
            // Tight end
            positions.push({ x: centerX, y: 175 });
        } else {
            // Defensive formation (4-3 Defense)
            // Defensive line
            for (let i = 0; i < 4; i++) {
                positions.push({
                    x: centerX + 10,
                    y: 180 + (i * 35)
                });
            }
            // Linebackers
            for (let i = 0; i < 3; i++) {
                positions.push({
                    x: centerX + 25,
                    y: 200 + (i * 50)
                });
            }
            // Defensive backs
            positions.push({ x: centerX + 35, y: 150 });
            positions.push({ x: centerX + 35, y: 350 });
            // Safeties
            positions.push({ x: centerX + 45, y: 225 });
            positions.push({ x: centerX + 45, y: 275 });
        }
        
        return positions;
    }
    
    setFormation(formation) {
        const homePositions = this.getFormationPositions('offense');
        const awayPositions = this.getFormationPositions('defense');
        
        let index = 0;
        this.teams.home.players.forEach(player => {
            player.setPosition(homePositions[index].x, homePositions[index].y);
            index++;
        });
        
        index = 0;
        this.teams.away.players.forEach(player => {
            player.setPosition(awayPositions[index].x, awayPositions[index].y);
            index++;
        });
    }
    
    setupGameLoop() {
        this.ticker = this.app.ticker.add((delta) => {
            if (this.isPlaying && !this.isPaused) {
                this.update(delta);
            }
        });
    }
    
    update(delta) {
        const currentTime = performance.now();
        const frameElapsed = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        if (this.currentAnimation) {
            this.updateAnimation(frameElapsed * this.playbackSpeed);
        }
        
        // Update all player sprites
        this.playerSprites.forEach(sprite => {
            sprite.update(delta);
        });
        
        // Check for animation completion
        if (this.currentAnimation && this.currentAnimation.isComplete) {
            this.onAnimationComplete();
        }
    }
    
    executePlay(playData) {
        console.log('Executing play:', playData.id);
        
        this.currentPlay = playData;
        this.isPlaying = true;
        this.animationStartTime = performance.now();
        
        // Create animation from play data
        this.currentAnimation = this.createAnimation(playData);
        
        // Update UI
        this.updateScoreboard();
        
        // Show ball
        if (this.ballSprite) {
            this.ballSprite.visible = true;
            const startPos = playData.movements[0]?.startPos || { x: 450, y: 250 };
            this.ballSprite.position.set(startPos.x, startPos.y);
        }
    }
    
    createAnimation(playData) {
        const animation = {
            startTime: performance.now(),
            duration: playData.duration || 3000,
            movements: [],
            isComplete: false
        };
        
        // Process each movement in the play
        playData.movements.forEach(movement => {
            const sprite = this.playerSprites.get(`home_${movement.playerId}`) || 
                          this.playerSprites.get(`away_${movement.playerId}`);
            
            if (sprite) {
                animation.movements.push({
                    sprite: sprite,
                    startPos: movement.startPos,
                    endPos: movement.endPos,
                    duration: movement.duration,
                    startTime: 0,
                    easing: this.easeInOutQuad
                });
                
                // Start the movement
                sprite.moveTo(
                    movement.endPos.x,
                    movement.endPos.y,
                    movement.duration / 1000
                );
            }
        });
        
        return animation;
    }
    
    updateAnimation(elapsed) {
        if (!this.currentAnimation) return;
        
        const totalElapsed = performance.now() - this.currentAnimation.startTime;
        
        // Update ball position (follow first player for now)
        if (this.ballSprite && this.currentAnimation.movements.length > 0) {
            const carrier = this.currentAnimation.movements[0].sprite;
            this.ballSprite.position.set(
                carrier.sprite.position.x,
                carrier.sprite.position.y - 10
            );
        }
        
        // Check if animation is complete
        if (totalElapsed >= this.currentAnimation.duration) {
            this.currentAnimation.isComplete = true;
        }
    }
    
    onAnimationComplete() {
        console.log('Play animation complete');
        
        // Hide ball
        if (this.ballSprite) {
            this.ballSprite.visible = false;
        }
        
        // Update game state
        this.updateGameState();
        
        // Reset for next play
        this.currentAnimation = null;
        this.isPlaying = false;
        
        // Update UI
        document.getElementById('play-pause').textContent = '▶ Play';
    }
    
    updateGameState() {
        // Update down and distance
        if (this.currentPlay) {
            const yardsGained = Math.floor(Math.random() * 15) - 2; // Random for now
            this.gameState.ballPosition += yardsGained;
            
            if (yardsGained >= this.gameState.yardsToGo) {
                this.gameState.down = 1;
                this.gameState.yardsToGo = 10;
            } else {
                this.gameState.down++;
                this.gameState.yardsToGo -= yardsGained;
                
                if (this.gameState.down > 4) {
                    // Turnover on downs
                    this.gameState.possession = this.gameState.possession === 'home' ? 'away' : 'home';
                    this.gameState.down = 1;
                    this.gameState.yardsToGo = 10;
                }
            }
            
            // Check for touchdown
            if (this.gameState.ballPosition >= 100) {
                this.onTouchdown('home');
            } else if (this.gameState.ballPosition <= 0) {
                this.onTouchdown('away');
            }
        }
        
        this.updateScoreboard();
    }
    
    onTouchdown(team) {
        console.log(`TOUCHDOWN ${team.toUpperCase()}!`);
        this.teams[team].score += 6;
        
        // Reset ball position
        this.gameState.ballPosition = 25;
        this.gameState.down = 1;
        this.gameState.yardsToGo = 10;
        
        // Create touchdown celebration animation
        this.createCelebration(team);
    }
    
    createCelebration(team) {
        // Simple celebration - make players jump
        const players = this.teams[team].players;
        players.forEach((player, index) => {
            setTimeout(() => {
                player.jump();
            }, index * 100);
        });
    }
    
    updateScoreboard() {
        // Update score display
        document.querySelector('.home .score').textContent = this.teams.home.score;
        document.querySelector('.away .score').textContent = this.teams.away.score;
        
        // Update game info
        document.querySelector('.quarter').textContent = `Q${this.gameState.quarter}`;
        document.querySelector('.time').textContent = this.gameState.timeRemaining;
        
        // Update down and distance
        const downSuffix = ['st', 'nd', 'rd', 'th'][Math.min(this.gameState.down - 1, 3)];
        document.querySelector('.down-distance').textContent = 
            `${this.gameState.down}${downSuffix} & ${this.gameState.yardsToGo}`;
    }
    
    // Playback controls
    play() {
        this.isPlaying = true;
        this.isPaused = false;
    }
    
    pause() {
        this.isPaused = true;
    }
    
    setSpeed(speed) {
        this.playbackSpeed = speed;
    }
    
    reset() {
        // Reset game state
        this.gameState = {
            quarter: 1,
            timeRemaining: '15:00',
            down: 1,
            yardsToGo: 10,
            ballPosition: 25,
            possession: 'home'
        };
        
        // Reset scores
        this.teams.home.score = 0;
        this.teams.away.score = 0;
        
        // Reset positions
        this.setFormation('offense');
        
        // Update display
        this.updateScoreboard();
        
        // Clear any animations
        this.currentAnimation = null;
        this.isPlaying = false;
        this.isPaused = false;
    }
    
    // Easing function for smooth animations
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    // Clean up
    destroy() {
        if (this.ticker) {
            this.app.ticker.remove(this.ticker);
        }
        
        this.playerSprites.forEach(sprite => sprite.destroy());
        this.playerSprites.clear();
        
        if (this.ballSprite) {
            this.ballSprite.destroy();
        }
    }
}