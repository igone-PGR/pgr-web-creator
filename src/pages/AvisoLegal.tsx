import LegalLayout from "@/components/legal/LegalLayout";

const AvisoLegal = () => (
  <LegalLayout title="Aviso Legal" updatedAt="Julio 2026" draft>
    <h2>1. Identificación del prestador del servicio</h2>
    <p>
      En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios
      de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa
      de los siguientes datos identificativos del prestador del servicio:
    </p>
    <ul>
      <li><strong>Denominación social:</strong> BUENA GENTE Y GENTE BUENA, S.L.</li>
      <li><strong>Marca comercial:</strong> PGR Digital / Web Creator</li>
      <li><strong>N.I.F.:</strong> B26580001</li>
      <li><strong>Domicilio social:</strong> C/ Martín de los Heros nº52, 28008 Madrid</li>
      <li><strong>Correo electrónico:</strong>{" "}
        <a href="mailto:hello@pgrdigital.tech">hello@pgrdigital.tech</a>
      </li>
    </ul>

    <h2>2. Objeto</h2>
    <p>
      El presente Aviso Legal regula el uso del sitio web y de la plataforma Web Creator,
      titularidad de BUENA GENTE Y GENTE BUENA, S.L. El acceso y utilización del sitio
      atribuyen la condición de usuario e implican la aceptación de las presentes
      condiciones.
    </p>

    <h2>3. Propiedad intelectual e industrial</h2>
    <p>
      Todos los contenidos del sitio web (textos, imágenes, logos, marcas, software,
      diseños y demás elementos) son propiedad del prestador o de terceros que han
      autorizado su uso. Queda prohibida su reproducción, distribución, comunicación
      pública o transformación sin autorización expresa.
    </p>

    <h2>4. Responsabilidad</h2>
    <p>
      El prestador no se responsabiliza de los daños o perjuicios derivados del uso del
      sitio o de la información contenida en el mismo, ni de las consecuencias del uso
      indebido por parte de los usuarios.
    </p>

    <h2>5. Legislación y jurisdicción aplicable</h2>
    <p>
      El presente Aviso Legal se rige por la legislación española. Para la resolución de
      cualquier controversia, las partes se someten a los Juzgados y Tribunales de
      Madrid, salvo que la normativa aplicable disponga otra cosa.
    </p>

    <p className="text-xs italic mt-8">
      Este texto es un borrador provisional pendiente de revisión legal definitiva.
    </p>
  </LegalLayout>
);

export default AvisoLegal;
