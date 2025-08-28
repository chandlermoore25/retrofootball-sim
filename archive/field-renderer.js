// FieldRenderer.js - Handles drawing the football field
import * as PIXI from 'pixi.js';

export class FieldRenderer {
    constructor(app) {
        this.app = app;
        this.fieldContainer = new PIXI.Container();
        this.fieldGraphics = new PIXI.Graphics();
        
        // Field dimensions (in pixels)
        this.fieldWidth = 900;
        this.fieldHeight = 500;
        this.yardWidth = this.fieldWidth / 120; // 100 yards + 2 end zones (10 each)
        this.endZoneWidth = this.yardWidth * 10;
        this.playableField = this.fieldWidth - (this.endZoneWidth * 2);
        
        // Field colors
        this.colors = {
            grass: 0x0a5f0a,
            darkGrass: 0x085008,
            lines: 0xffffff,
            endZone: 0x064506,
            hashMarks: 0xffffff,
            numbers: 0xffffff
        };
        
        // Text style for yard numbers
        this.numberStyle = new PIXI.TextStyle({
            fontFamily: 'Arial Black',
            fontSize: 24,
            fontWeight: 'bold',
            fill: this.colors.numbers,
            stroke: '#000000',
            strokeThickness: 2
        });
    }
    
    async initialize() {
        console.log('Initializing field renderer...');
        
        // Add field container to stage
        this.app.stage.addChild(this.fieldContainer);
        this.fieldContainer.addChild(this.fieldGraphics);
        
        // Draw the field
        this.drawField();
        this.drawYardLines();
        this.drawHashMarks();
        this.drawEndZones();
        this.addYardNumbers();
        
        return Promise.resolve();
    }
    
    drawField() {
        const g = this.fieldGraphics;
        
        // Draw alternating 10-yard sections for visual effect
        for (let i = 0; i < 12; i++) { // 12 sections (2 end zones + 10 field sections)
            const x = i * (this.fieldWidth / 12);
            const color = i % 2 === 0 ? this.colors.grass : this.colors.darkGrass;
            
            g.beginFill(color);
            g.drawRect(x, 0, this.fieldWidth / 12, this.fieldHeight);
            g.endFill();
        }
        
        // Draw field border
        g.lineStyle(3, this.colors.lines);
        g.drawRect(0, 0, this.fieldWidth, this.fieldHeight);
    }
    
    drawYardLines() {
        const g = this.fieldGraphics;
        g.lineStyle(2, this.colors.lines);
        
        // Draw vertical yard lines every 5 yards
        for (let yard = 0; yard <= 100; yard += 5) {
            const x = this.endZoneWidth + (yard * this.playableField / 100);
            
            if (yard % 10 === 0) {
                // Full field lines every 10 yards
                g.lineStyle(3, this.colors.lines);
                g.moveTo(x, 0);
                g.lineTo(x, this.fieldHeight);
            } else {
                // Shorter lines every 5 yards
                g.lineStyle(1, this.colors.lines);
                g.moveTo(x, 0);
                g.lineTo(x, 40);
                g.moveTo(x, this.fieldHeight - 40);
                g.lineTo(x, this.fieldHeight);
                
                // Middle marks
                g.moveTo(x, this.fieldHeight / 2 - 20);
                g.lineTo(x, this.fieldHeight / 2 + 20);
            }
        }
        
        // Draw horizontal sidelines
        g.lineStyle(4, this.colors.lines);
        g.moveTo(0, 2);
        g.lineTo(this.fieldWidth, 2);
        g.moveTo(0, this.fieldHeight - 2);
        g.lineTo(this.fieldWidth, this.fieldHeight - 2);
    }
    
    drawHashMarks() {
        const g = this.fieldGraphics;
        g.lineStyle(1, this.colors.hashMarks);
        
        // Hash marks appear every yard
        const hashY1 = this.fieldHeight * 0.3; // Upper hash marks
        const hashY2 = this.fieldHeight * 0.7; // Lower hash marks
        const hashLength = 5;
        
        for (let yard = 1; yard <= 99; yard++) {
            if (yard % 5 !== 0) { // Don't draw on 5-yard lines
                const x = this.endZoneWidth + (yard * this.playableField / 100);
                
                // Upper hash marks
                g.moveTo(x, hashY1 - hashLength);
                g.lineTo(x, hashY1 + hashLength);
                
                // Lower hash marks
                g.moveTo(x, hashY2 - hashLength);
                g.lineTo(x, hashY2 + hashLength);
            }
        }
    }
    
