import * as THREE from "/vendor/three/build/three.module.js";

const screen = document.getElementById("gameplay-screen");

if (!screen) {
    console.error("PVT: Gameplay screen is missing.");
} else {
    screen.innerHTML = `
        <div id="battlefield" style="position:relative;width:100%;height:80vh;min-height:480px;background:#111 url('/assets/images/battlefield.png') center center / cover no-repeat;overflow:hidden;">
            <div id="battle-hud" style="position:absolute;z-index:5;top:15px;left:15px;color:#fff;font-family:monospace;background:#111c;padding:15px;">
                <strong>PVT // MISSION IN PROGRESS</strong>
                <p>OPERATOR: <span id="battle-operator">VANGUARD</span></p>
                <p>HEALTH: <span id="battle-health">100</span>%</p>
                <p>AMMO: <span id="battle-ammo">30</span></p>
                <p>ENEMIES: <span id="battle-enemies">5</span></p>
            </div>
            <div style="position:absolute;z-index:5;top:50%;left:50%;color:white;font-size:25px;transform:translate(-50%,-50%);pointer-events:none;">+</div>
            <div style="position:absolute;z-index:5;bottom:12px;left:12px;color:white;font:12px monospace;background:#111c;padding:10px;">
                WASD: MOVE | MOUSE: AIM | CLICK: SHOOT | SHIFT: RUN
            </div>
            <div id="battle-message" style="position:absolute;z-index:6;top:50%;left:50%;transform:translate(-50%,-50%);color:white;text-align:center;font:bold 22px monospace;display:none;"></div>
            <canvas id="battlefield-canvas" style="display:block;width:100%;height:100%;"></canvas>
            <div id="weapon-view" style="position:absolute;z-index:8;left:50%;right:auto;bottom:-3%;width:min(68%,680px);transform:translateX(-50%);pointer-events:none;filter:drop-shadow(0 8px 8px #000b);">
    <div id="muzzle-flash" style="position:absolute;left:47%;top:25%;width:12%;height:18%;opacity:0;pointer-events:none;background:radial-gradient(ellipse,#fff 0%,#fff4a0 25%,#ff9622 50%,transparent 75%);"></div>
    <svg viewBox="0 0 520 400" width="100%" aria-label="First-person rifle and gloved arms">
        <defs>
            <linearGradient id="pvtSleeve" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#66664b"/>
                <stop offset="55%" stop-color="#34392c"/>
                <stop offset="100%" stop-color="#1b211b"/>
            </linearGradient>
            <linearGradient id="pvtRifle" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#64696a"/>
                <stop offset="45%" stop-color="#292e30"/>
                <stop offset="100%" stop-color="#101315"/>
            </linearGradient>
        </defs>

        <!-- Sleeves and forearms -->
        <path d="M20 400 L45 310 L135 250 L195 285 L165 400 Z"
              fill="url(#pvtSleeve)" stroke="#171b17" stroke-width="8"/>
        <path d="M500 400 L475 310 L385 250 L325 285 L355 400 Z"
              fill="url(#pvtSleeve)" stroke="#171b17" stroke-width="8"/>

        <!-- Left gloved hand -->
        <path d="M115 260 L150 226 L190 235 L220 267 L205 295
                 L175 291 L154 280 L132 294 L105 282 Z"
              fill="#242923" stroke="#101410" stroke-width="7"/>
        <path d="M139 259 L168 246 M151 272 L181 260"
              stroke="#777966" stroke-width="6" stroke-linecap="round"/>

        <!-- Right gloved hand -->
        <path d="M405 260 L370 226 L330 235 L300 267 L315 295
                 L345 291 L366 280 L388 294 L415 282 Z"
              fill="#242923" stroke="#101410" stroke-width="7"/>
        <path d="M381 259 L352 246 M369 272 L339 260"
              stroke="#777966" stroke-width="6" stroke-linecap="round"/>

        <!-- Rifle stock -->
        <path d="M222 240 L298 240 L315 302 L300 365
                 L279 390 L241 390 L220 365 L205 302 Z"
              fill="#272b2c" stroke="#0c0f10" stroke-width="9"/>

        <!-- Main receiver -->
        <path d="M218 172 L302 172 L311 256 L295 300
                 L225 300 L209 256 Z"
              fill="url(#pvtRifle)" stroke="#0b0d0e" stroke-width="9"/>

        <!-- Rifle barrel pointing into the battlefield -->
        <path d="M239 178 L239 75 L250 43 L270 43
                 L281 75 L281 178 Z"
              fill="#252a2c" stroke="#0b0d0e" stroke-width="7"/>
        <path d="M248 82 L272 82 M249 108 L271 108"
              stroke="#727879" stroke-width="4"/>
        <path d="M245 45 L245 28 L275 28 L275 45 Z"
              fill="#101314" stroke="#090b0c" stroke-width="5"/>

        <!-- Sight -->
        <path d="M243 168 L243 145 L253 135 L267 135 L277 145 L277 168 Z"
              fill="#171b1c" stroke="#090b0c" stroke-width="5"/>
        <rect x="254" y="142" width="12" height="14" rx="2" fill="#6d7777"/>

        <!-- Magazine and details -->
        <path d="M231 272 L289 272 L281 340 L270 353 L250 353 L239 340 Z"
              fill="#171b1d" stroke="#090b0c" stroke-width="6"/>
        <path d="M239 289 L281 289 M240 302 L280 302 M242 315 L278 315"
              stroke="#555b5d" stroke-width="4"/>
        <path d="M219 202 L301 202 M219 214 L301 214"
              stroke="#74797a" stroke-width="3" opacity=".65"/>
        <path d="M224 235 L240 235 M280 235 L296 235"
              stroke="#090b0c" stroke-width="6"/>
    </svg>
</div>
        </div>`;

    const battlefield = document.getElementById("battlefield");
    battlefield.style.backgroundImage = "url('/assets/images/battlefield.png')";
    battlefield.style.backgroundSize = "cover";
    battlefield.style.backgroundPosition = "center";
    battlefield.style.backgroundRepeat = "no-repeat";

    const canvas = document.getElementById("battlefield-canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.background = "transparent";
    canvas.style.pointerEvents = "auto";
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = null;

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 250);
    let isAiming = false;
    const weaponView = document.getElementById("weapon-view");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    scene.add(new THREE.HemisphereLight(0xdce8ef, 0x454337, 2));

    const sun = new THREE.DirectionalLight(0xffe3bd, 3);
    sun.position.set(-35, 55, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70;
    sun.shadow.camera.bottom = -70;
    scene.add(sun);

    const solidObstacles = [];

    const player = new THREE.Group();
    const soldierLoader = new THREE.TextureLoader();

    const playerTexture = soldierLoader.load(
        "/assets/images/soldiers/player-soldier.png"
    );
    playerTexture.colorSpace = THREE.SRGBColorSpace;

    const body = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 2.6),
        new THREE.MeshBasicMaterial({
            map: playerTexture,
            transparent: true,
            alphaTest: 0.05,
            side: THREE.DoubleSide
        })
    );
    body.position.y = 1.3;
    player.add(body);
    player.position.set(0, 0, 12);
    player.visible = false;
    scene.add(player);

    // Visible soldier models for other connected PVT players.
    const remotePlayers = new Map();

    function createRemotePlayer(id) {
        const remote = new THREE.Group();
        const soldier = new THREE.Mesh(
            new THREE.PlaneGeometry(1.8, 2.6),
            new THREE.MeshBasicMaterial({
                map: playerTexture,
                transparent: true,
                alphaTest: 0.05,
                side: THREE.DoubleSide
            })
        );
        remote.add(soldier);
        remote.userData.playerId = id;
        scene.add(remote);
        remotePlayers.set(id, remote);
        return remote;
    }

    const enemies = [];

    for (let i = 0; i < 5; i++) {
        const enemyTexture = soldierLoader.load(
            `/assets/images/soldiers/enemy-soldier-${(i % 4) + 1}.png`
        );
        enemyTexture.colorSpace = THREE.SRGBColorSpace;

        const enemy = new THREE.Mesh(
            new THREE.PlaneGeometry(1.7, 2.4),
            new THREE.MeshBasicMaterial({
                map: enemyTexture,
                transparent: true,
                alphaTest: 0.05,
                side: THREE.DoubleSide
            })
        );
        enemy.position.set((i - 2) * 9, 1.2, -25 - Math.random() * 20);

        const groundShadow = new THREE.Mesh(
            new THREE.CircleGeometry(0.62, 24),
            new THREE.MeshBasicMaterial({
                color: 0x111111,
                transparent: true,
                opacity: 0.32,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );
        groundShadow.rotation.x = -Math.PI / 2;
        groundShadow.position.y = -1.17;
        groundShadow.scale.set(1, 0.58, 1);
        enemy.add(groundShadow);
        enemy.castShadow = true;
        enemy.userData.health = 100;
        enemy.userData.lastShot = 0;
        enemy.userData.strafeDirection = i % 2 === 0 ? 1 : -1;
        enemy.userData.nextStrafe = 0;

        const barGroup = new THREE.Group();

        const barBackground = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 0.16, 0.08),
            new THREE.MeshBasicMaterial({ color: 0x222222 })
        );

        const barFill = new THREE.Mesh(
            new THREE.BoxGeometry(1.16, 0.10, 0.10),
            new THREE.MeshBasicMaterial({ color: 0x35ff55 })
        );

        barFill.position.z = 0.06;
        barGroup.add(barBackground);
        barGroup.add(barFill);
        barGroup.position.set(0, 1.35, 0);
        enemy.add(barGroup);

        enemy.userData.healthBar = barFill;
        enemy.userData.healthBarGroup = barGroup;

        scene.add(enemy);
        enemies.push(enemy);
    }

    const keys = {};
    const multiplayerSocket =
        typeof window.io === "function" ? window.io() : null;
    let multiplayerPlayers = [];
    let lastNetworkUpdate = 0;
    let health = 100;
    let ammo = 30;
    let yaw = 0;
    let pitch = 0;
    let gameStarted = false;
    let gameOver = false;

    if (multiplayerSocket) {
        multiplayerSocket.on("players:update", (players) => {
            if (!Array.isArray(players)) return;

            multiplayerPlayers = players;
            const connectedIds = new Set();

            for (const other of players) {
                if (!other || typeof other.id !== "string") continue;
                if (other.id === multiplayerSocket.id) continue;
                if (!Number.isFinite(other.x) || !Number.isFinite(other.z)) continue;

                connectedIds.add(other.id);
                const remote = remotePlayers.get(other.id)
                    || createRemotePlayer(other.id);

                remote.position.set(
                    other.x,
                    Number.isFinite(other.y) ? other.y : 0,
                    other.z
                );
                remote.visible = true;
            }

            for (const [id, remote] of remotePlayers) {
                if (!connectedIds.has(id)) {
                    scene.remove(remote);
                    remote.traverse((object) => {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) object.material.dispose();
                    });
                    remotePlayers.delete(id);
                }
            }
        });

        multiplayerSocket.on("player:damaged", (data) => {
            if (!gameStarted || gameOver || !data) return;

            const damage = Math.max(
                0, Math.min(10, Number(data.amount) || 0)
            );
            health = Math.max(0, health - damage);

            const healthDisplay = document.getElementById("battle-health");
            if (healthDisplay) healthDisplay.textContent = health;

            showMessage("ENEMY FIRE! -" + damage + " HEALTH");

            if (health <= 0) {
                gameOver = true;
                showMessage("OPERATOR ELIMINATED");
                document.exitPointerLock?.();
            }
        });
    } else {
        console.warn("PVT: Socket.IO client script is unavailable.");
    }

    window.addEventListener("pvt:start-game", () => {
        gameStarted = true;
        gameOver = false;
        health = 100;
        ammo = 30;

        document.getElementById("battle-health").textContent = "100";
        document.getElementById("battle-ammo").textContent = "30";

        const message = document.getElementById("battle-message");
        if (message) {
            message.style.display = "none";
            message.textContent = "";
        }

        console.log("PVT: Mission started. Health: 100.");
    });
    let verticalVelocity = 0;
    let isCrouching = false;
    let jumpHeld = false;
    const normalCameraHeight = 4;
    const crouchCameraHeight = 2.5;

    const raycaster = new THREE.Raycaster();

    function isBlocked(x, z) {
        const radius = 0.9;

        return solidObstacles.some(o => {
            const angle = o.rotation || 0;
            const cos = Math.abs(Math.cos(angle));
            const sin = Math.abs(Math.sin(angle));

            const extentX =
                o.halfWidth * cos + o.halfDepth * sin;
            const extentZ =
                o.halfWidth * sin + o.halfDepth * cos;

            return Math.abs(x - o.x) < extentX + radius &&
                   Math.abs(z - o.z) < extentZ + radius;
        });
    }

    canvas.addEventListener("contextmenu", e => e.preventDefault());

    canvas.addEventListener("mousedown", e => {
        if (e.button !== 2 || gameOver) return;
        e.preventDefault();
        isAiming = true;
        canvas.requestPointerLock?.();
        if (weaponView) {
            weaponView.style.right = "20%";
            weaponView.style.width = "36%";
        }
    });

    window.addEventListener("mouseup", e => {
        if (e.button !== 2) return;
        isAiming = false;
        if (weaponView) {
            weaponView.style.right = "-2%";
            weaponView.style.width = "min(48%, 520px)";
        }
    });

    window.addEventListener("keydown", e => {
        keys[e.code] = true;
        if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)) {
            e.preventDefault();
        }
    });

    window.addEventListener("keyup", e => {
        keys[e.code] = false;
    });


    // PVT procedural gunfire audio; no external audio files required.
    let pvtAudioContext = null;

    function playGunfire(enemyShot = false) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            if (!pvtAudioContext) pvtAudioContext = new AudioCtx();
            const ctx = pvtAudioContext;
            if (ctx.state === "suspended") ctx.resume();

            const now = ctx.currentTime;

            // Sharp gunshot crack.
            const length = Math.floor(ctx.sampleRate * 0.16);
            const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) *
                    Math.pow(1 - i / length, enemyShot ? 5 : 7);
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(enemyShot ? 1500 : 2600, now);
            filter.frequency.exponentialRampToValueAtTime(180, now + 0.13);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(enemyShot ? 0.22 : 0.38, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + 0.16);

            // Low-frequency body of the shot.
            const boom = ctx.createOscillator();
            const boomGain = ctx.createGain();
            boom.type = "sine";
            boom.frequency.setValueAtTime(enemyShot ? 100 : 130, now);
            boom.frequency.exponentialRampToValueAtTime(35, now + 0.12);
            boomGain.gain.setValueAtTime(enemyShot ? 0.22 : 0.3, now);
            boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
            boom.connect(boomGain);
            boomGain.connect(ctx.destination);
            boom.start(now);
            boom.stop(now + 0.14);
        } catch (error) {
            console.warn("PVT audio unavailable:", error);
        }
    }

    canvas.addEventListener("click", () => {
        if (gameOver) return;

        const weaponView = document.getElementById("weapon-view");
        const muzzleFlash = document.getElementById("muzzle-flash");

        if (weaponView) {
            weaponView.style.transition = "transform 70ms ease-out";
            weaponView.style.transform = "translate(-8px, 10px) rotate(-1deg)";
            setTimeout(() => {
                weaponView.style.transform = "translate(0, 0) rotate(0deg)";
            }, 90);
        }

        if (muzzleFlash) {
            muzzleFlash.style.opacity = "1";
            setTimeout(() => {
                muzzleFlash.style.opacity = "0";
            }, 65);
        }


        if (document.pointerLockElement !== canvas) {
            canvas.requestPointerLock?.();
        }

        if (ammo <= 0) {
            showMessage("OUT OF AMMO — RELOAD WITH R");
            return;
        }

        playGunfire(false);
        ammo--;
        document.getElementById("battle-ammo").textContent = ammo;

        for (const enemy of enemies) {
            if (enemy.userData.health > 0) {
                enemy.userData.alertedUntil = performance.now() + 12000;
            }
        }

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = raycaster.intersectObjects(enemies.filter(e => e.userData.health > 0));

        if (hits.length && hits[0].distance < 65) {
            const enemy = hits[0].object;
            enemy.userData.health = Math.max(0, enemy.userData.health - 50);

            const hp = enemy.userData.health / 100;
            const bar = enemy.userData.healthBar;
            if (bar) {
                bar.scale.x = Math.max(0.001, hp);
                bar.position.x = -(1.16 * (1 - hp)) / 2;
                bar.material.color.set(
                    hp > 0.5 ? 0x35e36a : hp > 0.25 ? 0xffbb33 : 0xff3333
                );
            }

            enemy.material.color.set(0xffaa22);

            if (enemy.userData.health <= 0) {
                enemy.visible = false;
                enemy.userData.health = 0;
                document.getElementById("battle-enemies").textContent =
                    enemies.filter(e => e.userData.health > 0).length;

                if (enemies.every(e => e.userData.health <= 0)) {
                    gameOver = true;
                    showMessage("MISSION COMPLETE!");
                    document.exitPointerLock?.();
                }
            } else {
                setTimeout(() => {
                    if (enemy.userData.health > 0) enemy.material.color.set(0x8d3026);
                }, 150);
            }
        }
    });

    window.addEventListener("mousemove", e => {
        if (document.pointerLockElement !== canvas || gameOver) return;
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-0.65, Math.min(0.65, pitch));
    });

    window.addEventListener("keydown", e => {
        if (e.code === "KeyR") {
            ammo = 30;
            document.getElementById("battle-ammo").textContent = ammo;
        }
    });

    function showMessage(message) {
        const el = document.getElementById("battle-message");
        if (!el) return;

        el.style.display = "block";

        let retryButton = document.getElementById("retry-mission-button");
        const isFinished =
            message.includes("OPERATOR ELIMINATED") ||
            message.includes("MISSION COMPLETE");

        if (isFinished) {
            el.textContent = message;

            if (!retryButton) {
                retryButton = document.createElement("button");
                retryButton.id = "retry-mission-button";
                retryButton.textContent = "RETRY MISSION";
                retryButton.style.cssText =
                    "display:block;margin:20px auto;padding:14px 28px;" +
                    "background:#c62828;color:white;border:2px solid white;" +
                    "font-size:16px;font-weight:bold;cursor:pointer;";

                retryButton.addEventListener("click", () => {
                    window.location.href =
                        window.location.pathname + "?retry=" + Date.now();
                });

                el.appendChild(retryButton);
            }

            return;
        }

        if (retryButton) retryButton.remove();

        el.textContent = message;
    }

    function resize() {
        const w = Math.max(1, canvas.clientWidth);
        const h = Math.max(1, canvas.clientHeight);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize);
    resize();

    let lastTime = 0;

    function animate(time) {
        requestAnimationFrame(animate);
        const delta = Math.min((time - lastTime) / 1000 || 0, 0.05);
        lastTime = time;

        if (gameStarted && !gameOver) {
            isCrouching = !!(keys.KeyC || keys.ControlLeft);
            const crouchFactor = isCrouching ? 0.55 : 1;
            const sprintFactor = keys.ShiftLeft && !isCrouching ? 10 : 6;
            const speed = sprintFactor * crouchFactor * delta;

            if (keys.Space && !jumpHeld && player.position.y <= 0.001) {
                verticalVelocity = 7;
            }
            jumpHeld = !!keys.Space;

            verticalVelocity -= 18 * delta;
            player.position.y += verticalVelocity * delta;
            if (player.position.y < 0) {
                player.position.y = 0;
                verticalVelocity = 0;
            }
            const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
            const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

            let moveX = 0;
            let moveZ = 0;

            if (keys.KeyW) { moveX += forward.x * speed; moveZ += forward.z * speed; }
            if (keys.KeyS) { moveX -= forward.x * speed; moveZ -= forward.z * speed; }
            if (keys.KeyD) { moveX += right.x * speed; moveZ += right.z * speed; }
            if (keys.KeyA) { moveX -= right.x * speed; moveZ -= right.z * speed; }

            const nextX = player.position.x + moveX;
            if (!isBlocked(nextX, player.position.z)) {
                player.position.x = nextX;
            }

            const nextZ = player.position.z + moveZ;
            if (!isBlocked(player.position.x, nextZ)) {
                player.position.z = nextZ;
            }

            player.position.x = THREE.MathUtils.clamp(player.position.x, -75, 75);
            player.position.z = THREE.MathUtils.clamp(player.position.z, -75, 75);

            // Share this operator's position with connected players.
            if (multiplayerSocket && time - lastNetworkUpdate >= 100) {
                lastNetworkUpdate = time;
                multiplayerSocket.emit("player:update", {
                    x: player.position.x,
                    y: player.position.y,
                    z: player.position.z,
                    health,
                    operator: localStorage.getItem("pvtSelectedOperator") || "VANGUARD"
                });
            }

            for (const enemy of enemies) {
                if (enemy.userData.health <= 0) continue;

                if (!enemy.userData.patrolOrigin) {
                    enemy.userData.patrolOrigin = enemy.position.clone();
                    enemy.userData.patrolPhase = Math.random() * Math.PI * 2;
                }

                // Select the closest known connected operator.
                let target = {
                    id: multiplayerSocket ? multiplayerSocket.id : "local",
                    position: player.position,
                    local: true
                };
                let distance = enemy.position.distanceTo(player.position);

                if (multiplayerSocket) {
                    for (const other of multiplayerPlayers) {
                        if (!other || other.id === multiplayerSocket.id) continue;
                        if (!Number.isFinite(other.x) || !Number.isFinite(other.z)) continue;

                        const remotePosition = new THREE.Vector3(
                            other.x, Number(other.y) || 0, other.z
                        );
                        const remoteDistance =
                            enemy.position.distanceTo(remotePosition);

                        if (remoteDistance < distance) {
                            distance = remoteDistance;
                            target = {
                                id: other.id,
                                position: remotePosition,
                                local: false
                            };
                        }
                    }
                }

                const targetPosition = target.position;
                const alerted = time < (enemy.userData.alertedUntil || 0);
                const detected = distance < 30 || alerted;

                if (!detected) {
                    enemy.userData.state = "PATROL";

                    const phase = time * 0.00035 + enemy.userData.patrolPhase;
                    const origin = enemy.userData.patrolOrigin;
                    const targetX = origin.x + Math.cos(phase) * 4;
                    const targetZ = origin.z + Math.sin(phase) * 4;

                    enemy.position.x += (targetX - enemy.position.x) * delta * 0.5;
                    enemy.position.z += (targetZ - enemy.position.z) * delta * 0.5;
                    enemy.position.y = 1.2;
                    continue;
                }

                enemy.userData.state = "ENGAGE";
                enemy.lookAt(targetPosition.x, enemy.position.y, targetPosition.z);

                if (distance > 8) {
                    const direction = new THREE.Vector3(
                        targetPosition.x - enemy.position.x,
                        0,
                        targetPosition.z - enemy.position.z
                    ).normalize();

                    enemy.position.addScaledVector(direction, delta * 3.5);

                    if (time > enemy.userData.nextStrafe) {
                        enemy.userData.strafeDirection *= -1;
                        enemy.userData.nextStrafe = time + 1400 + Math.random() * 1200;
                    }

                    const side = new THREE.Vector3(direction.z, 0, -direction.x);
                    enemy.position.addScaledVector(
                        side,
                        enemy.userData.strafeDirection * delta * 1.0
                    );

                    if (isBlocked(enemy.position.x, enemy.position.z)) {
                        enemy.position.addScaledVector(
                            side, -enemy.userData.strafeDirection * delta * 2
                        );
                    }
                }

                enemy.position.x = THREE.MathUtils.clamp(enemy.position.x, -75, 75);
                enemy.position.z = THREE.MathUtils.clamp(enemy.position.z, -75, 75);
                enemy.position.y = 1.2;

                if (distance <= 14 && time - enemy.userData.lastShot > 1000) {
                    enemy.userData.lastShot = time;
                    playGunfire(true);

                    if (target.local) {
                        health = Math.max(0, health - 10);

                        const healthDisplay =
                            document.getElementById("battle-health");
                        if (healthDisplay) {
                            healthDisplay.textContent = health;
                        }

                        showMessage("UNDER FIRE! -10 HEALTH");

                        if (health <= 0) {
                            gameOver = true;
                            showMessage("OPERATOR ELIMINATED");
                            document.exitPointerLock?.();
                        }
                    } else if (multiplayerSocket) {
                        multiplayerSocket.emit("player:damage", {
                            id: target.id,
                            amount: 10
                        });
                    }
                }
            }
        }

        camera.fov = isAiming ? 48 : 75;
        camera.updateProjectionMatrix();

        // First-person view: camera at the operator's eye level.
        const eyeHeight = isCrouching ? 1.0 : 1.65;
        camera.position.set(
            player.position.x,
            player.position.y + eyeHeight,
            player.position.z
        );

        const lookDirection = new THREE.Vector3(
            -Math.sin(yaw) * Math.cos(pitch),
            Math.sin(pitch),
            -Math.cos(yaw) * Math.cos(pitch)
        );

        camera.lookAt(
            camera.position.x + lookDirection.x * 30,
            camera.position.y + lookDirection.y * 30,
            camera.position.z + lookDirection.z * 30
        );

        for (const enemy of enemies) {
            if (enemy.userData.healthBarGroup && enemy.userData.health > 0) {
                enemy.userData.healthBarGroup.quaternion.copy(camera.quaternion);
            }
        }

        // Turn remote soldier sprites toward this player's camera.
        for (const remote of remotePlayers.values()) {
            remote.lookAt(camera.position.x, remote.position.y, camera.position.z);
        }

        renderer.render(scene, camera);
    }

    document.getElementById("battle-operator").textContent =
        localStorage.getItem("pvtSelectedOperator") || "VANGUARD";

    requestAnimationFrame(animate);
    console.log("PVT battlefield initialized.");
}
