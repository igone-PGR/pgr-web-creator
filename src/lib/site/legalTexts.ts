// Generates baseline legal pages (Aviso Legal + Política de Privacidad) from
// the project data collected in the form. Fields we don't have (NIF/CIF,
// razón social, domicilio fiscal) are left as explicit [COMPLETAR] placeholders
// so the client knows they must be reviewed before going live.

import type { GeneratedSite } from "./types";

export interface LegalContext {
  businessName: string;
  siteUrl?: string | null;      // final vercel_url when known; else placeholder
  contactEmail?: string | null; // business email preferred, fallback to contact email
  address?: string | null;      // physical address if provided in the form
  language?: string;
}

const PLACEHOLDER = {
  legalName: "[Razón social o nombre completo del titular – COMPLETAR]",
  nif: "[NIF/CIF – COMPLETAR]",
  fiscalAddress: "[Domicilio fiscal – COMPLETAR]",
  registry: "[Datos registrales, si procede – COMPLETAR]",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function noticeBlock(): string {
  return `<div class="legal-notice"><strong>⚠️ Aviso importante:</strong> Este texto legal es una plantilla base generada automáticamente a partir de los datos facilitados. <strong>No sustituye el asesoramiento jurídico profesional.</strong> Antes de publicar tu web, revisa y completa los campos marcados como <em>[COMPLETAR]</em> y valida el contenido con un profesional del derecho.</div>`;
}

export function buildAvisoLegal(ctx: LegalContext): string {
  const email = ctx.contactEmail || "[Email de contacto – COMPLETAR]";
  const address = ctx.address || PLACEHOLDER.fiscalAddress;
  const url = ctx.siteUrl || "[URL del sitio web]";
  return `
${noticeBlock()}
<h1>Aviso Legal</h1>
<p>En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilita la siguiente información:</p>

<h2>1. Datos identificativos del titular</h2>
<ul>
  <li><strong>Titular:</strong> ${PLACEHOLDER.legalName}</li>
  <li><strong>Nombre comercial:</strong> ${esc(ctx.businessName)}</li>
  <li><strong>NIF/CIF:</strong> ${PLACEHOLDER.nif}</li>
  <li><strong>Domicilio:</strong> ${esc(address)}</li>
  <li><strong>Correo electrónico:</strong> ${esc(email)}</li>
  <li><strong>Sitio web:</strong> ${esc(url)}</li>
  <li><strong>Datos registrales:</strong> ${PLACEHOLDER.registry}</li>
</ul>

<h2>2. Objeto</h2>
<p>El presente Aviso Legal regula el uso del sitio web ${esc(url)} (en adelante, "el Sitio Web"), del que es titular ${PLACEHOLDER.legalName}. La navegación por el Sitio Web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.</p>

<h2>3. Condiciones de uso</h2>
<p>El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que el titular ofrece a través de su Sitio Web y a no emplearlos para incurrir en actividades ilícitas o contrarias a la buena fe y al ordenamiento legal.</p>

<h2>4. Propiedad intelectual e industrial</h2>
<p>Todos los contenidos del Sitio Web (textos, imágenes, logotipos, diseño gráfico, código fuente, etc.) son titularidad del titular o de terceros que han autorizado su uso, y están protegidos por la normativa nacional e internacional de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa.</p>

<h2>5. Responsabilidad</h2>
<p>El titular no se hace responsable de los daños y perjuicios que pudieran derivarse del uso indebido del Sitio Web, ni de los contenidos e informaciones accesibles o facilitados a través del mismo. Asimismo, no garantiza la ausencia de virus u otros elementos que puedan producir alteraciones en los sistemas informáticos del usuario.</p>

<h2>6. Enlaces</h2>
<p>El Sitio Web puede contener enlaces a páginas de terceros. El titular no asume responsabilidad alguna sobre el contenido o las prácticas de privacidad de dichos sitios.</p>

<h2>7. Legislación aplicable y jurisdicción</h2>
<p>El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales del domicilio del titular, salvo que la normativa aplicable disponga otra cosa.</p>

<p class="legal-updated">Última actualización: ${new Date().toLocaleDateString("es-ES")}.</p>
`;
}

export function buildPrivacidad(ctx: LegalContext): string {
  const email = ctx.contactEmail || "[Email de contacto – COMPLETAR]";
  const address = ctx.address || PLACEHOLDER.fiscalAddress;
  return `
${noticeBlock()}
<h1>Política de Privacidad</h1>
<p>De conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), se informa a los usuarios de lo siguiente:</p>

<h2>1. Responsable del tratamiento</h2>
<ul>
  <li><strong>Responsable:</strong> ${PLACEHOLDER.legalName} (${esc(ctx.businessName)})</li>
  <li><strong>NIF/CIF:</strong> ${PLACEHOLDER.nif}</li>
  <li><strong>Dirección:</strong> ${esc(address)}</li>
  <li><strong>Correo electrónico:</strong> ${esc(email)}</li>
</ul>

<h2>2. Finalidades del tratamiento</h2>
<p>Los datos personales que el usuario facilite serán tratados con las siguientes finalidades:</p>
<ul>
  <li>Gestionar las consultas, solicitudes de información o comunicaciones remitidas a través del sitio web o por correo electrónico.</li>
  <li>Prestar los servicios contratados y gestionar la relación comercial.</li>
  <li>Cumplir con las obligaciones legales aplicables.</li>
</ul>

<h2>3. Legitimación</h2>
<p>La base legal para el tratamiento de los datos es el consentimiento del interesado, la ejecución de un contrato o el cumplimiento de una obligación legal, según corresponda en cada caso.</p>

<h2>4. Conservación de los datos</h2>
<p>Los datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recabados y para determinar las posibles responsabilidades derivadas de dicha finalidad, además de los plazos legalmente establecidos.</p>

<h2>5. Destinatarios</h2>
<p>No se cederán datos a terceros salvo obligación legal. En caso de utilizar prestadores de servicios (hosting, email, analítica), estos actuarán como encargados del tratamiento con las debidas garantías contractuales.</p>

<h2>6. Derechos del usuario</h2>
<p>El usuario puede ejercer en cualquier momento los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar el consentimiento prestado, dirigiéndose por escrito a <strong>${esc(email)}</strong>, acompañando copia de un documento identificativo.</p>
<p>Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>) si considera que sus derechos no han sido debidamente atendidos.</p>

<h2>7. Seguridad de los datos</h2>
<p>El responsable adopta las medidas técnicas y organizativas necesarias para garantizar la seguridad e integridad de los datos personales tratados y evitar su pérdida, alteración o acceso por parte de terceros no autorizados.</p>

<h2>8. Modificaciones</h2>
<p>El responsable se reserva el derecho a modificar la presente política para adaptarla a novedades legislativas o jurisprudenciales.</p>

<p class="legal-updated">Última actualización: ${new Date().toLocaleDateString("es-ES")}.</p>
`;
}

export interface LegalPage {
  slug: "aviso-legal" | "privacidad";
  title: string;
  bodyHtml: string;
}

export function buildLegalPages(site: GeneratedSite, ctx: LegalContext): LegalPage[] {
  return [
    { slug: "aviso-legal", title: "Aviso Legal", bodyHtml: buildAvisoLegal(ctx) },
    { slug: "privacidad", title: "Política de Privacidad", bodyHtml: buildPrivacidad(ctx) },
  ];
}
