// BalatroSwirl — real-time swirl background, ported from Balatro's
// resources/shaders/background.fs (LocalThunk). Renders to a full-bleed
// <canvas> with WebGL. Falls back to a static gradient if WebGL is unavailable.
//
// Props:
//   palette: 'menu' | 'red' | 'green' | 'blue' | 'gold'   — color triplet preset
//   spinAmount: number (default 0.5)
//   contrast:   number (default 3.5)
//   pixelSize:  number (default 700) — higher = smaller pixels
//
// Use as the OUTERMOST child of a relatively-positioned shell.

const { useRef: bsUR, useEffect: bsUE } = React;

const PALETTES = {
  // Approximations of Balatro's main-menu reds
  menu:  [[0.345, 0.137, 0.180], [0.745, 0.247, 0.290], [0.075, 0.039, 0.063]],
  red:   [[0.42, 0.10, 0.14],   [0.78, 0.22, 0.26],   [0.05, 0.02, 0.04]],
  green: [[0.10, 0.32, 0.18],   [0.18, 0.62, 0.36],   [0.03, 0.08, 0.05]],
  blue:  [[0.08, 0.22, 0.42],   [0.18, 0.42, 0.78],   [0.02, 0.04, 0.10]],
  gold:  [[0.45, 0.31, 0.06],   [0.92, 0.68, 0.16],   [0.08, 0.05, 0.02]],
  noir:  [[0.10, 0.10, 0.12],   [0.22, 0.22, 0.28],   [0.02, 0.02, 0.03]],
};

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_screen;
uniform vec2 u_res;
void main() {
  v_screen = (a_pos * 0.5 + 0.5) * u_res;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Direct port of background.fs. love_ScreenSize → u_res; screen_coords → v_screen.
const FRAG_SRC = `
precision mediump float;
varying vec2 v_screen;
uniform vec2  u_res;
uniform float u_time;
uniform float u_spin_time;
uniform vec3  u_c1;
uniform vec3  u_c2;
uniform vec3  u_c3;
uniform float u_contrast;
uniform float u_spin_amount;
uniform float u_pixel_fac;

#define SPIN_EASE 0.5

void main() {
  float pixel_size = length(u_res.xy) / u_pixel_fac;
  vec2 uv = (floor(v_screen * (1.0 / pixel_size)) * pixel_size - 0.5 * u_res) / length(u_res) - vec2(0.12, 0.0);
  float uv_len = length(uv);

  float speed = (u_spin_time * SPIN_EASE * 0.2) + 302.2;
  float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE * 20.0 * (u_spin_amount * uv_len + (1.0 - u_spin_amount));
  vec2 mid = (u_res / length(u_res)) / 2.0;
  uv = vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid;

  uv *= 30.0;
  speed = u_time * 2.0;
  vec2 uv2 = vec2(uv.x + uv.y);

  for (int i = 0; i < 5; i++) {
    uv2 += sin(max(uv.x, uv.y)) + uv;
    uv  += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));
    uv  -= 1.0 * cos(uv.x + uv.y) - 1.0 * sin(uv.x * 0.711 - uv.y);
  }

  float contrast_mod = 0.25 * u_contrast + 0.5 * u_spin_amount + 1.2;
  float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
  float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
  float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
  float c3p = 1.0 - min(1.0, c1p + c2p);

  vec3 col = (0.3 / u_contrast) * u_c1 + (1.0 - 0.3 / u_contrast) * (u_c1 * c1p + u_c2 * c2p + u_c3 * c3p);
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('BalatroSwirl shader err', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function BalatroSwirl({
  palette = 'menu',
  spinAmount = 0.5,
  contrast = 3.5,
  pixelSize = 700,
  style = {},
}) {
  const canvasRef = bsUR(null);
  const rafRef = bsUR(0);
  const startRef = bsUR(performance.now());

  bsUE(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return; // fallback CSS handles it

    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('BalatroSwirl link err', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes      = gl.getUniformLocation(prog, 'u_res');
    const uTime     = gl.getUniformLocation(prog, 'u_time');
    const uSpinTime = gl.getUniformLocation(prog, 'u_spin_time');
    const uC1       = gl.getUniformLocation(prog, 'u_c1');
    const uC2       = gl.getUniformLocation(prog, 'u_c2');
    const uC3       = gl.getUniformLocation(prog, 'u_c3');
    const uContrast = gl.getUniformLocation(prog, 'u_contrast');
    const uSpin     = gl.getUniformLocation(prog, 'u_spin_amount');
    const uPxFac    = gl.getUniformLocation(prog, 'u_pixel_fac');

    const colors = PALETTES[palette] || PALETTES.menu;
    gl.uniform3fv(uC1, colors[0]);
    gl.uniform3fv(uC2, colors[1]);
    gl.uniform3fv(uC3, colors[2]);
    gl.uniform1f(uContrast, contrast);
    gl.uniform1f(uSpin, spinAmount);
    gl.uniform1f(uPxFac, pixelSize);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uSpinTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [palette, spinAmount, contrast, pixelSize]);

  // CSS fallback gradient mirrors palette so the component still looks
  // right on no-WebGL devices (some MCP renderers).
  const fallback = (() => {
    const c = PALETTES[palette] || PALETTES.menu;
    const rgb = (a) => `rgb(${(a[0]*255)|0},${(a[1]*255)|0},${(a[2]*255)|0})`;
    return `radial-gradient(ellipse at 30% 40%, ${rgb(c[1])} 0%, ${rgb(c[0])} 45%, ${rgb(c[2])} 100%)`;
  })();

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        display: 'block', background: fallback, zIndex: 0,
        ...style,
      }}
    />
  );
}

window.BalatroSwirl = BalatroSwirl;
