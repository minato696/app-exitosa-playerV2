// src/schedule.ts
export interface ScheduleProgram {
  name: string;
  host: string;
  startTime: string;
  endTime: string;
  image?: string;
  description?: string;
}

// Programación de Lunes a Viernes
export const weekdaySchedule: ScheduleProgram[] = [
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
export const saturdaySchedule: ScheduleProgram[] = [
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
export const sundaySchedule: ScheduleProgram[] = [
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