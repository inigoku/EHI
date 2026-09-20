# Láminas repintadas

Deja aquí una imagen con el **id de la lámina** por nombre y `prepare_images.py`
la usará en lugar de la que indica `SOURCES`, sin recortarla ni buscarle
recuadro: se da por hecho que ya viene limpia.

    poema_frialdad2.png     sustituye a la lámina de "Canto de muerte"
    libro1.jpg              sustituye a la apertura del libro primero

Valen `.png`, `.jpg`, `.webp` y `.tif`. Después:

    python3 edicion_poesia/scripts/prepare_images.py
    python3 edicion_poesia/scripts/build_interior.py
    python3 edicion_poesia/scripts/check_kdp.py

Los ids son los de `imagenes/procedencia.json`.

La caja de lámina mide 4,85 × 7,80", o sea proporción 0,622. De lo que ofrece
AI Studio, **2:3 es lo que mejor encaja**: llena el 93 % de la caja. Una imagen
apaisada llena el 35 %.
