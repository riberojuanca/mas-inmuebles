// Config central: editá acá, no en el resto del código.
// Las fotos de la grilla se toman automáticamente de src/assets/images/
// (todo lo que pongas ahí aparece, no hace falta listarlas acá).

export const CONFIG = {
  // Título, precio y descripción que aparecen arriba de las fotos
  propertyTitle: "Dos casas, un mismo predio · Fray Bentos, Río Negro",
  // Versión corta del título, para la navbar (poco espacio)
  propertyTitleShort: "Dos casas · Fray Bentos",
  propertyPrice: "USD 70.000",
  propertyDescription: [
    "Propiedad ideal para vivienda o inversión. La casa del frente tiene garage, patio, cocina, baño, un dormitorio, living comedor y una pieza pensada para un negocio. La casa del fondo suma patio parrillero, patio interno con reja, cocina, baño, un dormitorio y living comedor.",
    "Podés usarlas por separado, alquilar una y vivir en la otra, o conectarlas abriendo una pared y tener una casa entera.",
    "Con todos los permisos en regla y lista para escriturar.",
  ],

  // Se muestran con ícono debajo de la descripción
  propertyLocation: "Covena 2, Solar A, 33/79, a dos cuadras del cementerio de Fray Bentos.",
  contactPhone: "091 060 941",

  // Número en formato internacional, sin "+" ni espacios
  whatsappNumber: "59891060941",

  // Mensaje que se precarga en WhatsApp
  whatsappMessage: "Hola! Vi el anuncio de la casa en venta y quiero más información.",

  // TODO: logo para el círculo de la esquina (poné el archivo en public/logo/)
  logo: "logo/logo.png",

  // TODO: tu reel/video (poné el archivo en public/video/)
  storyVideo: "video/reel.mp4",

  // TODO opcional: ID de conversión de Google Ads, formato "AW-XXXXXXXXX/XXXXXXXXXXXXXXXXXXXX"
  // Dejalo vacío ("") hasta tener la conversión creada en Google Ads.
  googleAdsConversionId: "",

  // Fotos que no se muestran en la grilla, por número de archivo (ej. 6 = 06.jpg).
  // El archivo no se borra, solo se oculta. Sacá el número de la lista para que vuelva a aparecer.
  hiddenPhotos: [6, 9, 11, 14, 17, 19, 21, 23, 24, 33, 35, 46, 50],
};
