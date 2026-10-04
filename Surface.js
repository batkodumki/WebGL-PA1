'use strict';

const PARABOLA_A     = 0.3;
const PARABOLA_ALPHA = deg2rad(30);
const PARABOLA_RHO0  = 0.5;
const PARABOLA_Z0    = -0.5;
const T_MIN = -1.5, T_MAX = 1.5;
const U_LINES = 36;
const V_LINES = 30;
const U_POINTS = 40;
const V_POINTS = 72;

function surfacePoint(t, phi) {
    const c = Math.cos(PARABOLA_ALPHA), s = Math.sin(PARABOLA_ALPHA);
    const rho = PARABOLA_RHO0 + t * c - PARABOLA_A * t * t * s;
    const z   = PARABOLA_Z0   + t * s + PARABOLA_A * t * t * c;
    return [rho * Math.cos(phi), rho * Math.sin(phi), z];
}

function Model(name) {
    this.name = name;

    this.U = { vertices: [], lines: 0, points: 0, buffer: gl.createBuffer() };
    this.V = { vertices: [], lines: 0, points: 0, buffer: gl.createBuffer() };

    this.CreateSurfaceData = function () {
        const U = this.U, V = this.V;
        U.vertices = []; V.vertices = [];
        U.lines = U_LINES; U.points = U_POINTS;
        V.lines = V_LINES; V.points = V_POINTS;

        for (let i = 0; i < U.lines; i++) {
            const phi = 2 * Math.PI * i / U.lines;
            for (let j = 0; j < U.points; j++) {
                const t = T_MIN + (T_MAX - T_MIN) * j / (U.points - 1);
                U.vertices.push(...surfacePoint(t, phi));
            }
        }

        for (let i = 0; i < V.lines; i++) {
            const t = T_MIN + (T_MAX - T_MIN) * i / (V.lines - 1);
            for (let j = 0; j < V.points; j++) {
                const phi = 2 * Math.PI * j / (V.points - 1);
                V.vertices.push(...surfacePoint(t, phi));
            }
        }
    };

    this.BufferData = function () {
        for (const set of [this.U, this.V]) {
            gl.bindBuffer(gl.ARRAY_BUFFER, set.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(set.vertices), gl.STATIC_DRAW);
        }
    };

    this.DrawSet = function (set, color) {
        gl.uniform4fv(shProgram.iColor, color);
        gl.bindBuffer(gl.ARRAY_BUFFER, set.buffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);
        for (let i = 0; i < set.lines; i++) {
            gl.drawArrays(gl.LINE_STRIP, i * set.points, set.points);
        }
    };

    this.Draw = function () {
        this.DrawSet(this.U, [1, 1, 0, 1]);
        this.DrawSet(this.V, [0, 1, 1, 1]);
    };
}