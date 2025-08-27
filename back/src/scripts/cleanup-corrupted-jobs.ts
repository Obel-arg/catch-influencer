import supabase from '../config/supabase';

/**
 * Script para limpiar jobs corruptos de la base de datos
 * Jobs corruptos son aquellos con datos inválidos o vacíos
 */
async function cleanupCorruptedJobs() {
  try { 

    // 1. Encontrar jobs con datos vacíos o inválidos
    const { data: corruptedJobs, error: selectError } = await supabase
      .from('queue_jobs')
      .select('*')
      .or('data.is.null,data.eq."{}",data.eq."null"');

    if (selectError) {
     
      return;
    }

    if (!corruptedJobs || corruptedJobs.length === 0) {
     
      return;
    }

   

    // 2. Mostrar información de los jobs corruptos
    for (const job of corruptedJobs) {
     
    }

    // 3. Eliminar jobs corruptos
    const jobIds = corruptedJobs.map(job => job.id);
    const { error: deleteError } = await supabase
      .from('queue_jobs')
      .delete()
      .in('id', jobIds);

    if (deleteError) {
     
      return;
    }

   

    // 4. Mostrar estadísticas actuales
    const { data: stats, error: statsError } = await supabase
      .from('queue_jobs')
      .select('status', { count: 'exact' });

    if (!statsError) {
      const statusCounts = stats?.reduce((acc: any, job: any) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});

     
    }

  } catch (error) {
   
  }
}

/**
 * Script para validar jobs existentes
 */
async function validateExistingJobs() {
  try {
   

    // Obtener todos los jobs activos
    const { data: activeJobs, error } = await supabase
      .from('queue_jobs')
      .select('*')
      .in('status', ['pending', 'processing']);

    if (error) {
     
      return;
    }

    if (!activeJobs || activeJobs.length === 0) {
     
      return;
    }

    

    let validJobs = 0;
    let invalidJobs = 0;

    for (const job of activeJobs) {
      try {
        // Intentar parsear los datos
        const jobData = typeof job.data === 'string' ? JSON.parse(job.data) : job.data;
        
        // Validar según el tipo de worker
        let isValid = false;
        
        switch (job.name) {
          case 'metrics':
            isValid = jobData && jobData.postId && jobData.postUrl && jobData.platform;
            break;
          case 'sentiment':
            isValid = jobData && jobData.postId;
            break;
          case 'comment-fetch':
            isValid = jobData && jobData.postId && jobData.postUrl && jobData.platform;
            break;
          default:
            isValid = jobData && typeof jobData === 'object';
        }

        if (isValid) {
          validJobs++;
        } else {
          invalidJobs++;
         
        }
      } catch (parseError) {
        invalidJobs++;
       
      }
    }

   

  } catch (error) {
   
  }
}

// Ejecutar scripts
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'cleanup':
      await cleanupCorruptedJobs();
      break;
    case 'validate':
      await validateExistingJobs();
      break;
    case 'all':
      await cleanupCorruptedJobs();
      await validateExistingJobs();
      break;
    default:
        
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

export { cleanupCorruptedJobs, validateExistingJobs }; 