    drawEndZones() {
        const g = this.fieldGraphics;
        
        // Left end zone
        g.lineStyle(4, this.colors.lines);
        g.beginFill(this.colors.endZone, 0.3);
        g.drawRect(0, 0, this.endZoneWidth, this.fieldHeight);
        g.endFill();
        
        // Right end zone
        g.beginFill(this.colors.endZone, 0.3);
        g.drawRect(this.fieldWidth - this.endZoneWidth, 0, this.endZoneWidth, this.fieldHeight);
        g.endFill();
        
        // Goal lines
        g.lineStyle(4, this.colors.lines);
        g.moveTo(this.endZoneWidth, 0);
        g.lineTo(this.endZoneWidth, this.fieldHeight);
        g.moveTo(this.fieldWidth - this.endZoneWidth, 0);
        g.lineTo(this.fieldWidth - this.endZoneWidth, this.fieldHeight);
        
        // End zone text
        this.addEndZoneText('END ZONE', this.endZoneWidth / 2, this.fieldHeight / 2, -90);
        this.addEndZoneText('END ZONE', this.fieldWidth - this.endZoneWidth / 2, this.fieldHeight / 2, 90);
    }
    
    addEndZoneText(text, x, y, rotation) {
        const endZoneText = new PIXI.Text(text, {
            fontFamily: 'Arial Black',
            fontSize: 36,
            fontWeight: 'bold',
            fill: this.colors.lines,
            stroke: '#000000',
            strokeThickness: 3,
            letterSpacing: 8
        });
        
        endZoneText.anchor.set(0.5);
        endZoneText.position.set(x, y);
        endZoneText.rotation = rotation * Math.PI / 180;
        endZoneText.alpha = 0.5;
        
        this.fieldContainer.addChild(endZoneText);
    }
    
    addYardNumbers() {
        // Add yard numbers on the field
        const yardNumbers = [10, 20, 30, 40, 50, 40, 30, 20, 10];
        const yOffset = 50; // Distance from top and bottom
        
        yardNumbers.forEach((num, index) => {
            const x = this.endZoneWidth + ((index + 1) * this.playableField / 10);
            
            // Top number
            const topNumber = new PIXI.Text(num.toString(), this.numberStyle);
            topNumber.anchor.set(0.5);
            topNumber.position.set(x, yOffset);
            this.fieldContainer.addChild(topNumber);
            
            // Bottom number (rotated 180 degrees)
            const bottomNumber = new PIXI.Text(num.toString(), this.numberStyle);
            bottomNumber.anchor.set(0.5);
            bottomNumber.position.set(x, this.fieldHeight - yOffset);
            bottomNumber.rotation = Math.PI;
            this.fieldContainer.addChild(bottomNumber);
        });
        
        // Add 50 yard line special marker
        const fiftyYardX = this.fieldWidth / 2;
        const fiftyLine = new PIXI.Graphics();
        fiftyLine.lineStyle(4, 0xffff00);
        fiftyLine.moveTo(fiftyYardX, 0);
        fiftyLine.lineTo(fiftyYardX, this.fieldHeight);
        this.fieldContainer.addChild(fiftyLine);
    }
    
    // Convert yard position to pixel position
    yardToPixel(yard) {
        // yard should be 0-100 (0 = own goal line, 100 = opponent goal line)
        return this.endZoneWidth + (yard * this.playableField / 100);
    }
    
    // Convert pixel position to yard position
    pixelToYard(pixel) {
        const adjusted = pixel - this.endZoneWidth;
        return Math.max(0, Math.min(100, (adjusted / this.playableField) * 100));
    }
    
    // Get the field container for adding sprites on top
    getFieldContainer() {
        return this.fieldContainer;
    }
    
    // Clear any temporary graphics (for play visualization)
    clearTempGraphics() {
        // This will be used later for clearing play arrows, routes, etc.
    }
}