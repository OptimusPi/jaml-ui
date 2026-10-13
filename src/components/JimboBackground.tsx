import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { cx } from '../utils/cx.ts';

export type JimboBackgroundColor = string | [number, number, number];

export interface JimboBackgroundConfig {
  /** Three palette colors. Each can be `#RRGGBB` / `#RGB` or `[r,g,b]` in 0..1. */
  primary?: JimboBackgroundColor;
  secondary?: JimboBackgroundColor;
  dark?: JimboBackgroundColor;
  /** Animation speed multiplier on top of the base SPIN_SPEED. Default 1. */
  speed?: number;
  /** Twirl rotation seed (default -2). */
  spinRotation?: number;
  /** How much the twirl warps the field, 0..1ish (default 0.35). */
  spinAmount?: number;
  /** Pixelation. Higher = finer pixels (default ~244 = 740*0.33). */
  pixelFilter?: number;
  /** Contrast multiplier (default 4.5). */
  contrast?: number;
  /** Bright lighting amount (default 0.5). */
  lighting?: number;
  /** Color transition duration in ms when palette changes. Default 800. */
  transitionMs?: number;
}

export interface JimboBackgroundProps extends JimboBackgroundConfig {
  className?: string;
  style?: CSSProperties;
}

type Rgb = [number, number, number];

const BALATRO_DEFAULTS = {
  primary: [1.0, 0.2, 0.2] as Rgb, // red
  secondary: [0.0, 0.5, 1.0] as Rgb, // blue
  dark: [0.05, 0.08, 0.1] as Rgb, // near-black
  speed: 1.0,
  spinRotation: -2.0,
  spinAmount: 0.35,
  pixelFilter: 740.0 * 0.33,
  contrast: 4.5,
  lighting: 0.5,
  transitionMs: 800,
};

