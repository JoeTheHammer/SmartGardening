#include <WiFiNINA.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

#define NO_OTA_NETWORK
#include <ArduinoOTA.h> // only for InternalStorage


//config for local AP
const char SSID[] = "MKR1010";
const char PASS[] = "123456789";

//config for local server
int status = WL_IDLE_STATUS; //connection status
WiFiServer server(80); //server availabe on port 80


//config for OTA HTTP update
WiFiClient    wifiClient;  // HTTP


/**
Connection to backend server to get new image
**/
const int SERVER_PORT = 5000;

void handleSketchDownload(String server_ip) {
  const char* SERVER = server_ip.c_str();     // Set hostname
  String path = "/api/device/update/";        // Set the URI for device
  path.concat(getMacString());                // append MAC to URI
  const char* PATH = path.c_str();            // make it constant
  const unsigned long CHECK_INTERVAL = 6000;  // Time interval between update checks (ms)

  // Time interval check
  static unsigned long previousMillis;
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis < CHECK_INTERVAL)
    return;
  previousMillis = currentMillis;

  HttpClient client(wifiClient, SERVER, SERVER_PORT);

  char buff[32];
  snprintf(buff, sizeof(buff), PATH, 1);

  Serial.print("Check for update file ");
  Serial.println(buff);

  // Make the GET request
  client.get(buff);

  int statusCode = client.responseStatusCode();
  Serial.print("Update status code: ");
  Serial.println(statusCode);
  if (statusCode != 200) {
    client.stop();
    return;
  }

  long length = client.contentLength();
  if (length == HttpClient::kNoContentLengthHeader) {
    client.stop();
    Serial.println("Server didn't provide Content-length header. Can't continue with update.");
    return;
  }
  Serial.print("Server returned update file of size ");
  Serial.print(length);
  Serial.println(" bytes");

  if (!InternalStorage.open(length)) {
    client.stop();
    Serial.println("There is not enough space to store the update. Can't continue with update.");
    return;
  }
  byte b;
  while (length > 0) {
    if (!client.readBytes(&b, 1)) // reading a byte with timeout
      break;
    InternalStorage.write(b);
    length--;
  }
  InternalStorage.close();
  client.stop();
  if (length > 0) {
    Serial.print("Timeout downloading update file at ");
    Serial.print(length);
    Serial.println(" bytes. Can't continue with update.");
    return;
  }

  Serial.println("Sketch update apply and reset.");
  Serial.flush();
  InternalStorage.apply(); // this doesn't return
}


String getMacString(){
  byte mac[6];
  String macString = "";

  WiFi.macAddress(mac);
  macString += String(mac[5], HEX);
  macString += String(mac[4], HEX);
  macString += String(mac[3], HEX);
  macString += String(mac[2], HEX);
  macString += String(mac[1], HEX);
  macString += String(mac[0], HEX);
  return macString;
}


String getJsonDataRegister(String macString){
  String jsonPayload;
  DynamicJsonDocument doc(200);
  doc["id"] = macString;
  serializeJson(doc, jsonPayload);
  return jsonPayload;
}


void sendJsonPost(const char* server, const int port, String path, String postData, String* response){
  WiFiClient myClient;

  if (myClient.connect(server, port)){
    Serial.print("[+]OK: Connected to http//");
    Serial.print(server);
    Serial.print(":");
    Serial.print(port);
    Serial.println(path);
    myClient.print
    (
      String("POST ") + path + " HTTP/1.1\r\n" +
      "Content-Type: application/json\r\n" +
      "Content-Length: " + postData.length() + "\r\n" +
      "\r\n" +
      postData
    );
  }
  else {
    Serial.print("[!]Error: Failed to send post to http//");
    Serial.print(server);
    Serial.print(":");
    Serial.print(port);
    Serial.println(path);
  }
  
  //wait for data from server
  while(myClient.available()==0){;}
  while(myClient.available()){
    *response +=  myClient.readString();
  }
}


void sendRegisterDevicePost(const char* server, const int port, String macString){
  String result = "";
  sendJsonPost(server, port, "/api/device/register", getJsonDataRegister(macString), &result);
  Serial.println(result);
}


