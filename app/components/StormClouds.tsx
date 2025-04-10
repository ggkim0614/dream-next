import React from 'react';

interface StormCloudsProps {
	flowSpeed?: number;
	borderRadius?: string;
	width?: number;
	height?: number;
}

function StormClouds({
	flowSpeed = 0.2,
	borderRadius = '0px',
	width = 200,
	height = 200,
}: StormCloudsProps) {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext('webgl');
		if (!gl) {
			console.warn('WebGL not supported');
			return;
		}

		canvas.width = width;
		canvas.height = height;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		gl.viewport(0, 0, canvas.width, canvas.height);

		// Vertex Shader
		const vertexShaderSource = `
            attribute vec4 a_position;
            void main() {
                gl_Position = a_position;
            }
        `;
		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexShaderSource);
		gl.compileShader(vertexShader);

		// Fragment Shader - Updated for left-to-right motion
		const fragmentShaderSource = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform float u_speed;

            float random(vec2 _st) {
                return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            float noise(vec2 _st) {
                vec2 i = floor(_st);
                vec2 f = fract(_st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            #define NUM_OCTAVES 8
            float fbm(vec2 _st) {
                float v = 0.0;
                float a = 0.7;
                vec2 shift = vec2(200.0);
                mat2 rot = mat2(cos(0.7), sin(0.7), -sin(0.7), cos(0.70));
                for (int i = 0; i < NUM_OCTAVES; ++i) {
                    v += a * noise(_st);
                    _st = rot * _st * 2.5 + shift;
                    a *= 0.5;
                }
                return v;
            }

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy * 4.0;
                // Diagonal movement (top-left to bottom-right)
                st.x += u_time * u_speed * 2.0;
                st.y += u_time * u_speed * 1.5;

                vec3 color = vec3(0.0);
                vec2 q = vec2(0.);
                q.x = fbm(st + vec2(0.3 * u_time, 0.0));
                q.y = fbm(st + vec2(1.0));
                vec2 r = vec2(0.);
                r.x = fbm(st + 1.2 * q + vec2(2.0 + 0.3 * u_time, 10.2));
                r.y = fbm(st + 1.2 * q + vec2(9.3, 3.8) + 0.3 * u_time);
                float f = fbm(st + r);

                color = mix(
                    vec3(0.2,0.1,0.3),
                    vec3(0.4,0.2,0.5),
                    clamp((f*f + 0.6*f) * 5.0, 0.0, 1.0)
                );
                color = mix(
                    color,
                    vec3(0.1,0.05,0.2),
                    clamp(length(q),0.0,1.0)
                );
                color = mix(
                    color,
                    vec3(0.6,0.3,0.7),
                    clamp(length(r.x),0.0,1.0)
                );
                
                gl_FragColor = vec4((f*f*f + 0.9*f*f + 0.4*f) * color, 1.);
            }`;

		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentShaderSource);
		gl.compileShader(fragmentShader);

		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		gl.useProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Shader program error:', gl.getProgramInfoLog(program));
			return;
		}

		const positions = new Float32Array([
			-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
		]);
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

		const positionLocation = gl.getAttribLocation(program, 'a_position');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

		const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
		const timeLocation = gl.getUniformLocation(program, 'u_time');
		const speedLocation = gl.getUniformLocation(program, 'u_speed');

		let startTime = Date.now();
		let animationFrameId: number | null = null;

		const render = () => {
			const time = (Date.now() - startTime) * 0.001;
			gl.uniform1f(timeLocation, time);
			gl.uniform1f(speedLocation, flowSpeed);
			gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
			animationFrameId = window.requestAnimationFrame(render);
		};

		render();

		return () => {
			if (animationFrameId) {
				window.cancelAnimationFrame(animationFrameId);
			}
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			gl.deleteBuffer(positionBuffer);
		};
	}, [flowSpeed, width, height]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: `${width}px`,
				height: `${height}px`,
				borderRadius,
				display: 'block',
			}}
		/>
	);
}

export default StormClouds;
