import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react";

export function About() {
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="amber" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Acerca del Sistema
          </Typography>
        </CardHeader>
        <CardBody>
          <Typography variant="h5" color="blue-gray" className="mb-4">
            SIGREM - Sistema de Gestión
          </Typography>
          <Typography className="mb-2">
            Versión: 1.0.0
          </Typography>
          <Typography className="mb-2">
            Fecha: {new Date().toLocaleDateString()}
          </Typography>
          <Typography>
            Esta es una página de prueba para verificar que el menú funciona correctamente.
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
}

export default About;