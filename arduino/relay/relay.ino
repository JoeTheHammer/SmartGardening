int relay = 6;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(relay_1, OUTPUT);
}


void loop() {
  Serial.println("ON");
  digitalWrite(relay, HIGH);
  delay(1000);

  Serial.println("OFF");
  digitalWrite(relay, LOW);
  delay(1000);
}
