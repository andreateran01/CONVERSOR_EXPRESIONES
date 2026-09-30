const inputExpresion = document.getElementById("expresion");
const btnCalcular = document.getElementById("btnCalcular");
const btnLimpiar = document.getElementById("btnLimpiar");
const contenedorResultado = document.getElementById("resultado");

const obtenerTokens = (expresion) => {
    const expresionLimpia = expresion.replace(/\s+/g, "");

    if (!expresionLimpia) {
        return {
            valido: false,
            mensaje: "Debes ingresar una expresion."
        };
    }

    if (!/^[a-zA-Z0-9+\-*/^()]+$/.test(expresionLimpia)) {
        return {
            valido: false,
            mensaje:
                "La expresion contiene caracteres no validos. " +
                "Solo se permiten letras, numeros, operadores (+, -, *, /, ^) y parentesis."
        };
    }

    const tokens = expresionLimpia.match(
        /[a-zA-Z]+|\d+(?:\.\d+)?|[+\-*/^()]/g
    );

    if (!tokens || tokens.join("") !== expresionLimpia) {
        return {
            valido: false,
            mensaje: "No se pudo reconocer correctamente la expresion."
        };
    }

    return {
        valido: true,
        tokens: tokens
    };
};

const validarExpresion = (tokens) => {
    let parentesis = 0;
    let esperaOperando = true;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const esOperando =
            /^[a-zA-Z]+$/.test(token) ||
            /^\d+(?:\.\d+)?$/.test(token);
        const esOperador = /^[+\-*/^]$/.test(token);

        if (esOperando) {
            if (!esperaOperando) {
                return {
                    valido: false,
                    mensaje: `Error: hay dos operandos seguidos cerca de "${token}".`
                };
            }
            esperaOperando = false;
        } else if (esOperador) {
            if (esperaOperando) {
                return {
                    valido: false,
                    mensaje: `Error: el operador "${token}" esta en una posicion incorrecta.`
                };
            }
            esperaOperando = true;
        } else if (token === "(") {
            parentesis++;
            if (!esperaOperando) {
                return {
                    valido: false,
                    mensaje: "Error: falta un operador antes del parentesis de apertura."
                };
            }
        } else if (token === ")") {
            parentesis--;
            if (parentesis < 0) {
                return {
                    valido: false,
                    mensaje: "Error: hay un parentesis de cierre sin su correspondiente apertura."
                };
            }
            if (esperaOperando) {
                return {
                    valido: false,
                    mensaje: "Error: el parentesis de cierre esta en una posicion incorrecta."
                };
            }
        }
    }

    if (parentesis !== 0) {
        return {
            valido: false,
            mensaje: "Error: los parentesis no estan correctamente balanceados."
        };
    }

    if (esperaOperando) {
        return {
            valido: false,
            mensaje: "Error: la expresion no puede terminar con un operador."
        };
    }

    return {
        valido: true
    };
};

const prioridad = (operador) => {
    if (operador === "+" || operador === "-") return 1;
    if (operador === "*" || operador === "/") return 2;
    if (operador === "^") return 3;
    return 0;
};

const infijaAPostfija = (tokens) => {
    const salida = [];
    const pila = [];

    for (let token of tokens) {
        const esOperando =
            /^[a-zA-Z]+$/.test(token) ||
            /^\d+(?:\.\d+)?$/.test(token);

        if (esOperando) {
            salida.push(token);
        } else if (token === "(") {
            pila.push(token);
        } else if (token === ")") {
            while (
                pila.length > 0 &&
                pila[pila.length - 1] !== "("
            ) {
                salida.push(pila.pop());
            }
            pila.pop();
        } else {
            while (
                pila.length > 0 &&
                pila[pila.length - 1] !== "(" &&
                prioridad(pila[pila.length - 1]) >= prioridad(token)
            ) {
                salida.push(pila.pop());
            }
            pila.push(token);
        }
    }

    while (pila.length > 0) {
        salida.push(pila.pop());
    }

    return salida;
};

const infijaAPrefija = (tokens) => {
    const invertidos = [...tokens].reverse();

    for (let i = 0; i < invertidos.length; i++) {
        if (invertidos[i] === "(") {
            invertidos[i] = ")";
        } else if (invertidos[i] === ")") {
            invertidos[i] = "(";
        }
    }

    const postfija = infijaAPostfija(invertidos);
    return postfija.reverse();
};

/* =============================================================
   CAMBIOS DE COLOR APLICADOS EN MOSTRARRESULTADOS Y MOSTRARERROR
   ============================================================= */

const mostrarResultados = (
    expresionInfija,
    expresionPrefija,
    expresionPostfija
) => {
    // Clases Bootstrap modificables para personalización rápida:
    const colorEncabezado = "bg-dark text-white";  // Ejemplo: Fondo oscuro (antes: bg-success)
    const colorInfija = "alert-secondary";        // Ejemplo: Gris (antes: alert-primary)
    const colorPrefija = "alert-purple text-purple-800"; // Puedes usar tus propias clases CSS o clases Bootstrap
    const colorPostfija = "alert-success";        // Ejemplo: Verde (antes: alert-info)

    const contenido = `
        <div class="col-12 col-md-8">
            <div class="card shadow-sm mb-4">
                <div class="card-header ${colorEncabezado} text-center fw-bold">
                    Resultado de la conversión
                </div>

                <div class="card-body">
                    <!-- INFIJA -->
                    <div class="mb-4">
                        <label class="form-label fw-bold">
                            Notación Infija
                        </label>
                        <div class="alert ${colorInfija} mb-0">
                            ${expresionInfija}
                        </div>
                    </div>

                    <!-- PREFIJA -->
                    <div class="mb-4">
                        <label class="form-label fw-bold">
                            Notación Prefija
                        </label>
                        <div class="alert alert-primary mb-0">
                            ${expresionPrefija}
                        </div>
                    </div>

                    <!-- POSTFIJA -->
                    <div>
                        <label class="form-label fw-bold">
                            Notación Postfija
                        </label>
                        <div class="alert alert-dark mb-0">
                            ${expresionPostfija}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    contenedorResultado.innerHTML = contenido;
};

const mostrarError = (mensaje) => {
    // Se puede cambiar la alerta de error cambiando alert-danger o usando estilos inline/custom
    const contenido = `
        <div class="col-12 col-md-8">
            <div class="alert alert-warning text-dark text-center fw-bold shadow-sm">
                ${mensaje}
            </div>
        </div>
    `;

    contenedorResultado.innerHTML = contenido;
};

const convertirExpresion = () => {
    const expresion = inputExpresion.value.trim();

    const resultadoTokens = obtenerTokens(expresion);

    if (!resultadoTokens.valido) {
        mostrarError(resultadoTokens.mensaje);
        return;
    }

    const tokens = resultadoTokens.tokens;
    const validacion = validarExpresion(tokens);

    if (!validacion.valido) {
        mostrarError(validacion.mensaje);
        return;
    }

    const postfija = infijaAPostfija(tokens);
    const prefija = infijaAPrefija(tokens);

    mostrarResultados(
        expresion,
        prefija.join(" "),
        postfija.join(" ")
    );
};

const limpiarContenido = () => {
    inputExpresion.value = "";
    contenedorResultado.innerHTML = "";
    inputExpresion.focus();
};

btnCalcular.addEventListener("click", () => {
    convertirExpresion();
});

btnLimpiar.addEventListener("click", () => {
    limpiarContenido();
});

inputExpresion.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        convertirExpresion();
    }
});