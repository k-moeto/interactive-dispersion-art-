// グローバル変数
let particles = [];
let settings = {
    polymer: 70,       // ポリマー性能 (反発力)
    concentration: 150, // 粒子数
    energy: 30         // 動きの活発さ
};

// UI要素への参照
let polymerSlider, concentrationSlider, energySlider;
let polymerValueSpan, concentrationValueSpan, energyValueSpan;

function setup() {
    let canvasContainer = select('#canvas-container');
    let canvas = createCanvas(canvasContainer.width, 400);
    canvas.parent(canvasContainer); // キャンバスをコンテナに配置

    // UI要素を取得
    polymerSlider = select('#polymerSlider');
    concentrationSlider = select('#concentrationSlider');
    energySlider = select('#energySlider');
    polymerValueSpan = select('#polymerValue');
    concentrationValueSpan = select('#concentrationValue');
    energyValueSpan = select('#energyValue');

    // スライダーの初期値を設定オブジェクトに反映
    settings.polymer = polymerSlider.value();
    settings.concentration = concentrationSlider.value();
    settings.energy = energySlider.value();

    // スライダーが操作されたときのイベントリスナー
    polymerSlider.input(() => {
        settings.polymer = polymerSlider.value();
        polymerValueSpan.html(settings.polymer);
    });
    concentrationSlider.input(() => {
        settings.concentration = concentrationSlider.value();
        concentrationValueSpan.html(settings.concentration);
        resetParticles(); // 粒子数を変更
    });
    energySlider.input(() => {
        settings.energy = energySlider.value();
        energyValueSpan.html(settings.energy);
    });

    // 最初の粒子群を生成
    resetParticles();
}

function draw() {
    // 軌跡を残すために、少し透明な黒で背景を塗りつぶす
    background(26, 26, 26, 50);

    // 全ての粒子を更新・描画
    for (let p of particles) {
        p.calculateForces(particles); // 他の粒子からの力を計算
        p.update();                 // 位置を更新
        p.checkEdges();             // 壁との衝突判定
        p.display();                // 描画
    }
}

// 粒子を再生成する関数
function resetParticles() {
    particles = []; // 配列を初期化
    for (let i = 0; i < settings.concentration; i++) {
        particles.push(new Particle(random(width), random(height)));
    }
}


// ===== Particle クラス =====
// 粒子一つ一つの設計図
class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(1, 3));
        this.acc = createVector(0, 0);
        this.maxSpeed = 3; // 最高速度
        this.color = color(random(100, 255), random(100, 255), random(100, 255), 200);
        this.size = random(3, 6);
    }

    // 他の粒子からの力を計算して蓄積
    calculateForces(otherParticles) {
        this.acc.mult(0); // 毎フレーム、加速度をリセット

        // 環境エネルギー（ランダムな動き）
        let noiseFactor = map(settings.energy, 0, 100, 0, 1);
        let randomForce = p5.Vector.random2D().mult(noiseFactor);
        this.applyForce(randomForce);

        // 他の粒子との相互作用
        for (let other of otherParticles) {
            if (other === this) continue; // 自分自身とは計算しない

            let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);

            // 1. 反発力（ポリマーの性能）
            let repulsionRadius = map(settings.polymer, 0, 100, 5, 80); // ポリマー性能が高いほど、反発する距離が広がる
            if (d > 0 && d < repulsionRadius) {
                let repulsion = p5.Vector.sub(this.pos, other.pos);
                repulsion.normalize();
                repulsion.div(d * 0.5); // 近いほど強く反発
                this.applyForce(repulsion);
            }

            // 2. 引き合う力（凝集力） - 反発半径の外側で働く
            let attractionRadius = 100;
            if (d > repulsionRadius && d < attractionRadius) {
                let attraction = p5.Vector.sub(other.pos, this.pos);
                attraction.normalize();
                attraction.mult(0.05); // 弱い引力
                this.applyForce(attraction);
            }
        }
    }
    
    // 力（ベクトル）を加速度に加える
    applyForce(force) {
        this.acc.add(force);
    }

    // 物理法則に従って位置を更新
    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
    }

    // 描画
    display() {
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
    }

    // 画面の端に来たら反対側から出てくる（ループ）
    checkEdges() {
        if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.y > height) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = height;
    }
}
