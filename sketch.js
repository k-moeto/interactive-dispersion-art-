// グローバル変数
let particles = [];
const palette = ['#4a69bd', '#5e8ac6', '#2c3e50', '#7f8c8d'];
let settings = {
    polymer: 70,
    concentration: 150,
    energy: 30
};

// UI要素への参照
let polymerSlider, concentrationSlider, energySlider;
let polymerValueSpan, concentrationValueSpan, energyValueSpan;

function setup() {
    let canvasContainer = select('#canvas-container');
    // canvasのサイズを固定値にして、描画が崩れないようにする
    let canvas = createCanvas(800, 400);
    canvas.parent(canvasContainer);

    polymerSlider = select('#polymerSlider');
    concentrationSlider = select('#concentrationSlider');
    energySlider = select('#energySlider');
    polymerValueSpan = select('#polymerValue');
    concentrationValueSpan = select('#concentrationValue');
    energyValueSpan = select('#energyValue');

    settings.polymer = polymerSlider.value();
    settings.concentration = concentrationSlider.value();
    settings.energy = energySlider.value();

    polymerSlider.input(() => {
        settings.polymer = polymerSlider.value();
        polymerValueSpan.html(settings.polymer);
    });
    concentrationSlider.input(() => {
        settings.concentration = concentrationSlider.value();
        concentrationValueSpan.html(settings.concentration);
    });
    energySlider.input(() => {
        settings.energy = energySlider.value();
        energyValueSpan.html(settings.energy);
    });
}

function draw() {
    // 新しい背景色と軌跡効果
    background(253, 251, 247, 80);

    // 粒子の上限数まで、中央から新しい粒子を追加
    while (particles.length < settings.concentration) {
        particles.push(new Particle(width / 2, height / 2));
    }

    // 全ての粒子を更新・描画
    // 配列の末尾から処理することで、安全に要素を削除できる
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.calculateForces(particles);
        p.update();
        p.display();

        // 寿命が尽きたか、画面外に出た粒子を配列から削除
        if (p.isDead()) {
            particles.splice(i, 1);
        }
    }
}

// ===== Particle クラス =====
class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(1, 4)); // 爆発的な動き
        this.acc = createVector(0, 0);
        this.maxSpeed = 5;

        let baseColor = color(random(palette));
        baseColor.setAlpha(255); // 透明度を初期化
        this.color = baseColor;

        this.size = random(3, 7);
        this.lifespan = random(150, 300); // 粒子の寿命
    }

    isDead() {
        return this.lifespan <= 0;
    }

    calculateForces(otherParticles) {
        this.acc.mult(0);

        let noiseFactor = map(settings.energy, 0, 100, 0, 0.5);
        let randomForce = p5.Vector.random2D().mult(noiseFactor);
        this.applyForce(randomForce);

        for (let other of otherParticles) {
            if (other === this) continue;

            let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
            let repulsionRadius = map(settings.polymer, 0, 100, 10, 100);

            if (d > 0 && d < repulsionRadius) {
                let repulsion = p5.Vector.sub(this.pos, other.pos);
                repulsion.normalize();
                repulsion.div(d * 0.2);
                this.applyForce(repulsion);
            }
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);

        this.lifespan -= 1.5; // 寿命を減らす

        // 画面外に出たら寿命をゼロにする
        if (this.pos.x > width + this.size || this.pos.x < -this.size ||
            this.pos.y > height + this.size || this.pos.y < -this.size) {
            this.lifespan = 0;
        }
    }

    display() {
        noStroke();
        // 寿命に応じてフェードアウト
        let currentAlpha = map(this.lifespan, 0, 255, 0, 255);
        this.color.setAlpha(currentAlpha);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
    }
}
