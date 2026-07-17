import LegalLayout from "@/components/legal/LegalLayout";

const Privacidad = () => (
  <LegalLayout title="Política de Privacidad" updatedAt="Julio 2026" draft>
    <h2>1. Responsable del tratamiento</h2>
    <ul>
      <li><strong>Denominación social:</strong> BUENA GENTE Y GENTE BUENA, S.L.</li>
      <li><strong>N.I.F.:</strong> B26580001</li>
      <li><strong>Domicilio:</strong> C/ Martín de los Heros nº52, 28008 Madrid</li>
      <li><strong>Correo electrónico:</strong>{" "}
        <a href="mailto:hello@pgrdigital.tech">hello@pgrdigital.tech</a>
      </li>
    </ul>

    <h2>2. Finalidad del tratamiento</h2>
    <p>
      Los datos personales facilitados a través de los formularios de la plataforma
      Web Creator serán tratados con las siguientes finalidades:
    </p>
    <ul>
      <li>Gestionar la solicitud y generación de la propuesta de web.</li>
      <li>Tramitar el pago y la contratación del servicio.</li>
      <li>Publicar y desplegar la web contratada.</li>
      <li>Prestar soporte y gestionar la ronda de cambios incluida.</li>
      <li>Emitir facturas y cumplir con las obligaciones legales aplicables.</li>
      <li>
        Enviar comunicaciones operativas relacionadas con el servicio contratado.
      </li>
    </ul>

    <h2>3. Legitimación</h2>
    <p>
      La base jurídica del tratamiento es la ejecución del contrato o de medidas
      precontractuales solicitadas por el usuario, el cumplimiento de obligaciones
      legales aplicables y, en su caso, el consentimiento del interesado para
      comunicaciones comerciales.
    </p>

    <h2>4. Conservación de los datos</h2>
    <p>
      Los datos se conservarán durante el tiempo necesario para la prestación del
      servicio y, posteriormente, durante los plazos legalmente exigibles para atender
      posibles responsabilidades.
    </p>

    <h2>5. Destinatarios</h2>
    <p>
      No se cederán datos a terceros salvo obligación legal. Los datos podrán ser
      tratados por proveedores de servicios que actúen como encargados del tratamiento
      (alojamiento, pasarela de pago, herramientas de IA, correo electrónico) con las
      garantías previstas por la normativa vigente.
    </p>

    <h2>6. Derechos de los interesados</h2>
    <p>
      Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición,
      limitación del tratamiento y portabilidad dirigiéndote a{" "}
      <a href="mailto:hello@pgrdigital.tech">hello@pgrdigital.tech</a>. Igualmente,
      puedes presentar una reclamación ante la Agencia Española de Protección de Datos
      (www.aepd.es).
    </p>

    <h2>7. Seguridad</h2>
    <p>
      Se aplican las medidas técnicas y organizativas necesarias para garantizar la
      seguridad, integridad y confidencialidad de los datos personales tratados.
    </p>

    <p className="text-xs italic mt-8">
      Este texto es un borrador provisional pendiente de revisión legal definitiva.
    </p>
  </LegalLayout>
);

export default Privacidad;
