# Antesala Reservaciones

Sistema interno de gestión de reservaciones para La Antesala (espacios para eventos, comida, bebidas, depósitos y facturas).

## Qué incluye

- **Reservaciones** con vista Próximas / Archivo (pasadas se archivan por fecha)
- **Nueva / editar** reservación: cliente, salón, buffet, platos, bebidas, entremeses, postres, servicios
- **Pagos y depósitos** con historial
- **Calendario** y **análisis** (ingresos por mes, depósitos pendientes, uso de salones)
- **Añadir ítems** (menú compartido en la nube)
- **Factura PDF** y **exportar respaldo JSON**
- Sync en la nube con **Firebase Firestore** (fallback a `localStorage`)

## Cómo usar

1. Abre `index.html` en el navegador, o sirve la carpeta con un servidor estático.
2. Configura Firebase en `firebase-config.js` y publica `firestore.rules` (ver `DEPLOY_RULES.md`).
3. Crea reservaciones desde **Nueva Reservación**.
4. Gestiona listado, pagos y facturas en **Reservaciones**.
5. Usa **Exportar respaldo** para descargar un JSON de todas las reservaciones.

Atajos (solo en el formulario de reservación): `Ctrl+S` guardar, `Ctrl+Enter` calcular.

## Stack

- HTML / CSS / JavaScript (una sola página)
- Firebase Firestore (compat SDK)
- jsPDF (se carga al exportar factura)

## Archivos principales

| Archivo | Rol |
|---------|-----|
| `index.html` | UI |
| `script.js` | Lógica de la app |
| `styles.css` | Estilos |
| `firebase-config.js` | Proyecto Firebase |
| `firestore.rules` | Reglas de seguridad |

## Notas

- App operativa interna: incluye `noindex` en el HTML.
- Los salones se muestran como Salón 1 / 2 / 3.
- Si Firestore falla al guardar, los cambios quedan en el dispositivo y se muestra un aviso.
