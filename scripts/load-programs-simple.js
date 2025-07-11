// scripts/load-programs-simple.js
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:vaRoyzzbIDPomLyNxXtwNfHQyYmflCaD@tramway.proxy.rlwy.net:14988/railway';

// Programación de Lunes a Viernes
const weekdayPrograms = [
  { name: "La Hora Esotérica", host: "Soralla De Los Angeles", startTime: "00:00", endTime: "01:00" },
  { name: "Usted Tiene Derecho", host: "Mario Camacho Perla", startTime: "01:00", endTime: "02:00" },
  { name: "La Voz De Los Pueblos", host: "Jack Miranda y Marcial De La Cruz", startTime: "02:00", endTime: "05:00" },
  { name: "Exitosa Perú", host: "Pedro Paredes", startTime: "05:00", endTime: "08:00" },
  { name: "Hablemos Claro", host: "Nicolás Lúcar", startTime: "08:00", endTime: "11:00" },
  { name: "Exitosa Te Escucha", host: "Katyusca Torres Aybar", startTime: "11:00", endTime: "14:00" },
  { name: "Exitosa Deportes", host: "Gonzalo Núñez, Óscar Paz y Jean Rodríguez", startTime: "14:00", endTime: "16:00" },
  { name: "Contra El Tráfico", host: "Ricardo Rondón", startTime: "16:00", endTime: "18:00" },
  { name: "Médicos En Acción", host: "Armando Massé", startTime: "18:00", endTime: "19:00" },
  { name: "Informamos y Opinamos", host: "Karina Novoa", startTime: "19:00", endTime: "22:00" },
  { name: "Exitosa Noticias", host: "Juriko Novoa", startTime: "22:00", endTime: "23:00" },
  { name: "Despierta Tus Emociones", host: "José Poicón", startTime: "23:00", endTime: "00:00" }
];

// Programación del Sábado
const saturdayPrograms = [
  { name: "La Hora Esotérica", host: "Esotéricos", startTime: "00:00", endTime: "01:00" },
  { name: "Educando Mis Emociones", host: "Dra. Danila Villegas", startTime: "01:00", endTime: "02:00" },
  { name: "La Voz De Los Pueblos", host: "Jack Miranda", startTime: "02:00", endTime: "05:00" },
  { name: "Exitosa Perú", host: "Pedro Paredes", startTime: "05:00", endTime: "08:00" },
  { name: "Hablemos Claro", host: "Jesús Verde", startTime: "08:00", endTime: "11:00" },
  { name: "Construyendo Cimientos Para El Futuro", host: "Jose Cieza", startTime: "11:00", endTime: "12:00" },
  { name: "Derrama Magisterial", host: "Carlos Cornejo", startTime: "12:00", endTime: "13:00" },
  { name: "Exitosa Deportes", host: "Óscar Paz", startTime: "13:00", endTime: "15:00" },
  { name: "Exitosa Sábado", host: "Katyusca Torres Aybar", startTime: "15:00", endTime: "18:00" },
  { name: "La Hora Del Volante", host: "Tito Alvites", startTime: "18:00", endTime: "20:00" },
  { name: "Exitosa Te Escucha", host: "Jorge Valdez", startTime: "20:00", endTime: "22:00" },
  { name: "Noche Esotérica", host: "Vidente Hayimy", startTime: "22:00", endTime: "00:00" }
];

