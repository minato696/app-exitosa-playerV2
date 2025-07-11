// scripts/load-programs.js
require('dotenv').config({ path: '.env.local' });

async function loadPrograms() {
  try {
    console.log('📺 Cargando programación de todas las estaciones...');
    
    const { loadProgramsForAllStations, closeConnection } = require('../src/lib/loadScheduleData');
    
    const result = await loadProgramsForAllStations();
    
    if (result.success) {
      console.log('\n✅ Programación cargada exitosamente!');
      console.log('\n📊 Resumen:');
      result.stations.forEach(station => {
        console.log(`\n  📻 ${station.stationName}:`);
        console.log(`     - Total: ${station.count} programas`);
        console.log(`     - Lun-Vie: ${station.breakdown.weekday}`);
        console.log(`     - Sábado: ${station.breakdown.saturday}`);
        console.log(`     - Domingo: ${station.breakdown.sunday}`);
      });
    }
    
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cargar programas:', error);
    process.exit(1);
  }
}

loadPrograms();