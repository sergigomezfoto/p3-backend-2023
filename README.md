# EXPLICACIÓ:
* He posat un diagrama.png amb la imatge gràfica de la bbdd i 
* un video_explicacio.mkv amb una mica d'explicació del context, ja que la api
que faig va referida directament a una aplicació feta en KRPANO (https://krpano.com/docu/xml/).

* També hi ha el insomnia_2023-06-04.json que conté els endpoints, 
* i el insomnia_enviroment_var.json que conté els variables d'entorn del insomnia.

* el arxiu .en és en realitat el .env

#
#
#
#


# Backend en Typescript, Express y Prisma

Se trata de hacer un _backend_ usando Typescript, Express y Prisma. El _backend_ implementado en clase es el modelo a seguir. Para alumnos que lo hacen por primera vez y sienten algo de incomodidad, lo ideal es usar el modelo de guía y hacer un _backend_ cercano al original de tal manera que la práctica sea un repaso a fondo. Para los que estén más cómodos, lo ideal es innovar en algun aspecto y salirse parcialmente del modelo en ciertos momentos o explorar algún interés personal.

El modelo de datos debe ser original y algo personal de cada uno, quizás incluso una API que se podría hacer pública eventualmente. Es importante que el _backend_ incluya, para la mayoría de entidades, todas las operaciones CRUD (es decir, que no solo sea una API de puras consultas como la de [Pokémons](https://pokeapi.co)). Dado que el _backend_ tiene alrededor de 4 endpoints por entidad, es recomendable no sobrepasar las 5 o 6 entidades, de lo contrario el volumen de trabajo crece demasiado. Aún así, hay formas de controlar esa complejidad, así que si álguien tiene interés en hacer muchas entidades, podemos comentar cómo abordarlo.

Al usar Prisma, es quizás buena idea explorar proveedores de Prisma que no sean precisamente Postgres, ya que el coste de hacerlo es mínimo (aunque esto no es obligatorio para nada). Aparte de los proveedores locales alternativos a Postgres, existen también opciones en la nube equivalentes a Postgres como [PlanetScale](https://www.prisma.io/docs/guides/database/planetscale), [CockroachDB](https://www.prisma.io/docs/guides/database/cockroachdb) o [Supabase](https://www.prisma.io/docs/guides/database/supabase), bien explicadas en la documentación de Prisma.

## Entregable

Como anteriormente, para hacer esta práctica hay que:
- Hacer un _fork_ de este repositorio.
- Trabajar en el _fork_ haciendo commits regularmente (una práctica que aparece entera en un solo commit tendrá una nota muy baja o cero, hay que mostrar todo el proceso intermedio).
- Al finalizar, se debe crear un `ZIP` del repositorio (que incluya el fichero `.env`!) y entregarlo en el [Campus Online de UPC School](https://talent.upc.edu) (habrá una tarea preparada para ello).

El entregable es el código del proyecto, incluyendo:
- `docker-compose.yml` si la base de datos corre bajo Docker.
- El código completo del servidor.
- Un fichero exportado de [Insomnia](https://insomnia.rest/download) con la lista de _endpoints_ que se han probado. (Esto es **extremadamente** relevante porque la corrección del backend, de no tener este fichero, es un trabajo muchísimo más tedioso!).
- Si se necesitan credenciales para acceder a servicios de cloud (o incluso localmente), es importante incluir en el ZIP del campus el fichero `.env` con éstas. Es muy importante no subir ese fichero en GitHub (es decir, incluirlo en `.gitignore`).
