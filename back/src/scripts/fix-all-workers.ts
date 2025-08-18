import supabase from '../config/supabase';

/**
 * Script para arreglar todos los workers y limpiar jobs corruptos
 */
async function fixAllWorkers() {
  try {
    console.log('🔧 [FIX-ALL-WORKERS] Starting comprehensive worker fix...');

    // 1. Limpiar jobs corruptos
    console.log('🧹 [FIX-ALL-WORKERS] Step 1: Cleaning corrupted jobs...');
    await cleanupCorruptedJobs();

    // 2. Marcar jobs stuck en processing como failed
    console.log('🔄 [FIX-ALL-WORKERS] Step 2: Marking stuck jobs as failed...');
    await markStuckJobsAsFailed();

    // 3. Reiniciar jobs failed recientemente
    console.log('🔄 [FIX-ALL-WORKERS] Step 3: Restarting recent failed jobs...');
    await restartRecentFailedJobs();

    // 4. Mostrar estadísticas finales
    console.log('📊 [FIX-ALL-WORKERS] Step 4: Final statistics...');
    await showFinalStats();

    console.log('✅ [FIX-ALL-WORKERS] All workers fixed successfully!');

  } catch (error) {
    console.error('❌ [FIX-ALL-WORKERS] Error during fix:', error);
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
      console.error('❌ [FIX-ALL-WORKERS] Error finding corrupted jobs:', selectError);
      return;
    }

    if (!corruptedJobs || corruptedJobs.length === 0) {
      console.log('✅ [FIX-ALL-WORKERS] No corrupted jobs found');
      return;
    }

    console.log(`🔍 [FIX-ALL-WORKERS] Found ${corruptedJobs.length} corrupted jobs`);

    // Eliminar jobs corruptos
    const jobIds = corruptedJobs.map(job => job.id);
    const { error: deleteError } = await supabase
      .from('queue_jobs')
      .delete()
      .in('id', jobIds);

    if (deleteError) {
      console.error('❌ [FIX-ALL-WORKERS] Error deleting corrupted jobs:', deleteError);
      return;
    }

    console.log(`✅ [FIX-ALL-WORKERS] Successfully deleted ${corruptedJobs.length} corrupted jobs`);

  } catch (error) {
    console.error('❌ [FIX-ALL-WORKERS] Error during corrupted jobs cleanup:', error);
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
      console.error('❌ [FIX-ALL-WORKERS] Error finding stuck jobs:', selectError);
      return;
    }

    if (!stuckJobs || stuckJobs.length === 0) {
      console.log('✅ [FIX-ALL-WORKERS] No stuck jobs found');
      return;
    }

    console.log(`🔍 [FIX-ALL-WORKERS] Found ${stuckJobs.length} stuck jobs`);

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
      console.error('❌ [FIX-ALL-WORKERS] Error marking stuck jobs as failed:', updateError);
      return;
    }

    console.log(`✅ [FIX-ALL-WORKERS] Successfully marked ${stuckJobs.length} stuck jobs as failed`);

  } catch (error) {
    console.error('❌ [FIX-ALL-WORKERS] Error during stuck jobs fix:', error);
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
      console.error('❌ [FIX-ALL-WORKERS] Error finding recent failed jobs:', selectError);
      return;
    }

    if (!recentFailedJobs || recentFailedJobs.length === 0) {
      console.log('✅ [FIX-ALL-WORKERS] No recent failed jobs to restart');
      return;
    }

    console.log(`🔍 [FIX-ALL-WORKERS] Found ${recentFailedJobs.length} recent failed jobs to restart`);

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
      console.error('❌ [FIX-ALL-WORKERS] Error restarting failed jobs:', updateError);
      return;
    }

    console.log(`✅ [FIX-ALL-WORKERS] Successfully restarted ${recentFailedJobs.length} failed jobs`);

  } catch (error) {
    console.error('❌ [FIX-ALL-WORKERS] Error during failed jobs restart:', error);
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
      console.error('❌ [FIX-ALL-WORKERS] Error getting final stats:', error);
      return;
    }

    const statusCounts = stats?.reduce((acc: any, job: any) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 [FIX-ALL-WORKERS] Final queue statistics:', statusCounts);

  } catch (error) {
    console.error('❌ [FIX-ALL-WORKERS] Error showing final stats:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixAllWorkers().catch(console.error);
}

export { fixAllWorkers }; 