void connectToWifi(String wifi_ssid, String wifi_pass){
  WiFi.end();

  Serial.println("Initialize WiFi");
  status = WL_IDLE_STATUS;
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(wifi_ssid);
    status = WiFi.begin(wifi_ssid.c_str(), wifi_pass.c_str());
  }
  Serial.println("WiFi connected");
}

/**
Local server functions start here
**/

void localServer(){
  if (status != WiFi.status()) {
    // it has changed update the variable
    status = WiFi.status();

    if (status == WL_AP_CONNECTED) {
      // a device has connected to the AP
      Serial.println("Device connected to AP");
    } else {
      // a device has disconnected from the AP, and we are back in listening mode
      Serial.println("Device disconnected from AP");
    }
  }

  WiFiClient client = server.available();
  if (client) {                             // if you get a client,
    Serial.println("new client");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    while (client.connected()) {            // loop while the client's connected
      delayMicroseconds(10);                // This is required for the Arduino Nano RP2040 Connect - otherwise it will loop so fast that SPI will never be served.
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out to the serial monitor
        if (c == '\n') {                    // if the byte is a newline character

          //default page served by the AP.
          //this displays a drop down option to select a wifi network
          //also a field is requiered to provide the wifi pass
          //also the IP of the main server has to be included.
          if (currentLine.length() == 0) {
            // HTTP header
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println();

            // the content of the HTTP response follows the header:
            client.print(getDefaultHTML());

            // The HTTP response ends with another blank line:
            client.println();
            break;
          }
          // received a new line
          else{
            //check if valid request
            if(currentLine.indexOf("serverIP") != -1){
              String wifi_ssid = currentLine.substring(currentLine.indexOf("?wifi="), currentLine.indexOf("&passwd="));
              wifi_ssid.replace("?wifi=", "");
              wifi_ssid.trim();
              String wifi_pass = currentLine.substring(currentLine.indexOf("&passwd="), currentLine.indexOf("&serverIP="));
              wifi_pass.replace("&passwd=", "");
              wifi_pass.trim();
              String server_ip = currentLine.substring(currentLine.indexOf("&serverIP="), currentLine.indexOf("HTTP"));
              server_ip.replace("&serverIP=", "");
              server_ip.trim();

              //Serial.println(wifi_ssid);
              //Serial.println(wifi_pass);
              //Serial.println(server_ip);

              connectToWifi(wifi_ssid, wifi_pass);
              sendRegisterDevicePost(server_ip.c_str(), SERVER_PORT, getMacString());
              while(true){
                handleSketchDownload(server_ip);
              }
            }
            //clear currentLine
            currentLine = "";
          }
        }
        else if (c != '\r') {    // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }
      }
    }
    client.stop();
    Serial.println("client disconnected");
    }
}


String getDefaultHTML() {
  String data = "";
  data += "<!DOCTYPE html>\n";
  data += "<html>\n";
  data += "<body>\n";

  data += "<h1>Setup WiFi network</h1>\n";

  data += "<form action='/' id='network_form'>\n";
  data += "  <lable for='networks'>WiFi name:</label>\n";
  data += "  <input type='text' id='wifi' name='wifi'>\n";
  data += "  <br>\n";
  data += "  <lable for='passwd'>Password:</label>\n";
  data += "  <input type='text' id='passwd' name='passwd'>\n";
  data += "  <br>\n";
  data += "  <lable for='serverIP'>Server IP:</label>\n";
  data += "  <input type='text' id='serverIP' name='serverIP'>\n";
  data += "  <br>\n";
  data += "  <input type='submit'>\n";

  data += "</form>\n";
  data += "</body>\n";
  data += "</html>";

  return data;
}


/**
Access Point Creation
**/

void printWiFiStatus() {
  // print the SSID of the network
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}

void createAP(){
  Serial.print("Creating access point named: ");
  Serial.println(SSID);

  // Create access point with ssid and pass mentioned above.
  status = WiFi.beginAP(SSID, PASS);
  if (status != WL_AP_LISTENING) {
    Serial.println("Creating access point failed");
    // don't continue
    while (true);
  }
  delay(10000);
  // start the web server on port 80
  server.begin();
  printWiFiStatus();
}


void setup() {
  Serial.begin(9600);
  while (!Serial);

  createAP();
}


void loop() {
  localServer();
}