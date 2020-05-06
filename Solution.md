# Solucion planteada

En este apartado voy a describir brevemente los pasos seguidos para llegar a la solucion planteada. Tambien ire haciendo referencia a las funciones en el codigo que implemente para ello.

- [Consideraciones a saber](#Consideraciones-a-saber)
    - [Codigo Morse](#Codigo-Morse)
    - [Timing](#Timing)
- [Recibiendo bits](#Recibiendo-bits)

## Consideraciones a saber

### Codigo Morse

Para llevar de forma amena este documento es necesario tener presente las reglas sobre el espacio y la longitud de las señales segun dicta la [especificacion del codigo morse](https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.1677-1-200910-I!!PDF-E.pdf) de la Union Internacional de Telecomunicaciones (ITU por sus siglas en ingles) en la **seccion 2**.

Las mismas, traduciendolas, dicen:

> Un *dash* es igual a **tres** *dots*  
El espacio entre las senales que forman una misma letra es igual a **un** *dot*  
El espacio entre dos letras que forman la misma palabra es igual a **tres** *dots*  
El espacio entre dos palabras es igual a **siete** *dots*

El codigo morse se apoya unicamente en dos tipos de senales:

Un **dot** es la senal de longitud mas corta. Estara representada por un punto `.`

Un **dash** es la senal de longitud mas larga. Estara representada por un guion `-`

El codigo morse se "mide" en unidades de tiempo, sabiendo esto y las reglas anteriores podemos armar la siguiente representacion en bits:

- dot: `1`
- dash: `111`
- espacio entre senales: `0`
- espacio entre letras: `000`
- espacio entre palabras: `0000000`

### Timing

Segun el enunciado del [problema](https://github.com/Lzok/telegraph/blob/master/Problem.md), el timing del operador puede no ser perfecto, lo cual es bastante logico porque se trata de un ser humano. Sin embargo, se considera que al tratarse de un estandar internacional, el operador a pesar de no tener un timing perfecto guardara alguna relacion cercana a la regla.

Sabiendo esto, vamos a tener dos tipos de posibles payloads:

- Timing **perfecto**
- Timing **imperfecto**

## Recibiendo bits

Supongamos que recibimos la siguiente cadena de bits:

```javascript
"0000000011011011001110000011111100011111100111111000000011101111111101110
1110000000110001111110000011111100111111000000011000011011111111011101110
0000011011100000000000"
```

Los bits '1' son pulsos, mientras que los bits '0' son pausas.

1. Lo primero que hago es separar los pulsos y transformar el payload de un string a un array de strings en donde tengamos separados los pulsos de las pausas. [funcion](https://github.com/Lzok/telegraph/blob/master/src/api/utils/convertion.js#L232)

    Quedando asi:

```javascript
[
  '00000000','11','0','11','0','11','00','111','00000',
  '111111','000','111111','00','111111','0000000','111','0',
  '11111111','0','111','0','111','0000000','11','000','111111',
  '00000','111111','00','111111','0000000','11','0000','11','0',
  '11111111','0','111','0','111','000000','11','0','111','00000000000'
]
```

2.  Las pausas al inicio y al final las descarto porque no me sirven para el procesamiento que hago despues. [funcion](https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/api/utils/convertion.js#L152)

Entonces el payload para trabajar me queda:

```javascript
[
  '11','0','11','0','11','00','111','00000',
  '111111','000','111111','00','111111','0000000','111','0',
  '11111111','0','111','0','111','0000000','11','000','111111',
  '00000','111111','00','111111','0000000','11','0000','11','0',
  '11111111','0','111','0','111','000000','11','0','111'
]
```

3. En el tercer paso hago varias cosas para obtener informacion acerca del payload. [funcion](https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/api/utils/convertion.js#L100)

El objetivo de obtener esta informacion para mi es para luego armarme una `config` dependiendo si el mensaje tiene un timing perfecto o imperfecto, con algunos parametros que me van a permitir reconstruir el mensaje.

3.1. Lo primero que hago es separar los pulsos de las pausas en dos arrays distintos. [funcion](https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/api/utils/convertion.js#L22)

De ese modo, el resultado del payload anterior seria:

```javascript
zeros = [
  '0','0','00','00000','000','00','0000000','0',
  '0','0','0000000','000','00000','00','0000000',
  '0000','0','0','0','000000','0'
];

ones = [
  '11','11','11','111','111111','111111','111111','111','11111111',
  '111','111','11','111111','111111', '111111','11','11',
  '11111111','111','111','11','111'
];
```

3.2. Lo siguiente que hago es chequear si el timing de este payload es perfecto o no. [funcion](https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/api/utils/convertion.js#L40)

Para ello lo que hago es calcular la configuracion del timing perfecto en en base al **dot** de este payload, *el cual calculo en la primer linea de la funcion*.

La configuracion de este payload en base a su unidad de tiempo mas pequena seria:

- dot: `11`
- dash: `111111` (3 * dot)
- espacio entre senales: `00`
- espacio entre letras: `000000`
- espacio entre palabras: `00000000000000` (7 * dot)

Con esta configuracion, me fijo que el array de pausas `zeros` cumpla con el tamanio de todos sus pulsos con alguna de las configuraciones (dos, seis o catorce ceros). Lo mismo con el array de pulsos pero estos solamente deben ser de dos o seis.

En este payload se da que ninguno de los dos cumple sus condiciones, se puede ver el array de pausas que tiene algunas de un solo cero (0), siete ceros, cuatro ceros, etc.

El array de pulsos tiene pulsos de tres y ocho, que son los disruptivos.

En conclusion, **es un timing imperfecto.** Este resultado lo usaremos luego para calcular los valores de configuracion.

3.3. Lo siguiente es obtener el valor **minimo** y **maximo** de los pulsos/pausas de ambos arrays. [funcion](https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/api/utils/convertion.js#L13) *esta funcion deberia tener un nombre mas representativo*

Para el payload nos da como resultado:

- Valor minimo de pulsos: 2
- Valor maximo de pulsos: 8
- Valor minimo de pausas: 1
- Valor maximo de pausas: 7

3.4. Obtengo el promedio de ambos arrays (por separado) [funcion](https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/api/utils/convertion.js#L18)

4. Con la informacion obtenida del punto 3, ahora utilizo una funcion para obtener la configuracion que voy a usar en este payload. [<funcion>](https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/api/utils/convertion.js#L159)

Si el timing es perfecto, no hay mas que hacer, ya sabemos que configuracion se va a utilizar porque ya la calculamos en el paso anterior.

Pero esi el timing es imperfecto, debemos hacer algunos ajustes ***tentativos*** (vease el enfasis en la palabra).

Los ajustes que hace la funcion son los siguientes:

- Toma como separador de palabras el valor del **dot** * 7 - 2
Por que la resta menos 2? Porque estamos hablando de un payload con un timing que es imperfecto, con restarle 2 le doy un umbral de fallo a la separacion entre palabras. De todos modos esto sigue siendo algo arbitrario, es un valor que me funciono. En el codigo mismo hay un recordatorio para mejorar esto con matematica.

```javascript
// Extracto del codigo
// Just some arbitrary "threshold". TODO enhance this with math.
const wordSepLen = minoneLen * 7 - 2;
```

- Toma como separador entre caracteres un promedio entre la minima y la maxima ocurrencia de pausas que calculamos en el punto anterior. Con esto intento estimar el limite que define si una pausa significa que se esta separando un caracter o si es una pausa que delimita simplemente el fin de una marca morse.

```javascript
// Extracto del codigo
// Estimated value to limit intra sep and char sep
const charsepLen = Math.round((minzeroLen + maxzeroLen) / 2);

/*
  El hecho de redondear los valores podria ser tanto beneficioso
  como perjudicial dependiendo que tan imperfecto sea el payload.
  Se tiene en consideracion que a pesar de ser imperfecto guarda 
  alguna minima relacion con la regla del estandar. De este modo
  deberia ser beneficioso en la mayoria de los casos.
*/
```

- Toma como limite entre un dot y un dash haciendo un promedio entre la minima y la maxima ocurrencia de pausas que calculamos en el punto anterior. Excepto la division por 3, las demas consideraciones comentadas en el punto anterior son validas aca tambien.

5. Lo ultimo que hice, con toda la informacion anteriormente obtenida es iterar sobre los pulsos que obtuve en le punto **2**, y en cada iteracion usar una 
que me retorne que caracter morse es el correspondiente. [funcion](https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/api/utils/convertion.js#L133)

Esta funcion simplemente mira si es un pulso o una pausa, y en base a la configuracion que obtuve en el punto **4**, me devuelve que tipo de marca morse es (dot, dash o alguna de las separaciones).

5.1. Para convertir el morse a *humano*, use un objeto de javascript mapeando los caracteres morse con el alfabeto. [<objeto>]([https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/constants/morse.js#L8](https://github.com/Lzok/telegraph/blob/093583cc124d7f233cfb88b94d2056524d18a1c5/src/constants/morse.js#L8))
Tambien use como alternativa el arbol morse aplicando *dichotomic search* [este metodo](https://github.com/Lzok/telegraph/blob/master/src/api/utils/convertion.js#L332)

El mismo resultado puede ser obtenido utilizando un array conformado de la siguiente forma:

`[' ', 'ET', 'IANM', 'SURWDKGO', 'HVF L PJBXCYZQ ', '54 3 2 16 7 8 90']`

Aunque siendo honesto, esta manera no es tan elegante. Este array se conforma a partir de mirar el arbol de la representacion morse y agrupar en cada posicion del array los caracteres de los nodos que estan al mismo nivel. En la siguiente imagen se puede ver esto dentro de los rectanculos rojos:

![](https://i.imgur.com/Pcn53GP.png)
