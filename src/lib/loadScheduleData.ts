// src/lib/loadScheduleData.ts
import { db } from './db';

interface ProgramData {
  name: string;
  host: string;
  startTime: string;
  endTime: string;
  dayType: 'weekday' | 'saturday' | 'sunday';
}

// Programación de Lunes a Viernes
const weekdayPrograms: ProgramData[] = [
  { name: "La Hora Esotérica", host: "Soralla De Los Angeles", startTime: "00:00", endTime: "01:00", dayType: "weekday" },
  { name: "Usted Tiene Derecho", host: "Mario Camacho Perla", startTime: "01:00", endTime: "02:00", dayType: "weekday" },
  { name: "La Voz De Los Pueblos", host: "Jack Miranda y Marcial De La Cruz", startTime: "02:00", endTime: "05:00", dayType: "weekday" },
  { name: "Exitosa Perú", host: "Pedro Paredes", startTime: "05:00", endTime: "08:00", dayType: "weekday" },
  { name: "Hablemos Claro", host: "Nicolás Lúcar", startTime: "08:00", endTime: "11:00", dayType: "weekday" },
  { name: "Exitosa Te Escucha", host: "Katyusca Torres Aybar", startTime: "11:00", endTime: "14:00", dayType: "weekday" },
  { name: "Exitosa Deportes", host: "Gonzalo Núñez, Óscar Paz y Jean Rodríguez", startTime: "14:00", endTime: "16:00", dayType: "weekday" },
  { name: "Contra El Tráfico", host: "Ricardo Rondón", startTime: "16:00", endTime: "18:00", dayType: "weekday" },
  { name: "Médicos En Acción", host: "Armando Massé", startTime: "18:00", endTime: "19:00", dayType: "weekday" },
  { name: "Informamos y Opinamos", host: "Karina Novoa", startTime: "19:00", endTime: "22:00", dayType: "weekday" },
  { name: "Exitosa Noticias", host: "Juriko Novoa", startTime: "22:00", endTime: "23:00", dayType: "weekday" },
  { name: "Despierta Tus Emociones", host: "José Poicón", startTime: "23:00", endTime: "00:00", dayType: "weekday" }
];

// Programación del Sábado
const saturdayPrograms: ProgramData[] = [
  { name: "La Hora Esotérica", host: "Esotéricos", startTime: "00:00", endTime: "01:00", dayType: "saturday" },
  { name: "Educando Mis Emociones", host: "Dra. Danila Villegas", startTime: "01:00", endTime: "02:00", dayType: "saturday" },
  { name: "La Voz De Los Pueblos", host: "Jack Miranda", startTime: "02:00", endTime: "05:00", dayType: "saturday" },
  { name: "Exitosa Perú", host: "Pedro Paredes", startTime: "05:00", endTime: "08:00", dayType: "saturday" },
  { name: "Hablemos Claro", host: "Jesús Verde", startTime: "08:00", endTime: "11:00", dayType: "saturday" },
  { name: "Construyendo Cimientos Para El Futuro", host: "Jose Cieza", startTime: "11:00", endTime: "12:00", dayType: "saturday" },
  { name: "Derrama Magisterial", host: "Carlos Cornejo", startTime: "12:00", endTime: "13:00", dayType: "saturday" },
  { name: "Exitosa Deportes", host: "Óscar Paz", startTime: "13:00", endTime: "15:00", dayType: "saturday" },
  { name: "Exitosa Sábado", host: "Katyusca Torres Aybar", startTime: "15:00", endTime: "18:00", dayType: "saturday" },
  { name: "La Hora Del Volante", host: "Tito Alvites", startTime: "18:00", endTime: "20:00", dayType: "saturday" },
  { name: "Exitosa Te Escucha", host: "Jorge Valdez", startTime: "20:00", endTime: "22:00", dayType: "saturday" },
  { name: "Noche Esotérica", host: "Vidente Hayimy", startTime: "22:00", endTime: "00:00", dayType: "saturday" }
];

// Programación del Domingo
const sundayPrograms: ProgramData[] = [
  { name: "Noche Esotérica", host: "Vidente Hayimy", startTime: "00:00", endTime: "01:00", dayType: "sunday" },
  { name: "La Voz de los Pueblos", host: "Hierbero", startTime: "01:00", endTime: "02:00", dayType: "sunday" },
  { name: "La Voz de los Pueblos", host: "Marcial de la Cruz", startTime: "02:00", endTime: "06:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Piura", startTime: "06:00", endTime: "07:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Cusco", startTime: "07:00", endTime: "08:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Arequipa", startTime: "08:00", endTime: "09:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Trujillo", startTime: "09:00", endTime: "10:00", dayType: "sunday" },
  { name: "En Defensa de la Verdad", host: "Cecilia García", startTime: "10:00", endTime: "12:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Chiclayo", startTime: "12:00", endTime: "13:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Huancayo", startTime: "13:00", endTime: "14:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Huacho", startTime: "14:00", endTime: "15:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Ica", startTime: "15:00", endTime: "16:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Iquitos", startTime: "16:00", endTime: "17:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Tacna", startTime: "17:00", endTime: "18:00", dayType: "sunday" },
  { name: "Exitosa Perú", host: "Tarapoto", startTime: "18:00", endTime: "19:00", dayType: "sunday" },
  { name: "Médicos en Acción", host: "Daniel Bueno", startTime: "19:00", endTime: "21:00", dayType: "sunday" },
  { name: "Exitosa Deportes", host: "Óscar Paz", startTime: "21:00", endTime: "22:00", dayType: "sunday" },
  { name: "Noche Esotérica", host: "Vidente Hayimy", startTime: "22:00", endTime: "00:00", dayType: "sunday" }
];

// Función para cargar todos los programas
export async function loadAllPrograms(stationId: string = 'lima', clearExisting: boolean = true) {
  try {
    // Limpiar programas existentes si se solicita
    if (clearExisting) {
      await db.execute({
        sql: 'DELETE FROM programs WHERE station_id = ?',
        args: [stationId]
      });
      console.log(`Programas existentes eliminados para ${stationId}`);
    }
    
    // Combinar todos los programas
    const allPrograms = [...weekdayPrograms, ...saturdayPrograms, ...sundayPrograms];
    
    // Insertar todos los programas
    for (const program of allPrograms) {
      await db.execute({
        sql: `INSERT INTO programs (station_id, name, host, start_time, end_time, day_type) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          stationId,
          program.name,
          program.host,
          program.startTime,
          program.endTime,
          program.dayType
        ]
      });
    }
    
    console.log(`Se insertaron ${allPrograms.length} programas para ${stationId}`);
    
    return {
      success: true,
      count: allPrograms.length,
      breakdown: {
        weekday: weekdayPrograms.length,
        saturday: saturdayPrograms.length,
        sunday: sundayPrograms.length
      }
    };
  } catch (error) {
    console.error('Error al cargar programas:', error);
    throw error;
  }
}

// Función para cargar programas en todas las estaciones
export async function loadProgramsForAllStations() {
  try {
    // Obtener todas las estaciones activas
    const stations = await db.execute({
      sql: 'SELECT id, name FROM stations WHERE active = 1',
      args: []
    });
    
    const results = [];
    
    for (const station of stations.rows) {
      console.log(`Cargando programas para ${station.name}...`);
      const result = await loadAllPrograms(station.id as string, true);
      results.push({
        stationId: station.id,
        stationName: station.name,
        ...result
      });
    }
    
    return {
      success: true,
      stations: results
    };
  } catch (error) {
    console.error('Error al cargar programas para todas las estaciones:', error);
    throw error;
  }
}