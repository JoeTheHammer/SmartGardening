const int analogPin = A0;  // Analog pin where the sensor is connected
const int ledPin = 13;    // LED pin for indication

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int sensorValue = analogRead(analogPin);
  float voltage = sensorValue * (5.0 / 1023.0);  // Convert ADC value to voltage
  float ppm = map(voltage, 0.1, 4.0, 0, 1000);  // Map voltage to PPM (parts per million)

  Serial.print("Sensor Value: ");
  Serial.print(sensorValue);
  Serial.print(", Voltage: ");
  Serial.print(voltage);
  Serial.print("V, PPM: ");
  Serial.println(ppm);

  // You can set a threshold for gas detection and turn on an LED as an indicator
  if (ppm > 200) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Gas detected!");
  } else {
    digitalWrite(ledPin, LOW);
  }

  delay(1000);  // Delay for readability, adjust as needed
}
