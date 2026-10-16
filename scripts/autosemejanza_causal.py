#!/usr/bin/env python3
"""Acoplamiento causal (por intervención) en el modelo de 4 nodos de
autosemejanza_4nodos.py.

C_causal(fuente -> destino | condición) = I(X_fuente ; X'_destino | X_condición)
calculada con TODOS los estados actuales equiprobables (intervención máxima
entropía, información causal de Ay y Polani) y la dinámica real P. Se mide en
dos escalas:
  micro: entre los dos nodos de un mismo módulo (1<->2, 3<->4).
  macro: entre los dos módulos ({1,2} <-> {3,4}).
Autosemejanza causal candidata: A' = I_min * min(C_micro, C_macro), es decir,
el acoplamiento causal tiene que existir en las dos escalas.

    python3 scripts/autosemejanza_causal.py
"""
import importlib.util, pathlib
import numpy as np

_spec = importlib.util.spec_from_file_location(
    "a4", pathlib.Path(__file__).with_name("autosemejanza_4nodos.py"))
a4 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(a4)
states = a4.states  # fila i = (x1, x2, x3, x4)


def H(p):
    p = p[p > 1e-15]
    return float(-(p * np.log2(p)).sum())


def cond_mi(P, src, tgt, cnd):
    """I(X_src ; X'_tgt | X_cnd) con X uniforme. src, tgt, cnd: listas de nodos (0-3)."""
    def key(bits, idx):
        return sum(int(bits[v]) << k for k, v in enumerate(idx))
    joint = {}
    for i, x in enumerate(states):
        for j, xp in enumerate(states):
            k = (key(x, src), key(x, cnd), key(xp, tgt))
            joint[k] = joint.get(k, 0.0) + P[i, j] / 16.0
    def marg(sel):
        m = {}
        for k, v in joint.items():
            kk = tuple(k[q] for q in sel); m[kk] = m.get(kk, 0.0) + v
        return np.array(list(m.values()))
    return H(marg((0, 1))) + H(marg((2, 1))) - H(marg((0, 1, 2))) - H(marg((1,)))


def c_micro(P):
    v = [cond_mi(P, [0], [1], [1]), cond_mi(P, [1], [0], [0]),
         cond_mi(P, [2], [3], [3]), cond_mi(P, [3], [2], [2])]
    return float(np.mean(v))


def c_macro(P):
    return 0.5 * (cond_mi(P, [2, 3], [0, 1], [0, 1]) + cond_mi(P, [0, 1], [2, 3], [2, 3]))


def imin(P):
    pi = a4_stat(P); J = pi[:, None] * P
    return min(cut(J, pi, m) for m in range(1, 15) if m & 8)


def a4_stat(P):
    vals, vecs = np.linalg.eig(P.T)
    pi = np.real(vecs[:, np.argmin(np.abs(vals - 1))]); return pi / pi.sum()


def cut(J, pi, m):
    S = 16; X = np.arange(S)[:, None]; XP = np.arange(S)[None, :]; lq = np.zeros_like(J)
    for mm in (m, (S - 1) ^ m):
        idx = ((X & mm) * S + (XP & mm)).ravel()
        Jm = np.bincount(idx, weights=J.ravel(), minlength=S * S).reshape(S, S); pm = Jm.sum(1)
        q = np.where(pm[:, None] > 0, Jm / np.where(pm[:, None] > 0, pm[:, None], 1), 0)[(X & mm), (XP & mm)]
        lq += np.log2(np.where(q > 0, q, 1))
    return float((J * (np.log2(np.where(J > 0, J / pi[:, None], 1)) - lq)).sum())


def line(name, P):
    im, cmi, cma = imin(P), c_micro(P), c_macro(P)
    print(f"{name:32s} I_min={im:.4f}  C_micro={cmi:.4f}  C_macro={cma:.4f}  A'={im*min(cmi,cma):.3e}")


if __name__ == "__main__":
    print("== Sistemas originales ==")
    for m in ["Mandelbrot", "Hormiguero", "Cerebro"]:
        line(m, a4.build_matrix(m))
    print("== Hormiguero: variando el acoplamiento eps ==")
    for e in (0.05, 0.2, 0.5, 0.8):
        line(f"Hormiguero eps={e}", a4.build_custom(a4.horm(e)))
    print("== Cerebro: variando beta ==")
    for b in (0.1, 0.3, 0.5, 0.8, 0.95):
        line(f"Cerebro beta={b}", a4.build_custom(a4.cer(b)))
    print("== Controles ==")
    ring = lambda g: (lambda x: [(1-g)*0.5+g*(0.95*x[(v+1) % 4]+0.05*(1-x[(v+1) % 4])) for v in range(4)])
    for g in (0.5, 0.95):
        line(f"Anillo (sin módulos) g={g}", a4.build_custom(ring(g)))
    def solo_macro(x, beta=0.5, gamma=0.05):
        x1, x2, x3, x4 = x; M1, M2 = max(x1, x2), max(x3, x4)
        return [(1-gamma)*(beta*(1-M2)+(1-beta)*0.5)+gamma/2]*2 + [(1-gamma)*(beta*M1+(1-beta)*0.5)+gamma/2]*2
    line("Cerebro sin bucle micro", a4.build_custom(solo_macro))
