// Фон на WebGL: плазма + синтвейв-солнце + неоновая сетка. Реагирует на мышь и бит.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uBeat;
uniform float uGod;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = m * p;
        a *= 0.5;
    }
    return v;
}

vec3 hueShift(vec3 c, float h) {
    mat3 toYIQ = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
    mat3 toRGB = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);
    vec3 yiq = toYIQ * c;
    float cs = cos(h);
    float sn = sin(h);
    yiq.yz = mat2(cs, sn, -sn, cs) * yiq.yz;
    return toRGB * yiq;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec2 m = (uMouse - 0.5 * uRes) / uRes.y;
    float t = uTime;

    // Плазма
    vec2 p = uv * 1.6;
    vec2 q = vec2(fbm(p + vec2(0.0, t * 0.06)), fbm(p + vec2(5.2, 1.3) - t * 0.05));
    vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 0.12), fbm(p + 3.5 * q + vec2(8.3, 2.8) - t * 0.1));
    float f = fbm(p + 3.0 * r + (m - uv) * 0.15);

    vec3 col = vec3(0.035, 0.0, 0.06);
    col = mix(col, vec3(0.5, 0.0, 0.32), smoothstep(0.2, 0.85, f));
    col = mix(col, vec3(1.0, 0.04, 0.47), smoothstep(0.5, 1.0, f * length(q) * 1.4));
    col = mix(col, vec3(0.22, 0.02, 0.5), smoothstep(0.3, 1.0, r.y) * 0.6);
    col *= 0.75;

    float hz = -0.2;

    // Солнце
    vec2 sp = uv - vec2(0.0, hz + 0.3);
    float sd = length(sp);
    float sunR = 0.32 + uBeat * 0.02;
    float sun = smoothstep(sunR, sunR - 0.006, sd);
    float lower = clamp(-sp.y / sunR, 0.0, 1.0);
    float band = fract(sp.y * 16.0 - t * 0.5);
    sun *= 1.0 - step(band, lower * 0.75) * step(sp.y, 0.05);
    sun *= step(hz, uv.y);
    vec3 sunCol = mix(vec3(1.0, 0.05, 0.5), vec3(1.0, 0.85, 0.25), clamp(sp.y / sunR * 0.5 + 0.5, 0.0, 1.0));
    col = mix(col, sunCol, sun);
    col += vec3(1.0, 0.1, 0.5) * 0.3 * exp(-4.0 * max(sd - sunR, 0.0)) * (1.0 + uBeat) * step(hz, uv.y);

    // Сетка
    if (uv.y < hz) {
        float d = hz - uv.y;
        float z = 0.35 / d;
        vec2 g = vec2(uv.x * z, z + t * (1.2 + uBeat * 2.5));
        vec2 gf = abs(fract(g) - 0.5);
        float px = 1.0 / uRes.y;
        float wx = 1.6 * z * px;
        float wy = 1.6 * z * z / 0.35 * px;
        float lx = 1.0 - smoothstep(0.0, wx, 0.5 - gf.x);
        float ly = (1.0 - smoothstep(0.0, wy, 0.5 - gf.y)) * smoothstep(0.5, 0.1, wy);
        float line = max(lx * smoothstep(0.5, 0.1, wx), ly);
        float fade = smoothstep(0.0, 0.3, d);
        vec3 gridCol = mix(vec3(1.0, 0.1, 0.6), vec3(0.0, 0.95, 1.0), 0.35 + 0.35 * sin(t * 0.7 + uv.x * 2.0));
        col = mix(col * 0.3, vec3(0.05, 0.0, 0.09), 0.6);
        col += gridCol * line * fade * (1.0 + uBeat * 1.8);
    }
    col += vec3(1.0, 0.15, 0.6) * exp(-abs(uv.y - hz) * 30.0) * (0.55 + uBeat * 0.6);

    // Свечение за курсором
    col += vec3(1.0, 0.2, 0.7) * 0.22 * exp(-length(uv - m) * 4.0);

    // Режим бога: радуга
    col = mix(col, hueShift(col, t * 3.0 + uv.x * 2.5 + uv.y), uGod);

    col += uBeat * 0.05 * vec3(1.0, 0.2, 0.6);
    col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 1.7);
    col *= 1.0 - 0.35 * dot(uv * 0.8, uv * 0.8);

    gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
}

export function initShader(canvas, { reducedMotion = false } = {}) {
    const state = { beat: 0, god: 0, godTarget: 0, mouseX: innerWidth / 2, mouseY: innerHeight / 2 };
    const api = {
        kick() { state.beat = 1; },
        setGod(on) { state.godTarget = on ? 1 : 0; },
        ok: false
    };

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return api;

    let prog;
    try {
        prog = gl.createProgram();
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
        console.warn('Шейдер не завёлся, будет CSS-фон:', e);
        return api;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = name => gl.getUniformLocation(prog, name);
    const uRes = u('uRes'), uTime = u('uTime'), uMouse = u('uMouse'), uBeat = u('uBeat'), uGod = u('uGod');

    let scale = 1;
    function resize() {
        // Плазма мягкая — рисуем в пониженном разрешении, чтобы не жарить видеокарту
        scale = Math.min(window.devicePixelRatio || 1, 1) * (innerWidth > 1400 ? 0.5 : 0.6);
        canvas.width = Math.max(1, Math.round(innerWidth * scale));
        canvas.height = Math.max(1, Math.round(innerHeight * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', e => { state.mouseX = e.clientX; state.mouseY = e.clientY; }, { passive: true });

    const speed = reducedMotion ? 0.12 : 1;
    const start = performance.now();
    let last = start;
    function frame(now) {
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        state.beat *= Math.pow(0.02, dt);
        state.god += (state.godTarget - state.god) * Math.min(1, dt * 3);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, ((now - start) / 1000) * speed);
        gl.uniform2f(uMouse, state.mouseX * scale, (innerHeight - state.mouseY) * scale);
        gl.uniform1f(uBeat, state.beat);
        gl.uniform1f(uGod, state.god);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    canvas.classList.add('on');
    api.ok = true;
    return api;
}