function parseColor(c: JimboBackgroundColor | undefined, fallback: Rgb): Rgb {
  if (!c) return fallback;
  if (Array.isArray(c)) return [c[0], c[1], c[2]];
  let hex = c.trim().replace(/^#/, '');
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((ch) => ch + ch)
      .join('');
  if (hex.length !== 6) return fallback;
  const n = parseInt(hex, 16);
  if (Number.isNaN(n)) return fallback;
  return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

const vsSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision mediump float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_spinRotation;
  uniform float u_spinSpeed;
  uniform float u_spinAmount;
  uniform float u_pixelFilter;
  uniform float u_contrast;
  uniform float u_lighting;

  void main() {
    vec2 screenSize = u_resolution;
    float pixel_size = length(screenSize.xy) / max(1.0, u_pixelFilter);
    vec2 uv = (floor(gl_FragCoord.xy*(1.0/pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy);
    float uv_len = length(uv);

    float speed = (u_spinRotation * 0.2) + 302.2;
    float new_pixel_angle = atan(uv.y, uv.x) + speed - 20.0*(u_spinAmount*uv_len + (1.0 - u_spinAmount));

    vec2 mid = (screenSize.xy/length(screenSize.xy))/2.0;
    uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

    uv *= 30.0;
    speed = u_time * u_spinSpeed;
    vec2 uv2 = vec2(uv.x, uv.y);

    for(int i=0; i < 5; i++) {
      uv2 += sin(max(uv.x, uv.y)) + uv;
      uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121), sin(uv2.x - 0.113*speed));
      uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
    }

    float contrast_mod = (0.25*u_contrast + 0.5*u_spinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv)*(0.035)*contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod*abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod*abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (u_lighting - 0.2)*max(c1p*5.0 - 4.0, 0.0) + u_lighting*max(c2p*5.0 - 4.0, 0.0);

    vec3 base = (0.3/u_contrast)*u_color1 + (1.0 - 0.3/u_contrast)*(u_color1*c1p + u_color2*c2p + c3p*u_color3) + vec3(light);
    gl_FragColor = vec4(base, 1.0);
  }
`;

/**
 * Hook for the Balatro swirl background: WebGL context, shader, animation loop.
 * Palette and scalar uniforms ease toward new values over `transitionMs`.
 */
export function useBalatroBackground(config: JimboBackgroundConfig = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef(config);
  useLayoutEffect(() => {
    configRef.current = config;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[JimboBackground] shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[JimboBackground] program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const u_time = u('u_time');
    const u_resolution = u('u_resolution');
    const u_color1 = u('u_color1');
    const u_color2 = u('u_color2');
    const u_color3 = u('u_color3');
    const u_spinRotation = u('u_spinRotation');
    const u_spinSpeed = u('u_spinSpeed');
    const u_spinAmount = u('u_spinAmount');
    const u_pixelFilter = u('u_pixelFilter');
    const u_contrast = u('u_contrast');
    const u_lighting = u('u_lighting');

    const resolveScalars = (cfg: JimboBackgroundConfig) => ({
      spinRotation: cfg.spinRotation ?? BALATRO_DEFAULTS.spinRotation,
      spinSpeed: 4.5 * (cfg.speed ?? BALATRO_DEFAULTS.speed),
      spinAmount: cfg.spinAmount ?? BALATRO_DEFAULTS.spinAmount,
      pixelFilter: cfg.pixelFilter ?? BALATRO_DEFAULTS.pixelFilter,
      contrast: cfg.contrast ?? BALATRO_DEFAULTS.contrast,
      lighting: cfg.lighting ?? BALATRO_DEFAULTS.lighting,
    });

    const boot = configRef.current;
    const current: Rgb[] = [
      parseColor(boot.primary, BALATRO_DEFAULTS.primary),
      parseColor(boot.secondary, BALATRO_DEFAULTS.secondary),
      parseColor(boot.dark, BALATRO_DEFAULTS.dark),
    ];
    const currentScalars = resolveScalars(boot);
    const startTime = performance.now();
    let lastFrame = startTime;
    let animationFrameId = 0;

    const render = () => {
      const now = performance.now();
      const dt = Math.max(0, now - lastFrame);
      lastFrame = now;

      const cfg = configRef.current;
      const target: Rgb[] = [
        parseColor(cfg.primary, BALATRO_DEFAULTS.primary),
        parseColor(cfg.secondary, BALATRO_DEFAULTS.secondary),
        parseColor(cfg.dark, BALATRO_DEFAULTS.dark),
      ];
      const targetScalars = resolveScalars(cfg);
      const transitionMs = Math.max(1, cfg.transitionMs ?? BALATRO_DEFAULTS.transitionMs);
      const alpha = 1 - Math.exp(-dt / transitionMs);
      for (let i = 0; i < 3; i++) {
        for (let c = 0; c < 3; c++) {
          current[i]![c]! += (target[i]![c]! - current[i]![c]!) * alpha;
        }
      }
      for (const key of Object.keys(currentScalars) as (keyof typeof currentScalars)[]) {
        currentScalars[key] += (targetScalars[key] - currentScalars[key]) * alpha;
      }

      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }

      const [c1, c2, c3] = current as [Rgb, Rgb, Rgb];
      gl.uniform1f(u_time, (now - startTime) / 1000.0);
      gl.uniform2f(u_resolution, canvas.width, canvas.height);
      gl.uniform3f(u_color1, c1[0], c1[1], c1[2]);
      gl.uniform3f(u_color2, c2[0], c2[1], c2[2]);
      gl.uniform3f(u_color3, c3[0], c3[1], c3[2]);
      gl.uniform1f(u_spinRotation, currentScalars.spinRotation);
      gl.uniform1f(u_spinSpeed, currentScalars.spinSpeed);
      gl.uniform1f(u_spinAmount, currentScalars.spinAmount);
      gl.uniform1f(u_pixelFilter, currentScalars.pixelFilter);
      gl.uniform1f(u_contrast, currentScalars.contrast);
      gl.uniform1f(u_lighting, currentScalars.lighting);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return canvasRef;
}

/** Fullscreen WebGL swirl background, fixed behind the page. */
export function JimboBackground({ className, style, ...config }: JimboBackgroundProps = {}) {
  const canvasRef = useBalatroBackground(config);
  return <canvas ref={canvasRef} className={cx('j-background-canvas', className)} style={style} aria-hidden />;
}
