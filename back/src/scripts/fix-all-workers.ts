import supabase from '../config/supabase';

/**
 * Script para arreglar todos los workers y limpiar jobs corruptos
 */
async function fixAllWorkers() {
  try {
   

    // 1. Limpiar jobs corruptos
   
    await cleanupCorruptedJobs();

    // 2. Marcar jobs stuck en processing como failed
   
    await markStuckJobsAsFailed();

    // 3. Reiniciar jobs failed recientemente
   
    await restartRecentFailedJobs();

    // 4. Mostrar estadísticas finales
   
    await showFinalStats();

   

  } catch (error) {
   
  }
}

/**
 * Limpiar jobs corruptos
 */
async function cleanupCorruptedJobs() {
  try {
    // Encontrar jobs con datos vacíos o inválidos
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

   

    // Eliminar jobs corruptos
    const jobIds = corruptedJobs.map(job => job.id);
    const { error: deleteError } = await supabase
      .from('queue_jobs')
      .delete()
      .in('id', jobIds);

    if (deleteError) {
     
      return;
    }

   

  } catch (error) {
   
  }
}

/**
 * Marcar jobs stuck en processing como failed
 */
async function markStuckJobsAsFailed() {
  try {
    // Encontrar jobs que han estado en processing por más de 10 minutos
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const { data: stuckJobs, error: selectError } = await supabase
      .from('queue_jobs')
      .select('*')
      .eq('status', 'processing')
      .lt('started_at', tenMinutesAgo.toISOString());

    if (selectError) {
     
      return;
    }

    if (!stuckJobs || stuckJobs.length === 0) {

      return;
    }

   

    // Marcar como failed
    const jobIds = stuckJobs.map(job => job.id);
    const { error: updateError } = await supabase
      .from('queue_jobs')
      .update({
        status: 'failed',
        error: 'Job stuck in processing for more than 10 minutes',
        updated_at: new Date()
      })
      .in('id', jobIds);

    if (updateError) {
     
      return;
    }

   

  } catch (error) {
   
  }
}

/**
 * Reiniciar jobs failed recientemente
 */
async function restartRecentFailedJobs() {
  try {
    // Encontrar jobs que fallaron en la última hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { data: recentFailedJobs, error: selectError } = await supabase
      .from('queue_jobs')
      .select('*')
      .eq('status', 'failed')
      .gte('updated_at', oneHourAgo.toISOString())
      .lt('attempts', 3); // Solo jobs con menos de 3 intentos

    if (selectError) {
     
      return;
    }

    if (!recentFailedJobs || recentFailedJobs.length === 0) {
     
      return;
    }

   

    // Reiniciar jobs
    const jobIds = recentFailedJobs.map(job => job.id);
    const { error: updateError } = await supabase
      .from('queue_jobs')
      .update({
        status: 'pending',
        error: undefined,
        started_at: undefined,
        completed_at: undefined,
        updated_at: new Date()
      })
      .in('id', jobIds);

    if (updateError) {
     
      return;
    }

   

  } catch (error) {
   
  }
}

/**
 * Mostrar estadísticas finales
 */
async function showFinalStats() {
  try {
    const { data: stats, error } = await supabase
      .from('queue_jobs')
      .select('status', { count: 'exact' });

    if (error) {
     
      return;
    }

    const statusCounts = stats?.reduce((acc: any, job: any) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    

  } catch (error) {
   
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixAllWorkers().catch(console.error);
}

export { fixAllWorkers }; 