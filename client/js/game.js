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
    scene.add(player);

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
    let health = 100;
    let ammo = 30;
    let yaw = 0;
    let pitch = 0;
    let gameStarted = false;
    let gameOver = false;

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

            for (const enemy of enemies) {
                if (enemy.userData.health <= 0) continue;

                if (!enemy.userData.patrolOrigin) {
                    enemy.userData.patrolOrigin = enemy.position.clone();
                    enemy.userData.patrolPhase = Math.random() * Math.PI * 2;
                }

                const distance = enemy.position.distanceTo(player.position);
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
                enemy.lookAt(player.position.x, enemy.position.y, player.position.z);

                if (distance > 8) {
                    const direction = new THREE.Vector3(
                        player.position.x - enemy.position.x,
                        0,
                        player.position.z - enemy.position.z
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
                    health = Math.max(0, health - 10);

                    const healthDisplay = document.getElementById("battle-health");
                    if (healthDisplay) healthDisplay.textContent = health;

                    showMessage("UNDER FIRE! -10 HEALTH");

                    if (health <= 0) {
                        gameOver = true;
                        showMessage("OPERATOR ELIMINATED");
                        document.exitPointerLock?.();
                    }
                }
            }
        }

        camera.fov = isAiming ? 48 : 75;
        camera.updateProjectionMatrix();

        const cameraDistance = isAiming ? 2.8 : 4.8;
        const cameraHeight = isAiming ? 2.25 :
            (isCrouching ? 1.9 : 3.1);

        body.rotation.y = yaw + Math.PI;

        const offset = new THREE.Vector3(
            Math.sin(yaw) * cameraDistance,
            cameraHeight + pitch * 2,
            Math.cos(yaw) * cameraDistance
        );
        camera.position.copy(player.position).add(offset);
        camera.lookAt(
            player.position.x - Math.sin(yaw) * 2.5,
            player.position.y + 1.35 + pitch * 3,
            player.position.z - Math.cos(yaw) * 2.5
        );

        for (const enemy of enemies) {
            if (enemy.userData.healthBarGroup && enemy.userData.health > 0) {
                enemy.userData.healthBarGroup.quaternion.copy(camera.quaternion);
            }
        }

        renderer.render(scene, camera);
    }

    document.getElementById("battle-operator").textContent =
        localStorage.getItem("pvtSelectedOperator") || "VANGUARD";

    requestAnimationFrame(animate);
    console.log("PVT battlefield initialized.");
}
