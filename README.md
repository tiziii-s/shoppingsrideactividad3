# Shoppings Ride – Grupo 4

Sitio web del recorrido temático **Shoppings Ride**, trabajo grupal de Diseño y Desarrollo Web (UADE, 2026). Profesora: Patricia Litovicius.

## Objetivo
Brindar información sobre cuatro shoppings de CABA y GBA (propuestas, horarios, accesos, transporte, accesibilidad y recomendaciones) para planificar una salida de compras, entretenimiento y gastronomía.

- **Tema y categoría:** recorrido temático por shoppings.
- **Público:** personas que quieren salir de compras, ir al cine o comer.

## Funcionalidades principales
- Página de inicio con presentación, paradas, mapa general y destacados.
- Mapa interactivo con el orden sugerido del recorrido.
- Una página por shopping: Alto Avellaneda, Boulevard Adrogué, Unicenter y Shopping Caballito.
- Formulario «Armá tu visita»: paquete, personas, adicionales, total en USD y ARS (**simulación**, sin pagos).
- Formulario de contacto con validaciones (**simulación**, no envía mensajes).
- Preguntas frecuentes y asistente por palabras clave.
- Diseño Mobile First, navegable por teclado y con textos alternativos.

## Tecnologías
HTML5 · Tailwind CSS 3.4.17 (CDN) · JavaScript sin frameworks.

## API y servicios externos
- Leaflet 1.9.4 y OpenStreetMap (mapas).
- DolarAPI.com (tipo de cambio oficial USD → ARS; con valor de referencia si falla).
- Google Fonts (Inder y Judson).

## Estructura
```
index.html · mapa.html · alto-avellaneda.html · boulevard-adrogue.html
unicenter.html · shopping-caballito.html
css/estilos.css   js/main.js   fotos/
```

## Cómo ejecutarlo
Abrir `index.html` en el navegador (se necesita internet para Tailwind, mapas y tipo de cambio), o visitar el sitio desplegado.

## Enlaces
- Sitio: https://tiziii-s.github.io/SHOPPINGSRIDE/
- Prototipo: https://www.figma.com/proto/7668wMVPBsPMhYDh81UIWG/Untitled?node-id=6-10&p=f&t=Kytf6TVCfLZlsUaE-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1
- Design System (Figma): https://www.figma.com/design/7668wMVPBsPMhYDh81UIWG/Untitled?node-id=0-1&t=gXbt0Bs4bKRabsxs-1

## Integrantes y contribuciones
> Ajustar según lo que cada una/o haya hecho realmente en el historial de commits.

| Integrante | Contribución |
|---|---|
| Esperidioni Valentina | Página de Alto Avellaneda (contenido, imágenes) |
| Turus Constanza | Página de Boulevard Adrogué (contenido, imágenes) |
| Marthi Julieta | Página de Unicenter (contenido, imágenes) |
| Scarpitta Tiziano | Página de Shopping Caballito, repositorio y despliegue |

## Recursos
Fotografías seleccionadas por el grupo en la Actividad 2; mapas © OpenStreetMap; fuentes de Google Fonts (OFL).
