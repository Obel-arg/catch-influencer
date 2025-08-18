import supabase from '../config/supabase';

/**
 * Script para limpiar jobs corruptos de la base de datos
 * Jobs corruptos son aquellos con datos inválidos o vacíos
 */
async function cleanupCorruptedJobs() {
  try {
    console.log('🧹 [CLEANUP] Starting corrupted jobs cleanup...');

    // 1. Encontrar jobs con datos vacíos o inválidos
    const { data: corruptedJobs, error: selectError } = await supabase
      .from('queue_jobs')
      .select('*')
      .or('data.is.null,data.eq."{}",data.eq."null"');

    if (selectError) {
      console.error('❌ [CLEANUP] Error finding corrupted jobs:', selectError);
      return;
    }

    if (!corruptedJobs || corruptedJobs.length === 0) {
      console.log('✅ [CLEANUP] No corrupted jobs found');
      return;
    }

    console.log(`🔍 [CLEANUP] Found ${corruptedJobs.length} corrupted jobs`);

    // 2. Mostrar información de los jobs corruptos
    for (const job of corruptedJobs) {
      console.log(`📋 [CLEANUP] Corrupted job:`, {
        id: job.id,
        name: job.name,
        status: job.status,
        data: job.data,
        created_at: job.created_at,
        attempts: job.attempts
      });
    }

    // 3. Eliminar jobs corruptos
    const jobIds = corruptedJobs.map(job => job.id);
    const { error: deleteError } = await supabase
      .from('queue_jobs')
      .delete()
      .in('id', jobIds);

    if (deleteError) {
      console.error('❌ [CLEANUP] Error deleting corrupted jobs:', deleteError);
      return;
    }

    console.log(`✅ [CLEANUP] Successfully deleted ${corruptedJobs.length} corrupted jobs`);

    // 4. Mostrar estadísticas actuales
    const { data: stats, error: statsError } = await supabase
      .from('queue_jobs')
      .select('status', { count: 'exact' });

    if (!statsError) {
      const statusCounts = stats?.reduce((acc: any, job: any) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});

      console.log('📊 [CLEANUP] Current queue stats:', statusCounts);
    }

  } catch (error) {
    console.error('❌ [CLEANUP] Error during cleanup:', error);
  }
}

/**
 * Script para validar jobs existentes
 */
async function validateExistingJobs() {
  try {
    console.log('🔍 [VALIDATION] Starting job validation...');

    // Obtener todos los jobs activos
    const { data: activeJobs, error } = await supabase
      .from('queue_jobs')
      .select('*')
      .in('status', ['pending', 'processing']);

    if (error) {
      console.error('❌ [VALIDATION] Error getting active jobs:', error);
      return;
    }

    if (!activeJobs || activeJobs.length === 0) {
      console.log('✅ [VALIDATION] No active jobs to validate');
      return;
    }

    console.log(`🔍 [VALIDATION] Validating ${activeJobs.length} active jobs`);

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
          console.log(`❌ [VALIDATION] Invalid job ${job.id}:`, {
            name: job.name,
            status: job.status,
            data: jobData
          });
        }
      } catch (parseError) {
        invalidJobs++;
        console.log(`❌ [VALIDATION] Job ${job.id} has invalid JSON data:`, job.data);
      }
    }

    console.log(`📊 [VALIDATION] Results: ${validJobs} valid, ${invalidJobs} invalid jobs`);

  } catch (error) {
    console.error('❌ [VALIDATION] Error during validation:', error);
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
      console.log('Usage: npm run cleanup-jobs [cleanup|validate|all]');
      console.log('  cleanup: Remove corrupted jobs');
      console.log('  validate: Check existing jobs for validity');
      console.log('  all: Run both cleanup and validation');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

export { cleanupCorruptedJobs, validateExistingJobs }; 