// Programación del Domingo
const sundayPrograms = [
  { name: "Noche Esotérica", host: "Vidente Hayimy", startTime: "00:00", endTime: "01:00" },
  { name: "La Voz de los Pueblos", host: "Hierbero", startTime: "01:00", endTime: "02:00" },
  { name: "La Voz de los Pueblos", host: "Marcial de la Cruz", startTime: "02:00", endTime: "06:00" },
  { name: "Exitosa Perú", host: "Piura", startTime: "06:00", endTime: "07:00" },
  { name: "Exitosa Perú", host: "Cusco", startTime: "07:00", endTime: "08:00" },
  { name: "Exitosa Perú", host: "Arequipa", startTime: "08:00", endTime: "09:00" },
  { name: "Exitosa Perú", host: "Trujillo", startTime: "09:00", endTime: "10:00" },
  { name: "En Defensa de la Verdad", host: "Cecilia García", startTime: "10:00", endTime: "12:00" },
  { name: "Exitosa Perú", host: "Chiclayo", startTime: "12:00", endTime: "13:00" },
  { name: "Exitosa Perú", host: "Huancayo", startTime: "13:00", endTime: "14:00" },
  { name: "Exitosa Perú", host: "Huacho", startTime: "14:00", endTime: "15:00" },
  { name: "Exitosa Perú", host: "Ica", startTime: "15:00", endTime: "16:00" },
  { name: "Exitosa Perú", host: "Iquitos", startTime: "16:00", endTime: "17:00" },
  { name: "Exitosa Perú", host: "Tacna", startTime: "17:00", endTime: "18:00" },
  { name: "Exitosa Perú", host: "Tarapoto", startTime: "18:00", endTime: "19:00" },
  { name: "Médicos en Acción", host: "Daniel Bueno", startTime: "19:00", endTime: "21:00" },
  { name: "Exitosa Deportes", host: "Óscar Paz", startTime: "21:00", endTime: "22:00" },
  { name: "Noche Esotérica", host: "Vidente Hayimy", startTime: "22:00", endTime: "00:00" }
];

async function loadPrograms() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📻 Cargando programación para todas las estaciones...\n');
    
    // Obtener solo las 4 estaciones específicas
    const stationsResult = await pool.query(`
      SELECT id, name FROM stations 
      WHERE active = true 
      AND id IN ('lima', 'arequipa', 'trujillo', 'chiclayo')
      ORDER BY id
    `);
    const stations = stationsResult.rows;
    
    console.log(`📡 ${stations.length} estaciones encontradas\n`);
    
    for (const station of stations) {
      console.log(`\n📻 Cargando programas para ${station.name}...`);
      
      // Limpiar programas existentes
      await pool.query('DELETE FROM programs WHERE station_id = $1', [station.id]);
      
      let programCount = 0;
      
      // Insertar programas de lunes a viernes
      for (const program of weekdayPrograms) {
        await pool.query(`
          INSERT INTO programs (station_id, name, host, start_time, end_time, day_type) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [station.id, program.name, program.host, program.startTime, program.endTime, 'weekday']);
        programCount++;
      }
      
      // Insertar programas de sábado
      for (const program of saturdayPrograms) {
        await pool.query(`
          INSERT INTO programs (station_id, name, host, start_time, end_time, day_type) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [station.id, program.name, program.host, program.startTime, program.endTime, 'saturday']);
        programCount++;
      }
      
      // Insertar programas de domingo
      for (const program of sundayPrograms) {
        await pool.query(`
          INSERT INTO programs (station_id, name, host, start_time, end_time, day_type) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [station.id, program.name, program.host, program.startTime, program.endTime, 'sunday']);
        programCount++;
      }
      
      console.log(`   ✅ ${programCount} programas cargados`);
    }
    
    // Verificar total solo para las 4 estaciones
    const totalResult = await pool.query(`
      SELECT COUNT(*) as count FROM programs 
      WHERE station_id IN ('lima', 'arequipa', 'trujillo', 'chiclayo')
    `);
    console.log(`\n✅ Total de programas en la base de datos: ${totalResult.rows[0].count}`);
    console.log(`   (${weekdayPrograms.length} lun-vie + ${saturdayPrograms.length} sábado + ${sundayPrograms.length} domingo) x 4 estaciones`);
    
    await pool.end();
    console.log('\n🎉 ¡Programación cargada exitosamente para Lima, Arequipa, Trujillo y Chiclayo!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

loadPrograms();