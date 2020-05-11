# Solucion con K-Means (Experimental)

En este apartado voy a describir el paso a paso de la solucion al problema del timing imperfecto pero esta vez aplicando un
algoritmo de clusterizacion llamado **K-Means**, adaptado a este problema en particular para acotar su campo de accion.

**NOTA: Esta solucion es experimental, no se han abarcado una cantidad de casos de uso ni pruebas como para considerarla estable.**
**Tomar los recaudos y consideraciones necesarias para hacer sus pruebas teniendo esto en cuenta.**

**Todo aporte a estabilizarla es bienvenido!**

- [Consideraciones a saber](#Consideraciones-a-saber)
  - [Solucion original](#Solucion-original)
  - [K Means](#K-Means)
- [Recibiendo bits](#Recibiendo-bits)
- [TODO](#TODO)

## Consideraciones a saber

### Solucion original

Se deben tener en cuenta las mismas consideraciones generales que en la solucion original. Se pueden ver las mismas [aca](https://github.com/Lzok/telegraph/blob/master/Solution.md#Consideraciones-a-saber)

### K Means

K-Means es un metodo de agrupamiento (clustering) con el objetivo de particionar un conjunto de **n** observaciones en **k** grupos. Cada observacion pertenece al grupo cuyo _valor medio_ es el mas cercano.

Aca hay un listado de recursos para entender K-Means y ver ejemplos de aplicacion del mismo. Para fines de este problema en particular, no es necesario que se detengan donde mencione Machine Learning ni Data Science.

- [Video explicativo del algoritmo](https://www.youtube.com/watch?v=_aWzGGNrcic)
- [K-Means Wikipedia](https://en.wikipedia.org/wiki/K-means_clustering)
- [Analytics Vidhya Blog](https://www.analyticsvidhya.com/blog/2019/08/comprehensive-guide-k-means-clustering/)
- [Apunte de Stanford](https://stanford.edu/~cpiech/cs221/handouts/kmeans.html)
- [Articulo en Medium](https://medium.com/@tarlanahad/a-friendly-introduction-to-k-means-clustering-algorithm-b31ff7df7ef1)

Respecto de las explicaciones en los recursos anteriores, **caben destacar algunas diferencias que fueron aplicadas a nuestro problema:**

- De forma arbitraria vamos a tener 3 clusters inicializados con el valor mas bajo, el mas alto y el promedio entre ambos.
- Al tratarse de una sola dimension (arrays), la [distancia euclidiana](https://en.wikipedia.org/wiki/Euclidean_distance#One_dimension) que vamos a usar es el valor absoluto entre el punto y el centroide (mean/cluster).
- No asigno un limite de iteraciones porque la convergencia solamente deberia ser suficiente para el caso de uso.
- En algunos puntos del proceso tuve que hacer ajustes manuales en los valores. Los mismos no tienen una justificacion "formal", fueron a prueba y error basados en los bits ingresados a modo de pruebas. Estos ajustes los voy a indicar mas adelante.
- Para no trabajar con valores decimales utilizo la funcion `Math.round` donde sea necesario para lidiar unicamente con valores enteros. Esto se debe a que el problema se basa en unidades de tiempo, y las mismas se presentan de forma entera. Es decir, no podemos tener una unidad y media de tiempo por ejemplo.

## Recibiendo bits

Supongamos que recibimos la siguiente cadena de bits:

```javascript
    0000000011011011001110000011111100011111100111111000000011101111111101110
    1110000000110001111110000011111100111111000000011000011011111111011101110
    0000011011100000000000
```

Los bits '1' son pulsos, mientras que los bits '0' son pausas.

1. Lo primero que hago es quitar los ceros al inicio y al final si los hubiera y transformar el payload de un string a un array de strings en donde tengamos separados los pulsos de las pausas.
El payload inicial luego de esto nos queda asi:


```javascript
[
  '11','0','11','0','11','00','111','00000',
  '111111','000','111111','00','111111','0000000','111','0',
  '11111111','0','111','0','111','0000000','11','000','111111',
  '00000','111111','00','111111','0000000','11','0000','11','0',
  '11111111','0','111','0','111','000000','11','0','111'
]
```


2. Luego calculo distancias. Es decir, calculo cuantas veces se repite el largo de cada pulso. El resultado que obtengo en base al payload presentado es:

```javascript
/*
    El objeto que retorna el metodo quiere decir la cantidad de pulsos
    que tienen un determinado largo (duracion).
    El objeto se compone de clave:valor en donde:
    clave = duracion del pulso
    valor = cantidad de pulsos con esa duracion.

    Entonces en el objeto retornado tenemos que hay nueve pulsos de duracion 1,
    diez pulsos de duracion 2, nueve pulsos de duracion 3, etc...
*/
{ '1': 9, '2': 10, '3': 9, '4': 1, '5': 2, '6': 7, '7': 3, '8': 2 }
```

Estas "distancias" nos van a servir para el setup de los clusters en el siguiente paso.

3. Con las distancias calculadas, puedo hacer uso de la funcion `setupKMeansClusters`. Como dije en las aclaraciones, para el espectro de este problema en particular, ya se que voy a tener tres clusters, por eso tengo el metodo de setup acotado y no acepto un parametro `k` como van a poder ver en muchas implementaciones en internet.

Los tres clusters vienen a partir de que el codigo morse define tres largos (duraciones): 1 (dot), 3 (dash), 7 (separacion de palabras).

3.1. Dentro del metodo `setupKMeansClusters`, primero voy a quedarme con las claves del objeto del punto dos porque las necesito luego y no quiero separarlas cada vez que las voy a usar. Quedando asi:

```javascript
// No siempre nos va a quedar de forma escalonada. Todo depende del payload de bits que ingrese.
const keys = [1, 2, 3, 4, 5, 6, 7, 8];
```

Si el largo de este array es 1 || 2, entonces ya tendriamos la informacion suficiente para calcular las unidades de tiempo. 


3.2. Como el array es mas grande que solamente uno o dos elementos, el siguiente paso es crear los tres clusters cada uno con su centroide (esto se aclaro las consideraciones).

```javascript
/*
    Cluster 1: Toma como centroide inicial el valor de la primer key del punto 3.1
    keys[0] => 1
*/
const c1 = { centroid: 1 };

/*
    Cluster 2: Toma como centroide inicial el promedio entre el primer y el ultimo valor
    de las keys anteriores:
    keys[0] => 1
    keys[keys.length - 1] => 8

    Como dije antes, para no trabajar con unidades decimales, uso Math.round.
    Si el numero es .5, el metodo round lo redondea para arriba.
    Math.round((8 + 1) / 2) => 5
*/
const c2 = { centroid: 5 };

/*
    Cluster 3: Toma como centroide inicial el valor del ultimo elemento de las keys
    keys[keys.length - 1] => 8
*/
const c3 = { centroid: 8 };

// Los devuelvo en forma de array por comodidad para las operaciones futuras

return [c1, c2, c3];
```

3.3. Con los clusters inicializados y la informacion de las distancias, ya puedo hacer la iteracion para que cada elemento quede proximo al cluster mas cercano.
Al igual que en la solucion original, al resultado de esto le llamo config.
La funcion encargada de ejecutar las iteraciones y devolver la configuracion es `getConfig(clusters, keys, distances)`.

Lo primero que hace fuera del loop es hacer una primer asignacion de los valores (keys) a los clusters mas cercanos con los centroides que ya asignamos en el punto anterior.
La asignacion es llevada adelante por el metodo `assignToCluster`. Este metodo calcula cual es el mejor cluster para cada valor a traves del metodo `calculateBestCluster`. Cuando se encuentra el mejor cluster para este valor, se le asignan valores por una cantidad total igual a las repeticiones de este valor en los bits iniciales (Punto 2).
Ejemplo: Encontramos el mejor cluster para el valor 1. Este valor se repite 9 veces `{ '1': 9, '2': 10, ... }`. Le asignamos nueve 1s a ese cluster, quedando asi:

```javascript
{
    centroid: 1,
    points: [ 1, 1, 1, 1, 1, 1, 1, 1, 1]
}
```

Este proceso es repetido para cada valor del array del punto 3.1. Una vez terminada esta primera asignacion, los clusters quedan:

```javascript
[
    {
    centroid: 1,
    points: [
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 3, 3, 3, 3, 3,
        3, 3, 3, 3
    ]
    },
    {
    centroid: 5,
    points: [
        4, 5, 5, 6, 6,
        6, 6, 6, 6, 6
    ]
    },
    { centroid: 8, points: [ 7, 7, 7, 8, 8 ] }
]
```

3.4. Luego de esta primer asignacion, se debe comenzar la iteracion del proceso hasta alcanzar la convergencia. Se dice que el algoritmo "ha convergido" cuando una iteracion arroja el mismo resultado que la anterior.
Asi que itero mientras que no haya convergencia aplicando las siguientes funciones en orden:
a. `recalculateCentroid` Para recalcular el centroide antes de hacer una re-asignacion a los clusters
b. `assignToCluster` La misma funcion vista en el punto 3.3
c. `checkIfConverge` Para ver si las ultimas dos iteraciones son iguales o no, esta es la condicion de corte de la iteracion.

a. `recalculateCentroid:`
Para calcular los nuevos centroides, se computa el promedio entre todos sus puntos asignados a el.
Luego del primer recalculo, los centroides de los tres clusters quedan asi:
```javascript
[
    { centroid: 2 },
    { centroid: 5.6 },
    { centroid: 7.4 }
]
```

b. `assignToCluster`
Luego de tener los centroides re-calculados, se procede a asignar de nuevo los valores a los clusters que mas cerca le queden. Si los centroides cambiaron su valor, tranquilamente los valores podrian ahora estar mas cercanos a otro cluster.
Luego de la re-asignacion, los clusters quedan:
```javascript
[
    {
        centroid: 2,
        points: [
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 3, 3, 3, 3, 3,
            3, 3, 3, 3
        ]
    },
    {
        centroid: 5.6,
        points: [
            4, 5, 5, 6, 6,
            6, 6, 6, 6, 6
        ]
    },
    { centroid: 7.4, points: [ 7, 7, 7, 8, 8 ] }
]
```

Se da el caso de que no hubo cambios de cluster en los puntos, entonces nuestra tercer funcion va a indicar esto, por lo que la iteracion terminara en este paso.

c. `checkIfConverge`
La funcion dara `true` debido a que las ultimas dos iteraciones (en realidad la primer asignacion + la primer iteracion) son iguales y no hubo cambios en los puntos respecto a los clusters que estan asignados.


3.5. Una vez que tengo los clusters con sus puntos asignados de forma definitiva, lo siguiente que hago es obtener las unidades de tiempo basadas en el centroide de cada uno de los clusters en el metodo `calculateTimeUnits`.
En este metodo aplico tanto el `Math.round` como uno de los ajustes de valor manuales.
Las unidades de tiempo son 3, la misma cantidad que los clusters. Estas se mapean con cada cluster en orden. Es decir, la unidad de tiempo [0] mapeara con el cluster[0] correspondiendo ambos al pulso de duracion 1. La unidad de tiempo [1] con el cluster [1] correspondiendo al pulso de duracion 3 y la unidad de tiempo [2] con el cluster [2] correspondiendo al pulso de duracion 7.

Aca la representacion del metodo `calculateTimeUnits`
```javascript
/*
    En el timeUnit[2] que se corresponde con el pulso de duracion 7, tuve que ajustar el valor
    para que luego los espacios en la traduccion del morse se respeten correctamente.
    Si no utilizo esta modificacion, hay espacios entre caracteres y palabras que se intepretan
    mal o se pasan por alto.
    El valor 1 no tiene un fundamento formal, es un valor que me funciono para los casos
    que lleve adelante en pruebas.
*/
const timeUnits = [
    Math.round(clusters[0].centroid),
    Math.round(clusters[1].centroid),
    Math.round(clusters[2].centroid + 1),
  ];
```

4. Con las unidades de tiempo calculadas, lo que hago en el siguiente paso es calcular los umbrales (thresholds) entre las duraciones 1-3 y 3-7. Estos umbrales son los que determinan hasta cuando un pulso deja de ser un *dot* para convertirse en un *dash* o cuando una pausa deja de ser una pausa entre caracteres para convertirse en una pausa entre palabras o cuando una pausa es simplemente un cambio de marca morse.
La funcion encargada de este calculo es `calculateThresholds`.
Lo que supuse para este calculo es tomar el punto medio entre cada centroide de los clusters para establecer un threshold que puede ser usado para clasificar el largo de un bit (1, 3 o 7).

```javascript
/*
    Threshold 1-3: El promedio entre los primeros dos centroides para obtener
    el umbral de juego entre lo que podria ser un dot o un dash.
    Threshold 3-7: El promedio entre el segundo y el tercer centroide para obtener
    el umbral de juego entre lo que van a ser los distintos tipos de pausas.

    Como se puede ver al final de cada calculo, estoy aplicando una multiplicacion
    por valores minimos, pero lo suficientemente utiles como para que hagan
    que los calculos se acomoden y los casos que probe hayan salido bien.
*/
const threshold1to3 = Math.round(((timeUnits[0] + timeUnits[1]) / 2) * 1.1);
const threshold3to7 = Math.round(((timeUnits[1] + timeUnits[2]) / 2) * 0.94);
```

5. Ya tengo todo lo necesario calculado, ahora sencillamente debo iterar los pulsos y decodificar el valor morse al que corresponden en el metodo `getElement`.

## TODO
- Mejorar este documento, no esta explicado de forma muy clara.
- Mejorar algunos nombres de funciones, constantes, etc. Algunos no son claros.
- Encontrar mejores vias de calculo para **idealmente** no tener que usar valores ajustados a mano.
- Hacer una bateria de tests diversa y amplia para seguir mejorando la solucion y abarcar quizas mas casos de uso dentro del espectro bits->morse->human.