const ExcelJS = require('exceljs');
const path = require('path');

async function generateTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Contenidos');

  // Define columns
  worksheet.columns = [
    { header: 'Título', key: 'title', width: 30 },
    { header: 'Fecha', key: 'date', width: 15 },
    { header: 'Influencer', key: 'influencer', width: 20 },
    { header: 'Plataforma', key: 'platform', width: 15 },
    { header: 'Tipo de Contenido', key: 'contentType', width: 20 },
    { header: 'Descripción', key: 'description', width: 40 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Add instruction row
  const instructionRow = worksheet.addRow([
    'Post promocional',
    '18/11/2025',
    'Juan Pérez',
    'Instagram',
    'Post',
    'Post promocionando el nuevo producto'
  ]);
  instructionRow.font = { italic: true, color: { argb: 'FF808080' } };

  // Add more example rows
  worksheet.addRow([
    'Video tutorial',
    '20/11/2025',
    'María González',
    'YouTube',
    'Video',
    'Tutorial de uso del producto'
  ]);

  worksheet.addRow([
    'Historia del día',
    '22/11/2025',
    'Carlos Rodríguez',
    'Instagram',
    'Story',
    'Behind the scenes del evento'
  ]);

  // Add instructions sheet
  const instructionsSheet = workbook.addWorksheet('Instrucciones');
  instructionsSheet.columns = [
    { header: 'Campo', key: 'field', width: 25 },
    { header: 'Descripción', key: 'description', width: 60 },
    { header: 'Valores Permitidos', key: 'allowed', width: 40 }
  ];

  // Style header
  instructionsSheet.getRow(1).font = { bold: true, size: 12 };
  instructionsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' }
  };
  instructionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add instructions
  instructionsSheet.addRow([
    'Título',
    'Nombre descriptivo del contenido (obligatorio)',
    'Texto libre'
  ]);

  instructionsSheet.addRow([
    'Fecha',
    'Fecha de publicación programada (obligatorio)',
    'Formato: DD/MM/YYYY o DD-MM-YYYY'
  ]);

  instructionsSheet.addRow([
    'Influencer',
    'Nombre del influencer asignado a la campaña (obligatorio)',
    'Debe coincidir exactamente con el nombre en la campaña'
  ]);

  instructionsSheet.addRow([
    'Plataforma',
    'Red social donde se publicará (obligatorio)',
    'Instagram, YouTube, TikTok, Twitter'
  ]);

  instructionsSheet.addRow([
    'Tipo de Contenido',
    'Tipo de publicación según la plataforma (obligatorio)',
    'Instagram: Post, Reel, Story, Carrusel | YouTube: Video, Short | TikTok: Video | Twitter: Post'
  ]);

  instructionsSheet.addRow([
    'Descripción',
    'Descripción detallada del contenido (opcional)',
    'Texto libre'
  ]);

  // Add notes
  instructionsSheet.addRow([]);
  const notesRow = instructionsSheet.addRow(['NOTAS IMPORTANTES:']);
  notesRow.font = { bold: true, size: 13 };

  instructionsSheet.addRow([
    '',
    '1. Los campos obligatorios NO pueden estar vacíos',
    ''
  ]);

  instructionsSheet.addRow([
    '',
    '2. El nombre del influencer debe coincidir exactamente con el nombre registrado en la campaña',
    ''
  ]);

  instructionsSheet.addRow([
    '',
    '3. Las plataformas y tipos de contenido distinguen mayúsculas/minúsculas',
    ''
  ]);

  instructionsSheet.addRow([
    '',
    '4. Las filas con errores serán omitidas y se reportarán al final',
    ''
  ]);

  // Save file
  const templatePath = path.join(__dirname, '../public/templates/plantilla-contenidos.xlsx');
  await workbook.xlsx.writeFile(templatePath);
  console.log('✅ Template created successfully at:', templatePath);
}

generateTemplate().catch(console.error);
