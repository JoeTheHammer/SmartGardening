export enum SensorType {
  TEMPERATURE_HUMIDITY = "Temperature/Humidity",
  AIR_QUALITY = "AirQuality",
  MOISTURE = "Moisture",
}

export enum MeasureValue {
  TEMPERATURE = "Temperature",
  HUMIDITY = "Humidity",
  AIR_QUALITY = "AirQuality",
  MOISTURE = "Moisture"
}

export enum DeviceType {
  SENSOR = "Sensor",
  ACTUATOR = "Actuator"
}

export function getSensorTypeFromString(str: string | null): SensorType | null {
  if (str === null){
    return null;
  }
  for (const key in SensorType) {
    if (SensorType[key as keyof typeof SensorType] === str) {
      return SensorType[key as keyof typeof SensorType];
    }
  }
  return null;
}

export function getMeasureValueFromString(str: string): MeasureValue | null {
  for (const key in MeasureValue) {
    if (MeasureValue[key as keyof typeof MeasureValue] === str) {
      return MeasureValue[key as keyof typeof MeasureValue];
    }
  }
  return null
}

  export function getDeviceTypeFromString(str: string): DeviceType | null {
    for (const key in DeviceType) {
      if (DeviceType[key as keyof typeof DeviceType] === str) {
        return DeviceType[key as keyof typeof DeviceType];
      }
    }
    return null;
}
