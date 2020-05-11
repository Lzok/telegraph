# Telegraph
Telegraph to help us converting a string of bits into morse code or human readable text.

[ES/EN]: Proximamente disponible la version en ingles de este documento.

- [Prerrequisitos](#Prerrequisitos)
- [Setup](#Setup)
    - [Produccion](#Produccion)
- [Problema](#Problema)
- [Planteo de solucion](#Planteo-de-solucion)
    - [Solucion experimental](#Solucion-experimental)
- [Proximos pasos](#Proximos-pasos)
- [Referencias](#Referencias)
- [Licencia](#Licencia)

## Prerrequisitos

- [Node v12.16.3 LTS](https://nodejs.org/en/)
- Recomiendo utilizar por practicidad un gestor de versiones de Node, como [nvm](https://github.com/nvm-sh/nvm)
- **Opcional** - [Docker](https://docs.docker.com/get-docker/)

    Se puede ver la imagen generada para produccion en el [repositorio de Dockerhub](https://hub.docker.com/repository/docker/lzok/telegraph).


## Problema

El enunciado completo del problema puede encontrarse [aca](https://github.com/Lzok/telegraph/blob/master/Problem.md)


## Planteo de solucion

En [este documento](https://github.com/Lzok/telegraph/blob/master/Solution.md) describo la forma en que pense la solucion del problema.

### Solucion experimental
En [este otro documento](https://github.com/Lzok/telegraph/blob/master/Solution%20KMeans.md) describo la forma en que resuelvo este problema utilizando un algoritmo de clusterizacion llamado K-Means, adaptado particularmente a esta situacion.

Esta solucion esta en etapa **experimental**, tomar recaudos. Toda contribucion a mejorarla y estabilizarla es bienvenida y apreciada!

## Setup

- Clonar el repositorio en un directorio a su eleccion.

```bash
git clone https://github.com/Lzok/telegraph .
```

- Instalar las dependencias

```bash
npm install
```

- Copiar el archivo de entorno ejemplo al que sera efectivamente usado y llenar las variables con la informacion deseada

```bash
cp .env.example .env 

# Abrir el archivo .env con cualquier editor y editar las siguientes variables

# Entorno de Node. development en este caso
NODE_ENV=development
# Puerto donde se correra la API. Puede ser cualquiera a eleccion.
PORT=3000
```

- Correr la API

```bash
npm run dev

# O mediante Docker
# Los flags pasados a este comando son para evitar algunos inconvenientes de cache
# O que la imagen resultante no esta 100% actualizada mientras desarrollamos.
# Ademas, se usa el archivo docker-compose.dev.yml que corresponde a la version de desarrollo
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --force-recreate --build
```

- Endpoints

Podes ver la documentacion para los endpoints disponibles en la ruta `http://localhost:<PORT>/api/v1/docs`

La misma fue generada con [Swagger](https://swagger.io/)

- Tests

Para correr la suite de tests, se debe dejar corriendo la API y en otra terminal ejecutar alguno de los siguientes comandos:

```bash
# Correr la suite completa (unit + integration)
npm run test

# Solo unit tests
npm run test:unit

# Solo integration tests
npm run test:integration
```

- Hook pre-commit

    Antes de efectivizar cada commit se ejecuta el linter del codigo y se corren los test unitarios. Queda pendiente que corra la suite completa, por el momento no lo decidi de esta forma debido a que no quiero forzar a instalar Docker a quien no quiera.
    
   
### Produccion

Se puede probar el build de la imagen productiva que genera docker con el siguiente comando:
`docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --force-recreate --build`

## Proximos pasos
- Implementar busqueda dicotomica con un arbol
- Implementar a modo de prueba la busqueda en lista.
- **Game changer level**: Plantear pruebas utilizando algoritmos de clusterizacion como K-means para asi poder, en teoria,
decodificar mensajes que no sean constantes dentro del mismo.

## Referencias
Lista de referencias utilizadas acerca del tema durante el desarrollo. Todas ellas online al dia de la fecha (05-05-2020)

- [Morse Standard (ITU)](https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.1677-1-200910-I!!PDF-E.pdf)
- [Wikipedia - Morse Code](https://en.wikipedia.org/wiki/Morse_code)
- [Wikipedia - Dichotomic Search](https://en.wikipedia.org/wiki/Dichotomic_search)
- [Wikipedia - Huffman Coding](https://en.wikipedia.org/wiki/Huffman_coding)
- [Wikipedia - Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)
- [Post Stack Exchange](https://cs.stackexchange.com/questions/39920/is-morse-code-binary-ternary-or-quinary)
- [Morse Timing](https://morsecode.world/international/timing.html)
- [A Robust Real-Time Automatic Recognition Prototype for Maritime Optical Morse-Based Communication Employing Modified Clustering Algorithm](https://www.mdpi.com/2076-3417/10/4/1227/htm#)
- [Description of RSCW's algorithms](http://www.pa3fwm.nl/software/rscw/algorithm.html)
- [The Levenshtein Algorithm](https://www.cuelogic.com/blog/the-levenshtein-algorithm)
- [Post Stack Exchange (2)](https://ham.stackexchange.com/questions/2202/decoding-the-morse-code)
- [Unstable Morse code recognition with adaptive variable-ratio threshold prediction for physically disabled persons.](https://www.ncbi.nlm.nih.gov/pubmed/11001520)
- [How Efficient Is Morse Code](https://www.johndcook.com/blog/2017/02/08/how-efficient-is-morse-code/)
- [Dominant Speeds Of Morse Communications](https://ham.stackexchange.com/questions/14679/dominant-speeds-of-morse-communications)
- [Morse Code Binary Discussion](https://chat.stackexchange.com/rooms/21638/morse-code-and-binary-discussion)
- [Morse code recognition system with fuzzy algorithm for disabled persons](https://www.researchgate.net/publication/10985617_Morse_code_recognition_system_with_fuzzy_algorithm_for_disabled_persons)
- [An Automatic Decoding Method for Morse Signal based on Clustering Algorithm](https://link.springer.com/chapter/10.1007%2F978-3-319-50209-0_29)
- [Morse Recognition Algorithm Based on K-means](https://ieeexplore.ieee.org/document/8799149)


## Licencia

**GNU AFFERO GENERAL PUBLIC LICENSE**

La licencia completa la podes chequear [aca](https://github.com/Lzok/telegraph/blob/master/LICENSE)