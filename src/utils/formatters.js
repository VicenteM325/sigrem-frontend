/**
 * @param {string} fechaHora 
 * @returns {string}
 */
export const formatHora = (fechaHora) => {
  if (!fechaHora) return 'N/A';
  
  if (fechaHora.includes('T')) {
    const partes = fechaHora.split('T');
    if (partes.length > 1) {
      const horaCompleta = partes[1];
      return horaCompleta.substring(0, 5);
    }
  }
  
  if (fechaHora.includes(':')) {
    const partes = fechaHora.split(':');
    if (partes.length >= 2) {
      return `${partes[0]}:${partes[1]}`;
    }
  }
  
  return fechaHora;
};

/**
 * @param {string} fecha
 * @returns {string} 
 */
export const formatFecha = (fecha) => {
  if (!fecha) return 'N/A';
  
  let fechaStr = fecha;
  if (fecha.includes('T')) {
    fechaStr = fecha.split('T')[0];
  }
  
  const partes = fechaStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  
  return fechaStr;
};

/**
 * @param {string} fecha 
 * @returns {string} 
 */
export const formatFechaLarga = (fecha) => {
  if (!fecha) return 'N/A';
  
  let fechaStr = fecha;
  if (fecha.includes('T')) {
    fechaStr = fecha.split('T')[0];
  }
  
  const partes = fechaStr.split('-');
  if (partes.length === 3) {
    const fechaObj = new Date(partes[0], partes[1] - 1, partes[2]);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return fechaStr;
};