# Verificación de integración — Constancia de Servicio Existente

Fecha: 23 de octubre de 2026  
Ruta: `/solicitudes/servicio-existente`  
Endpoint: `POST /api/v1/solicitudes/servicio-existente`

## Resultado

La integración del frontend queda verificada mediante pruebas automatizadas de UI renderizada, validaciones, transformación del payload, documentos, firma, enrutamiento y contrato HTTP simulado.

La persistencia real y la consulta directa de base de datos quedan pendientes porque no existe un backend activo en `http://localhost:3000` ni código de backend/base de datos en este workspace.

## Cobertura contra el formulario original y el DTO

| Sección original | Implementación | Resultado |
| --- | --- | --- |
| Tipo de servicio | `tipoServicio`: Agua potable / Alcantarillado sanitario | Conforme |
| Datos del servicio | `nis`, `propietarioInmueble` | Conforme |
| Solicitante | `nombreSolicitante`, `identificacionSolicitante`, `correoElectronico`, `telefono` | Conforme |
| Propiedad | `folioReal`, `planoCatastrado`, `planoAgrimensura` | Conforme |
| Naturaleza y calidad | `naturalezaInmueble`, `calidadTitular` | Conforme al catálogo expuesto por el backend |
| Localización | `provincia`, `canton`, `distrito`, `direccionExacta` | Conforme |
| Motivo | Seis motivos del DTO más `Otro` | Conforme |
| Otro motivo | `otroMotivo`, visible y obligatorio solo al elegir `Otro` | Conforme |
| Trámite por realizar | `tramitePorRealizar` | Conforme |
| Notificaciones | medio principal y medio secundario distinto | Conforme al DTO del backend |
| Documentos | identificación y poder/autorización condicional | Conforme |
| Firma | data URL PNG generado por el lienzo | Conforme |
| Revisión | siete secciones y documentos cargados | Conforme |
| Campos administrativos | no se muestran ni se envían | Conforme |

## Motivos probados

1. Bono de vivienda.
2. Trámite bancario.
3. Visado municipal.
4. Conexión eléctrica.
5. Trámite notarial.
6. Exoneración de bienes inmuebles.
7. Otro, con especificación obligatoria.

## Pruebas ejecutadas

- Renderizado de los siete pasos y presencia de todos los campos ciudadanos.
- Ambos tipos de servicio aceptados por validación.
- Cada motivo aceptado individualmente.
- Rechazo de `Otro` sin descripción y aceptación con descripción.
- Aceptación de cada medio principal y rechazo de medios principal/secundario repetidos.
- Rechazo de solicitud sin identificación o firma.
- Exigencia de poder cuando la calidad es `Representante legal`.
- Exclusión de documentos incompletos o con error del payload final.
- Limpieza de espacios y exclusión de `otroMotivo` cuando no corresponde.
- POST a `/solicitudes/servicio-existente` con el payload exacto y procesamiento de respuesta HTTP 201.
- Registro de la ruta pública y ausencia de campos administrativos.
- Reglas responsivas para pantallas pequeñas.

Resultado automatizado: **55 pruebas aprobadas de 55**.

## Verificación pendiente con backend y base de datos

Para cerrar el criterio de persistencia debe ejecutarse, con backend y BD disponibles:

1. Subir un documento mediante `POST /api/v1/solicitudes/documentos`.
2. Enviar una solicitud completa y conservar el `codigoSeguimiento` retornado.
3. Consultar `GET /api/v1/solicitudes/seguimiento/:codigoSeguimiento`.
4. Confirmar en base de datos la solicitud, su detalle de constancia y las relaciones documentales.
5. Verificar `estado = PENDIENTE`, slug `servicio-existente` y ausencia de campos administrativos aportados por el cliente.

Hasta ejecutar esos pasos contra infraestructura real, el criterio “el trámite queda registrado correctamente” se considera **bloqueado por ambiente**, no fallido.
